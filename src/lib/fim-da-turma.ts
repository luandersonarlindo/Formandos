import "server-only";
import type { Pool, PoolClient } from "pg";
import { registrarAuditoria } from "./auditoria";
import { pool, transacao } from "./db";
import { emailExclusaoTurma, urlDoSite } from "./email";
import { enviarParaTurma, type Destinatario } from "./email-turma";
import { DIAS_AVISO_EXCLUSAO } from "./fim-da-turma-regras";

// Plano de fim da turma (ADR-0009). Um só caminho para excluir (comissão,
// master e prazo) e os avisos por email antes da exclusão automática.

export type QuemExclui = "admin" | "master" | "prazo";

// Apaga a turma e tudo dela, inclusive o histórico na auditoria. Fica só a
// linha `turma.excluida` (nome, data e quem), prova de que a exclusão
// aconteceu. Chamar dentro de uma transação.
export async function apagarTurma(
  db: PoolClient,
  t: { turmaId: string; nome: string; usuarioId: string | null; por: QuemExclui },
): Promise<void> {
  await db.query("delete from auditoria where turma_id = $1", [t.turmaId]);
  await registrarAuditoria(db, {
    usuarioId: t.usuarioId,
    turmaId: t.turmaId,
    acao: "turma.excluida",
    entidade: "turma",
    entidadeId: t.turmaId,
    detalhe: { nome: t.nome, por: t.por },
  });
  // Apaga em cascata membros, catálogos, votos, decisões, pagamentos,
  // convites, lembretes e o link público. A linha acima fica, sem turma.
  await db.query("delete from turmas where id = $1", [t.turmaId]);
}

// Todos os membros com email confirmado, mesmo quem desligou os emails da
// turma: o aviso de exclusão é sobre os dados da própria pessoa.
async function membrosParaAviso(db: Pool | PoolClient, turmaId: string): Promise<Destinatario[]> {
  const { rows } = await db.query<Destinatario>(
    `select u.id as "usuarioId", u.name as nome, u.email
       from membros m join usuarios u on u.id = m.usuario_id
      where m.turma_id = $1 and u."emailVerified"
      order by u.name`,
    [turmaId],
  );
  return rows;
}

// Aviso ao arquivar e ao mudar a data. Chamar dentro de `after()`.
export async function avisarExclusaoMarcada(d: {
  turmaId: string;
  turma: string;
  excluirEm: string;
  quem: string | null;
  momento: "arquivada" | "nova_data";
  // Quem fez a ação não precisa do email do que acabou de fazer.
  exceto?: string;
}): Promise<void> {
  const pessoas = (await membrosParaAviso(pool, d.turmaId)).filter((p) => p.usuarioId !== d.exceto);
  await enviarParaTurma(pessoas, (p) =>
    emailExclusaoTurma({
      nome: p.nome,
      turma: d.turma,
      momento: d.momento,
      excluirEm: d.excluirEm,
      quem: d.quem,
      url: urlDoSite("/conta"),
    }),
  );
}

// Rodada de lembretes: aviso de 7 dias antes, para cada membro que ainda não
// recebeu. Devolve quantos emails saíram; para no teto diário.
export async function avisarExclusoesProximas(hoje: string): Promise<number> {
  const { rows: turmas } = await pool.query(
    `select id, nome, to_char(excluir_em, 'YYYY-MM-DD') as excluir_em from turmas
      where arquivada_em is not null and excluir_em is not null
        and excluir_em <= $1::date + $2::int`,
    [hoje, DIAS_AVISO_EXCLUSAO],
  );
  let total = 0;
  for (const t of turmas) {
    const { rows: pessoas } = await pool.query<Destinatario>(
      `select u.id as "usuarioId", u.name as nome, u.email
         from membros m join usuarios u on u.id = m.usuario_id
        where m.turma_id = $1 and u."emailVerified"
          and not exists (
            select 1 from lembretes_enviados l
             where l.tipo = 'exclusao' and l.referencia = $1 and l.turma_id = $1 and l.usuario_id = m.usuario_id)`,
      [t.id],
    );
    for (const pessoa of pessoas) {
      const { enviados } = await enviarParaTurma([pessoa], (p) =>
        emailExclusaoTurma({
          nome: p.nome,
          turma: t.nome,
          momento: "proxima",
          excluirEm: t.excluir_em,
          quem: null,
          url: urlDoSite("/conta"),
        }),
      );
      if (enviados === 0) return total; // teto diário: a exclusão espera junto
      await pool.query(
        `insert into lembretes_enviados (tipo, referencia, turma_id, usuario_id)
         values ('exclusao', $1, $1, $2) on conflict do nothing`,
        [t.id, pessoa.usuarioId],
      );
      total++;
    }
  }
  return total;
}

// No máximo 20 turmas por rodada, uma por transação.
const MAX_EXCLUSOES_POR_RODADA = 20;

// Exclui as turmas arquivadas com a data vencida cujo aviso de 7 dias chegou a
// todos os membros com email confirmado há pelo menos 7 dias. Se o aviso
// atrasou (teto diário), a exclusão atrasa junto: nunca sem aviso.
export async function excluirTurmasNoPrazo(hoje: string): Promise<number> {
  const { rows } = await pool.query(
    `select t.id, t.nome from turmas t
      where t.arquivada_em is not null and t.excluir_em is not null
        and t.excluir_em <= $1::date
        and not exists (
          select 1 from membros m join usuarios u on u.id = m.usuario_id
           where m.turma_id = t.id and u."emailVerified"
             and not exists (
               select 1 from lembretes_enviados l
                where l.tipo = 'exclusao' and l.referencia = t.id and l.turma_id = t.id
                  and l.usuario_id = m.usuario_id
                  and l.created_at <= now() - make_interval(days => $2)))
      order by t.excluir_em
      limit $3`,
    [hoje, DIAS_AVISO_EXCLUSAO, MAX_EXCLUSOES_POR_RODADA],
  );
  let excluidas = 0;
  for (const t of rows) {
    const ok = await transacao(async (db) => {
      // Confere de novo com a linha travada: alguém pode ter desarquivado.
      const { rows: atual } = await db.query(
        `select nome from turmas where id = $1 and arquivada_em is not null
            and excluir_em is not null and excluir_em <= $2::date for update`,
        [t.id, hoje],
      );
      if (atual.length === 0) return false;
      await apagarTurma(db, { turmaId: t.id, nome: atual[0].nome, usuarioId: null, por: "prazo" });
      return true;
    });
    if (ok) excluidas++;
  }
  return excluidas;
}
