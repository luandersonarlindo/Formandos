import "server-only";
import type { Pool, PoolClient } from "pg";
import { pool } from "./db";
import { ACOES_VISIVEIS_TURMA, type AcaoAuditoria } from "./auditoria-acoes";

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
