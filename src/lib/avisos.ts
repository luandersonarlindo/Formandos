import "server-only";
import { pool } from "./db";
import type { Membro } from "./dal";
import { calcularPaginas, deslocamento, limitarPagina } from "./paginacao";

export type Aviso = {
  id: string;
  titulo: string;
  conteudo: string;
  criadoEm: Date;
  autor: string;
};

export const POR_PAGINA_AVISOS = 10;

export async function listarAvisos(
  membro: Membro,
  { pagina = 1 }: { pagina?: number } = {},
): Promise<{ itens: Aviso[]; total: number; pagina: number; totalPaginas: number }> {
  const {
    rows: [{ total }],
  } = await pool.query("select count(*)::int as total from avisos where turma_id = $1", [
    membro.turmaId,
  ]);
  const totalPaginas = calcularPaginas(total, POR_PAGINA_AVISOS);
  const paginaAtual = limitarPagina(pagina, totalPaginas);
  const { rows } = await pool.query<Aviso>(
    `select a.id, a.titulo, a.conteudo, a.created_at as "criadoEm",
            coalesce(u.name, 'Comissão') as autor
       from avisos a
       left join usuarios u on u.id = a.autor_id
      where a.turma_id = $1
      order by a.created_at desc, a.id
      limit ${POR_PAGINA_AVISOS} offset $2`,
    [membro.turmaId, deslocamento(paginaAtual, POR_PAGINA_AVISOS)],
  );
  return { itens: rows, total, pagina: paginaAtual, totalPaginas };
}

// Prévia para o dashboard: só os mais recentes.
export async function listarUltimosAvisos(membro: Membro, limite = 3): Promise<Aviso[]> {
  const { rows } = await pool.query<Aviso>(
    `select a.id, a.titulo, a.conteudo, a.created_at as "criadoEm",
            coalesce(u.name, 'Comissão') as autor
       from avisos a
       left join usuarios u on u.id = a.autor_id
      where a.turma_id = $1
      order by a.created_at desc, a.id
      limit $2`,
    [membro.turmaId, limite],
  );
  return rows;
}
