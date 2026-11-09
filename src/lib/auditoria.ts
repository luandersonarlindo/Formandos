import "server-only";
import type { Pool, PoolClient } from "pg";
import { pool } from "./db";
import {
  ACOES_VISIVEIS_TURMA,
  acoesVisiveis,
  type AcaoAuditoria,
  type PublicoHistorico,
} from "./auditoria-acoes";

// Trilha de auditoria (SoA 8.15, Marco Civil arts. 13–15). Tabela `auditoria`:
// só INSERT pelo servidor; nada na aplicação edita ou apaga.
//
// O vocabulário fechado de ações fica em auditoria-acoes.ts (sem banco, com
// teste), junto com a lista das que a turma pode ver.
export type { AcaoAuditoria } from "./auditoria-acoes";

type Registro = {
  usuarioId: string | null;
  turmaId: string | null;
  acao: AcaoAuditoria;
  entidade: string;
  entidadeId?: string | null;
  detalhe?: Record<string, unknown>;
};

export async function registrarAuditoria(
  db: Pool | PoolClient,
  registro: Registro,
): Promise<void> {
  await db.query(
    `insert into auditoria (usuario_id, turma_id, acao, entidade, entidade_id, detalhe)
     values ($1, $2, $3, $4, $5, $6)`,
    [
      registro.usuarioId,
      registro.turmaId,
      registro.acao,
      registro.entidade,
      registro.entidadeId ?? null,
      JSON.stringify(registro.detalhe ?? {}),
    ],
  );
}

// Histórico das decisões que a turma vê (ADR-0003): só as ações de
// ACOES_VISIVEIS_TURMA. As demais (papel trocado, membro removido, conta
// excluída...) continuam restritas. Autor nulo = conta excluída.
export type ItemHistorico = {
  id: string;
  quando: Date;
  acao: (typeof ACOES_VISIVEIS_TURMA)[number];
  enqueteId: string | null;
  autor: string | null;
  detalhe: Record<string, unknown>;
};

export async function listarHistoricoDecisoes(
  turmaId: string,
  enqueteId?: string,
): Promise<ItemHistorico[]> {
  const { rows } = await pool.query(
    `select a.id::text, a.created_at as quando, a.acao, a.entidade_id as "enqueteId",
            u.name as autor, a.detalhe
       from auditoria a
       left join usuarios u on u.id = a.usuario_id
      where a.turma_id = $1
        and a.acao = any($2::text[])
        and a.entidade = 'enquete'
        and ($3::uuid is null or a.entidade_id = $3)
      order by a.created_at desc, a.id desc
      limit 200`,
    [turmaId, [...ACOES_VISIVEIS_TURMA], enqueteId ?? null],
  );
  return rows;
}

// Mudanças no plano de parcelas, para "Minha situação" (ADR-0005). Só a ação
// plano.alterado, que é visível à turma: o detalhe leva parcelas (número,
// valor, vencimento), nunca dado de pessoa.
export type MudancaPlano = {
  id: string;
  quando: Date;
  autor: string | null;
  detalhe: Record<string, unknown>;
};

export async function listarMudancasPlano(turmaId: string): Promise<MudancaPlano[]> {
  const { rows } = await pool.query(
    `select a.id::text, a.created_at as quando, u.name as autor, a.detalhe
       from auditoria a
       left join usuarios u on u.id = a.usuario_id
      where a.turma_id = $1 and a.acao = 'plano.alterado'
      order by a.created_at desc, a.id desc
      limit 50`,
    [turmaId],
  );
  return rows;
}

// Histórico completo da turma (ADR-0008), filtrado pelo que cada público pode
// ver (acoesVisiveis) e por assunto. `alvo` é o nome da pessoa citada: o
// membro (papel, remoção) ou quem pagou (pagamentos).
export const ASSUNTOS_HISTORICO = {
  decisoes: ["decisao.fixada", "decisao.reaberta", "regra.alterada", "opcao.valor_alterado"],
  evento: ["evento.alterado", "evento.link_publico"],
  dinheiro: [
    "plano.alterado",
    "fornecedor.alterado",
    "pagamento.lancado",
    "pagamento.informado",
    "pagamento.confirmado",
    "pagamento.recusado",
    "pagamento.editado",
    "pagamento.excluido",
  ],
  membros: ["papel.trocado", "papel.tesouraria", "membro.removido"],
  turma: ["turma.arquivada", "turma.desarquivada", "turma.excluida", "turma.exportada"],
} as const satisfies Record<string, readonly AcaoAuditoria[]>;
export type AssuntoHistorico = keyof typeof ASSUNTOS_HISTORICO;

export const POR_PAGINA_HISTORICO = 30;

export async function listarHistoricoTurma(
  turmaId: string,
  publico: PublicoHistorico,
  opcoes: { assunto?: AssuntoHistorico; pagina: number },
) {
  const visiveis = acoesVisiveis(publico);
  const acoes = opcoes.assunto
    ? visiveis.filter((a) => (ASSUNTOS_HISTORICO[opcoes.assunto!] as readonly string[]).includes(a))
    : visiveis;
  const { rows: total } = await pool.query(
    "select count(*)::int as n from auditoria where turma_id = $1 and acao = any($2::text[])",
    [turmaId, acoes],
  );
  const totalPaginas = Math.max(1, Math.ceil(total[0].n / POR_PAGINA_HISTORICO));
  const pagina = Math.min(Math.max(1, opcoes.pagina), totalPaginas);
  const { rows } = await pool.query(
    `select a.id::text, a.created_at as quando, a.acao, u.name as autor, alvo.name as alvo, a.detalhe
       from auditoria a
       left join usuarios u on u.id = a.usuario_id
       left join usuarios alvo on alvo.id = case
              when a.entidade = 'membro' then a.entidade_id
              when a.detalhe ? 'membro' then (a.detalhe->>'membro')::uuid
            end
      where a.turma_id = $1 and a.acao = any($2::text[])
      order by a.created_at desc, a.id desc
      limit $3 offset $4`,
    [turmaId, acoes, POR_PAGINA_HISTORICO, (pagina - 1) * POR_PAGINA_HISTORICO],
  );
  return { itens: rows as ItemHistoricoCompleto[], pagina, totalPaginas, total: total[0].n as number };
}

export type ItemHistoricoCompleto = {
  id: string;
  quando: Date;
  acao: AcaoAuditoria;
  autor: string | null;
  alvo: string | null;
  detalhe: Record<string, unknown>;
};
