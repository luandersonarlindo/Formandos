import "server-only";
import { pool } from "./db";
import { emailPrazoParcela, emailPrazoPresenca, emailPrazoVotacao, urlDoSite } from "./email";
import { enviarParaTurma, type Destinatario } from "./email-turma";
import { avisarExclusoesProximas, excluirTurmasNoPrazo } from "./fim-da-turma";
import { HORAS_JANELA_VOTACAO, parcelasParaLembrar } from "./lembretes-regras";
import { contaComoFormandoSql } from "./papeis";
import { HORAS_JANELA_PRESENCA } from "./presenca-regras";
import { hojeBrasil, type TipoLancamento } from "./situacao-regras";

// Lembretes de prazo (ADR-0006), chamados por /api/cron/lembretes de hora em
// hora. Cada envio fica marcado em `lembretes_enviados`, então rodar de novo
// não repete email. Turma arquivada não recebe lembrete de prazo, só o aviso
// de exclusão do plano de fim (ADR-0009, em fim-da-turma.ts).

async function marcar(tipo: "votacao" | "parcela" | "presenca", referencia: string, turmaId: string, usuarioId: string) {
  await pool.query(
    `insert into lembretes_enviados (tipo, referencia, turma_id, usuario_id)
     values ($1, $2, $3, $4) on conflict do nothing`,
    [tipo, referencia, turmaId, usuarioId],
  );
}

// Votações com prazo nas próximas 48 horas, sem decisão: lembra quem ainda
// não votou nem recebeu este lembrete.
async function lembrarVotacoes(): Promise<number> {
  const { rows: votacoes } = await pool.query(
    `select r.turma_id, r.enquete_id, r.prazo, e.titulo, ca.catalogo_id, t.nome as turma
       from regras_enquete r
       join turmas t on t.id = r.turma_id and t.arquivada_em is null
       join enquetes e on e.id = r.enquete_id
       join categorias ca on ca.id = e.categoria_id
      where r.prazo > now() and r.prazo <= now() + make_interval(hours => $1)
        and not exists (select 1 from decisoes d where d.turma_id = r.turma_id and d.enquete_id = r.enquete_id)
        and not exists (select 1 from enquetes_ocultas eo where eo.turma_id = r.turma_id and eo.enquete_id = r.enquete_id)`,
    [HORAS_JANELA_VOTACAO],
  );
  let total = 0;
  for (const v of votacoes) {
    const { rows: pessoas } = await pool.query<Destinatario>(
      `select u.id as "usuarioId", u.name as nome, u.email
         from membros m join usuarios u on u.id = m.usuario_id
        where m.turma_id = $1 and ${contaComoFormandoSql("m")} and u.receber_emails and u."emailVerified"
          and not exists (
            select 1 from votos vo join opcoes o on o.id = vo.opcao_id
             where o.enquete_id = $2 and vo.turma_id = $1 and vo.usuario_id = m.usuario_id)
          and not exists (
            select 1 from lembretes_enviados l
             where l.tipo = 'votacao' and l.referencia = $2 and l.turma_id = $1 and l.usuario_id = m.usuario_id)`,
      [v.turma_id, v.enquete_id],
    );
    const url = urlDoSite(`/votacoes/${v.catalogo_id}#enquete-${v.enquete_id}`);
    for (const pessoa of pessoas) {
      const { enviados } = await enviarParaTurma([pessoa], (d) =>
        emailPrazoVotacao({ nome: d.nome, turma: v.turma, pergunta: v.titulo, prazo: v.prazo, url }),
      );
      if (enviados === 0) return total; // teto diário: tenta na próxima hora
      await marcar("votacao", v.enquete_id, v.turma_id, pessoa.usuarioId);
      total++;
    }
  }
  return total;
}

// Parcelas em aberto vencendo de hoje a daqui a 2 dias: lembra a própria
// pessoa, com o valor que falta na parcela dela.
async function lembrarParcelas(hoje: string): Promise<number> {
  const { rows: turmas } = await pool.query(
    `select distinct t.id, t.nome from turmas t join parcelas p on p.turma_id = t.id
      where t.arquivada_em is null`,
  );
  let total = 0;
  for (const turma of turmas) {
    const [{ rows: parcelas }, { rows: pessoas }, { rows: lancamentos }, { rows: enviados }] = await Promise.all([
      pool.query(
        `select id, numero, valor::float8 as valor, to_char(vencimento, 'YYYY-MM-DD') as vencimento
           from parcelas where turma_id = $1`,
        [turma.id],
      ),
      pool.query<Destinatario>(
        `select u.id as "usuarioId", u.name as nome, u.email
           from membros m join usuarios u on u.id = m.usuario_id
          where m.turma_id = $1 and ${contaComoFormandoSql("m")} and u.receber_emails and u."emailVerified"`,
        [turma.id],
      ),
      pool.query(
        `select usuario_id, tipo, valor::float8 as valor from pagamentos
          where turma_id = $1 and status = 'confirmado' and usuario_id is not null`,
        [turma.id],
      ),
      pool.query(
        `select referencia::text || ':' || usuario_id::text as chave from lembretes_enviados
          where tipo = 'parcela' and turma_id = $1`,
        [turma.id],
      ),
    ]);
    const jaEnviados = new Set(enviados.map((e) => e.chave));
    for (const pessoa of pessoas) {
      const dela = lancamentos
        .filter((l) => l.usuario_id === pessoa.usuarioId)
        .map((l) => ({ tipo: l.tipo as TipoLancamento, valor: l.valor }));
      for (const p of parcelasParaLembrar(parcelas, dela, hoje)) {
        if (jaEnviados.has(`${p.id}:${pessoa.usuarioId}`)) continue;
        const { enviados: n } = await enviarParaTurma([pessoa], (d) =>
          emailPrazoParcela({
            nome: d.nome,
            turma: turma.nome,
            numero: p.numero,
            falta: p.falta,
            vencimento: p.vencimento,
            url: urlDoSite("/minha-situacao"),
          }),
        );
        if (n === 0) return total;
        await marcar("parcela", p.id, turma.id, pessoa.usuarioId);
        total++;
      }
    }
  }
  return total;
}

