import "server-only";
import type { PoolClient } from "pg";
import type { Papel } from "./papeis";

// Troca o papel de alguém na turma (ADR-0012). Usada pela comissão e pela
// gestão da plataforma, sempre dentro de uma transação de quem chama.
//
// Regras:
// - a turma nunca fica sem administrador;
// - quem deixa de ser admin deixa de ser tesouraria (ADR-0005);
// - quem vira observador sai da conta da turma: os votos em perguntas ainda
//   abertas são apagados e as tarefas ficam sem responsável. Com pagamento
//   lançado a troca é recusada, para nenhum valor sumir sem a tesouraria ver.

export type ResultadoTroca =
  | { tipo: "ok"; de: Papel; para: Papel; votosApagados: number }
  | { tipo: "igual" }
  | { tipo: "inexistente" }
  | { tipo: "ultimo_admin" }
  | { tipo: "com_pagamentos" };

export const ERRO_TROCA: Record<Exclude<ResultadoTroca["tipo"], "ok">, string> = {
  igual: "A pessoa já tem este papel.",
  inexistente: "Membro não encontrado.",
  ultimo_admin: "A turma não pode ficar sem administrador.",
  com_pagamentos: "Esta pessoa tem pagamentos lançados. A tesouraria resolve antes.",
};

export async function trocarPapel(
  db: PoolClient,
  { turmaId, usuarioId, papel }: { turmaId: string; usuarioId: string; papel: Papel },
): Promise<ResultadoTroca> {
  const { rows } = await db.query<{ usuario_id: string; papel: Papel }>(
    "select usuario_id, papel from membros where turma_id = $1 for update",
    [turmaId],
  );
  const alvo = rows.find((r) => r.usuario_id === usuarioId);
  if (!alvo) return { tipo: "inexistente" };
  if (alvo.papel === papel) return { tipo: "igual" };
  const admins = rows.filter((r) => r.papel === "admin").length;
  if (alvo.papel === "admin" && admins === 1) return { tipo: "ultimo_admin" };

  let votosApagados = 0;
  if (papel === "observador") {
    const { rowCount: pagamentos } = await db.query(
      `select 1 from pagamentos
        where turma_id = $1 and usuario_id = $2 and status in ('informado', 'confirmado') limit 1`,
      [turmaId, usuarioId],
    );
    if (pagamentos) return { tipo: "com_pagamentos" };
    // Informe recusado não é dinheiro da turma: some com a troca.
    await db.query("delete from pagamentos where turma_id = $1 and usuario_id = $2", [
      turmaId,
      usuarioId,
    ]);
    const apagados = await db.query(
      `delete from votos v
        using opcoes o
        where o.id = v.opcao_id and v.turma_id = $1 and v.usuario_id = $2
          and not exists (select 1 from decisoes d
                           where d.turma_id = $1 and d.enquete_id = o.enquete_id)`,
      [turmaId, usuarioId],
    );
    votosApagados = apagados.rowCount ?? 0;
    await db.query(
      "update tarefas set responsavel_id = null where turma_id = $1 and responsavel_id = $2",
      [turmaId, usuarioId],
    );
  }

  await db.query(
    `update membros set papel = $1::varchar, tesouraria = (tesouraria and $1::varchar = 'admin')
      where turma_id = $2 and usuario_id = $3`,
    [papel, turmaId, usuarioId],
  );
  return { tipo: "ok", de: alvo.papel, para: papel, votosApagados };
}
