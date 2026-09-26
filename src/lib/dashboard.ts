import "server-only";
import { pool } from "./db";
import type { Membro } from "./dal";

export type ItemProgramacao = {
  id: string;
  horario: Date;
  titulo: string;
  descricao: string | null;
};

export type ResumoTurma = {
  membros: number;
  tarefasTotal: number;
  tarefasConcluidas: number;
  enquetesTotal: number;
  enquetesRespondidas: number;
  duvidasAbertas: number;
};

export async function listarProgramacao(
  membro: Membro,
): Promise<ItemProgramacao[]> {
  const { rows } = await pool.query(
    `select id, horario, titulo, descricao
       from programacao
      where turma_id = $1
      order by horario`,
    [membro.turmaId],
  );
  return rows;
}

export async function getResumoTurma(membro: Membro): Promise<ResumoTurma> {
  const { rows } = await pool.query(
    `select
       (select count(*) from membros where turma_id = $1)::int as membros,
       (select count(*) from tarefas where turma_id = $1)::int as "tarefasTotal",
       (select count(*) from tarefas
         where turma_id = $1 and status = 'concluida')::int as "tarefasConcluidas",
       (select count(*)
          from enquetes e
          join categorias ca on ca.id = e.categoria_id
          join catalogos c on c.id = ca.catalogo_id
         where c.turma_id is null or c.turma_id = $1)::int as "enquetesTotal",
       (select count(distinct o.enquete_id)
          from votos v
          join opcoes o on o.id = v.opcao_id
         where v.usuario_id = $2)::int as "enquetesRespondidas",
       (select count(*) from duvidas
         where turma_id = $1 and not respondida)::int as "duvidasAbertas"`,
    [membro.turmaId, membro.usuarioId],
  );
  return rows[0];
}