// Prazo de presença nas próximas 48 horas (ADR-0013): lembra quem ainda não
// respondeu ou marcou "talvez". Observador também recebe: ele vai à festa.
async function lembrarPresencas(): Promise<number> {
  const { rows: turmas } = await pool.query(
    `select id, nome, presenca_ate as prazo from turmas
      where arquivada_em is null
        and presenca_ate > now() and presenca_ate <= now() + make_interval(hours => $1)`,
    [HORAS_JANELA_PRESENCA],
  );
  let total = 0;
  for (const t of turmas) {
    const { rows: pessoas } = await pool.query<Destinatario & { talvez: boolean }>(
      `select u.id as "usuarioId", u.name as nome, u.email, coalesce(p.status = 'talvez', false) as talvez
         from membros m
         join usuarios u on u.id = m.usuario_id
         left join presencas p on p.turma_id = m.turma_id and p.usuario_id = m.usuario_id
        where m.turma_id = $1 and u.receber_emails and u."emailVerified"
          and (p.status is null or p.status = 'talvez')
          and not exists (
            select 1 from lembretes_enviados l
             where l.tipo = 'presenca' and l.referencia = $1 and l.turma_id = $1 and l.usuario_id = m.usuario_id)`,
      [t.id],
    );
    for (const pessoa of pessoas) {
      const { enviados } = await enviarParaTurma([pessoa], (d) =>
        emailPrazoPresenca({
          nome: d.nome,
          turma: t.nome,
          prazo: t.prazo,
          talvez: pessoa.talvez,
          url: urlDoSite("/dashboard"),
        }),
      );
      if (enviados === 0) return total; // teto diário: tenta na próxima hora
      await marcar("presenca", t.id, t.id, pessoa.usuarioId);
      total++;
    }
  }
  return total;
}

// Roda as duas listas com uma trava: duas chamadas ao mesmo tempo (agendador
// atrasado + chamada manual) não mandam o mesmo email duas vezes.
type Rodada = {
  rodou: boolean;
  votacao: number;
  parcela: number;
  presenca: number;
  exclusao: number;
  excluidas: number;
};

export async function rodarLembretes(): Promise<Rodada> {
  const cliente = await pool.connect();
  try {
    const { rows } = await cliente.query("select pg_try_advisory_lock(hashtext('cron:lembretes')) as ok");
    if (!rows[0].ok) return { rodou: false, votacao: 0, parcela: 0, presenca: 0, exclusao: 0, excluidas: 0 };
    try {
      const hoje = hojeBrasil();
      const votacao = await lembrarVotacoes();
      const parcela = await lembrarParcelas(hoje);
      const presenca = await lembrarPresencas();
      // Plano de fim (ADR-0009): aviso de 7 dias e exclusão no prazo, nesta
      // ordem (quem recebe o aviso hoje só é excluído daqui a 7 dias).
      const exclusao = await avisarExclusoesProximas(hoje);
      const excluidas = await excluirTurmasNoPrazo(hoje);
      // Convites por lista sem resposta há 90 dias saem (ADR-0007): o site não
      // guarda email de quem não entrou por mais tempo que isso.
      await pool.query("delete from convites_email where enviado_em < now() - interval '90 days'");
      await pool.query(
        `insert into cron_execucoes (nome, ultima, detalhe) values ('lembretes', now(), $1)
         on conflict (nome) do update set ultima = excluded.ultima, detalhe = excluded.detalhe`,
        [JSON.stringify({ votacao, parcela, presenca, exclusao, excluidas })],
      );
      return { rodou: true, votacao, parcela, presenca, exclusao, excluidas };
    } finally {
      await cliente.query("select pg_advisory_unlock(hashtext('cron:lembretes'))");
    }
  } finally {
    cliente.release();
  }
}
