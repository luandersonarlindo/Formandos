import "server-only";
import { pool } from "./db";
import type { Membro } from "./dal";

export const STATUS_TAREFA = ["pendente", "em_andamento", "concluida"] as const;
export type StatusTarefa = (typeof STATUS_TAREFA)[number];

export const ROTULO_STATUS: Record<StatusTarefa, string> = {
  pendente: "Pendente",
  em_andamento: "Em andamento",
  concluida: "Concluída",
};

export type Tarefa = {
  id: string;
  titulo: string;
  descricao: string | null;
  status: StatusTarefa;
  responsavelId: string | null;
  responsavel: string | null;
  // Data no formato AAAA-MM-DD (vem como texto para não sofrer com fuso).
  prazo: string | null;
};

export type MembroSimples = { id: string; nome: string };

// Pendentes e em andamento primeiro, por prazo; concluídas por último.
export async function listarTarefas(membro: Membro): Promise<Tarefa[]> {
  const { rows } = await pool.query(
    `select t.id, t.titulo, t.descricao, t.status, t.prazo::text as prazo,
            t.responsavel_id as "responsavelId", u.name as responsavel
       from tarefas t
       left join usuarios u on u.id = t.responsavel_id
      where t.turma_id = $1
      order by (t.status = 'concluida'), t.prazo nulls last, t.created_at`,
    [membro.turmaId],
  );
  return rows;
}

export async function listarMembros(membro: Membro): Promise<MembroSimples[]> {
  const { rows } = await pool.query(
    `select u.id, u.name as nome
       from membros m
       join usuarios u on u.id = m.usuario_id
      where m.turma_id = $1
      order by u.name`,
    [membro.turmaId],
  );
  return rows;
}
