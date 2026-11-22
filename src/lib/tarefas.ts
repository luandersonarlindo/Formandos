import { contaComoFormandoSql } from "./papeis";
import "server-only";
import { pool } from "./db";
import { calcularPaginas, deslocamento, limitarPagina } from "./paginacao";
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

export const POR_PAGINA_TAREFAS = 10;

export type PaginaTarefas = {
  itens: Tarefa[];
  // Quantas batem com o filtro ativo.
  total: number;
  pagina: number;
  totalPaginas: number;
  // Turma inteira, por status: contadores dos filtros e progresso geral.
  totais: Record<StatusTarefa, number>;
  // Tarefas abertas (não concluídas) em que a pessoa é a responsável.
  minhas: number;
};

// Pendentes e em andamento primeiro, por prazo; concluídas por último.
export async function listarTarefas(
  membro: Membro,
  {
    status,
    minhas = false,
    pagina = 1,
  }: {
    status?: StatusTarefa;
    /** Só as tarefas abertas de que a pessoa é responsável (filtro "Minhas"). */
    minhas?: boolean;
    pagina?: number;
  } = {},
): Promise<PaginaTarefas> {
  const { rows: linhas } = await pool.query<{ status: StatusTarefa; n: number }>(
    `select status, count(*)::int as n
       from tarefas
      where turma_id = $1
      group by status`,
    [membro.turmaId],
  );
  const totais: Record<StatusTarefa, number> = {
    pendente: 0,
    em_andamento: 0,
    concluida: 0,
  };
  for (const l of linhas) totais[l.status] = l.n;
  const {
    rows: [{ n: minhasAbertas }],
  } = await pool.query<{ n: number }>(
    `select count(*)::int as n from tarefas
      where turma_id = $1 and responsavel_id = $2 and status <> 'concluida'`,
    [membro.turmaId, membro.usuarioId],
  );

  const parametros: unknown[] = [membro.turmaId];
  const condicoes: string[] = [];
  if (status) {
    parametros.push(status);
    condicoes.push(`and t.status = $${parametros.length}`);
  }
  if (minhas) {
    parametros.push(membro.usuarioId);
    condicoes.push(`and t.responsavel_id = $${parametros.length} and t.status <> 'concluida'`);
  }
  const filtro = condicoes.join(" ");
  const {
    rows: [{ total }],
  } = await pool.query(
    `select count(*)::int as total from tarefas t where t.turma_id = $1 ${filtro}`,
    parametros,
  );
  const totalPaginas = calcularPaginas(total, POR_PAGINA_TAREFAS);
  const paginaAtual = limitarPagina(pagina, totalPaginas);
  const { rows } = await pool.query(
    `select t.id, t.titulo, t.descricao, t.status, t.prazo::text as prazo,
            t.responsavel_id as "responsavelId", u.name as responsavel
       from tarefas t
       left join usuarios u on u.id = t.responsavel_id
      where t.turma_id = $1 ${filtro}
      order by (t.status = 'concluida'), t.prazo nulls last, t.created_at, t.id
      limit ${POR_PAGINA_TAREFAS} offset $${parametros.length + 1}`,
    [...parametros, deslocamento(paginaAtual, POR_PAGINA_TAREFAS)],
  );
  return { itens: rows, total, pagina: paginaAtual, totalPaginas, totais, minhas: minhasAbertas };
}

export async function listarMembros(membro: Membro): Promise<MembroSimples[]> {
  const { rows } = await pool.query(
    `select u.id, u.name as nome
       from membros m
       join usuarios u on u.id = m.usuario_id
      where m.turma_id = $1 and ${contaComoFormandoSql("m")}
      order by u.name`,
    [membro.turmaId],
  );
  return rows;
}
