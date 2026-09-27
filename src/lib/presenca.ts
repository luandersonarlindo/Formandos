import "server-only";
import { pool } from "./db";
import type { Membro } from "./dal";
import { calcularPaginas, deslocamento, limitarPagina } from "./paginacao";
import { pessoasEsperadas, type StatusPresenca } from "./presenca-regras";

export type MinhaPresenca = {
  status: StatusPresenca | null;
  acompanhantes: number;
  observacao: string;
};

export async function getMinhaPresenca(membro: Membro): Promise<MinhaPresenca> {
  const { rows } = await pool.query(
    `select status, acompanhantes, coalesce(observacao, '') as observacao
       from presencas where turma_id = $1 and usuario_id = $2`,
    [membro.turmaId, membro.usuarioId],
  );
  return rows[0] ?? { status: null, acompanhantes: 0, observacao: "" };
}

export type FiltroPresenca = "todos" | StatusPresenca | "pendente";

export type ResumoPresenca = {
  membros: number;
  vou: number;
  talvez: number;
  nao: number;
  pendente: number;
  acompanhantes: number;
  // Quem vai + acompanhantes.
  pessoas: number;
};

export type LinhaPresenca = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  status: StatusPresenca | null;
  acompanhantes: number;
  observacao: string | null;
};

// Só conta quem ainda é membro da turma (a resposta de quem saiu é ignorada).
export async function getResumoPresenca(turmaId: string): Promise<ResumoPresenca> {
  const { rows } = await pool.query(
    `select count(*)::int as membros,
            (count(*) filter (where p.status = 'vou'))::int as vou,
            (count(*) filter (where p.status = 'talvez'))::int as talvez,
            (count(*) filter (where p.status = 'nao'))::int as nao,
            (count(*) filter (where p.status is null))::int as pendente,
            coalesce(sum(p.acompanhantes) filter (where p.status = 'vou'), 0)::int as acompanhantes
       from membros m
       left join presencas p on p.turma_id = m.turma_id and p.usuario_id = m.usuario_id
      where m.turma_id = $1`,
    [turmaId],
  );
  const r = rows[0];
  return { ...r, pessoas: pessoasEsperadas(r.vou, r.acompanhantes) };
}

// Trechos fixos (nunca vêm da URL): o filtro é escolhido em uma lista fechada.
const CONDICAO: Record<FiltroPresenca, string> = {
  todos: "",
  vou: "and p.status = 'vou'",
  talvez: "and p.status = 'talvez'",
  nao: "and p.status = 'nao'",
  pendente: "and p.status is null",
};

export const POR_PAGINA_PRESENCA = 20;

export async function listarPresencas(
  turmaId: string,
  { filtro = "todos", pagina = 1, total }: { filtro?: FiltroPresenca; pagina?: number; total: number },
): Promise<{ itens: LinhaPresenca[]; pagina: number; totalPaginas: number }> {
  const totalPaginas = calcularPaginas(total, POR_PAGINA_PRESENCA);
  const paginaAtual = limitarPagina(pagina, totalPaginas);
  const { rows } = await pool.query<LinhaPresenca>(
    `select u.id, u.name, u.email, u.image, p.status,
            coalesce(p.acompanhantes, 0)::int as acompanhantes, p.observacao
       from membros m
       join usuarios u on u.id = m.usuario_id
       left join presencas p on p.turma_id = m.turma_id and p.usuario_id = m.usuario_id
      where m.turma_id = $1 ${CONDICAO[filtro]}
      order by u.name, u.id
      limit ${POR_PAGINA_PRESENCA} offset $2`,
    [turmaId, deslocamento(paginaAtual, POR_PAGINA_PRESENCA)],
  );
  return { itens: rows, pagina: paginaAtual, totalPaginas };
}
