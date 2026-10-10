import "server-only";
import type { Pool, PoolClient } from "pg";
import { pool } from "./db";

// Trilha de auditoria (SoA 8.15, Marco Civil arts. 13–15). Tabela `auditoria`:
// só INSERT pelo servidor; nada na aplicação edita ou apaga.
//
// Ações registradas (vocabulário fechado, para o relatório não virar texto
// livre): papel.trocado, membro.removido, conta.excluida, turma.arquivada,
// turma.desarquivada, turma.excluida.

export type AcaoAuditoria =
  | "papel.trocado"
  | "membro.removido"
  | "conta.excluida"
  | "turma.arquivada"
  | "turma.desarquivada"
  | "turma.excluida";

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
