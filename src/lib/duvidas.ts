import "server-only";
import { pool } from "./db";
import type { Membro } from "./dal";
import { calcularPaginas, deslocamento, limitarPagina } from "./paginacao";

export type Duvida = {
  id: string;
  conteudo: string;
  resposta: string | null;
  respondida: boolean;
  destaque: boolean;
  criadaEm: Date;
  autorId: string;
  autor: string;
  votos: number;
  votei: boolean;
};

export type FiltroDuvida = "todas" | "abertas" | "respondidas";

export const POR_PAGINA_DUVIDAS = 10;

export type PaginaDuvidas = {
  itens: Duvida[];
  pagina: number;
  totalPaginas: number;
  // Contagem de cada filtro na turma inteira, não só na página.
  contagens: Record<FiltroDuvida, number>;
};

// Trechos fixos (nunca vêm da URL): o filtro é escolhido em uma lista fechada.
const CONDICAO_FILTRO: Record<FiltroDuvida, string> = {
  todas: "",
  abertas: "and not d.respondida",
  respondidas: "and d.respondida",
};

// Dúvidas da turma, uma página por vez. Ordem padrão: em destaque primeiro,
// depois as mais votadas, depois as mais recentes (com o id como desempate, para
// a paginação não repetir nem pular itens). Na moderação, as ainda não
// respondidas vêm antes.
export async function listarDuvidas(
  membro: Membro,
  {
    moderacao = false,
    filtro = "todas",
    pagina = 1,
  }: { moderacao?: boolean; filtro?: FiltroDuvida; pagina?: number } = {},
): Promise<PaginaDuvidas> {
  const { rows: totais } = await pool.query(
    `select count(*)::int as todas,
            (count(*) filter (where not respondida))::int as abertas,
            (count(*) filter (where respondida))::int as respondidas
       from duvidas
      where turma_id = $1`,
    [membro.turmaId],
  );
  const contagens: Record<FiltroDuvida, number> = totais[0];
  const totalPaginas = calcularPaginas(contagens[filtro], POR_PAGINA_DUVIDAS);
  const paginaAtual = limitarPagina(pagina, totalPaginas);

  const { rows } = await pool.query(
    `select d.id, d.conteudo, d.resposta, d.respondida, d.destaque,
            d.created_at as "criadaEm", d.autor_id as "autorId", u.name as autor,
            (select count(*) from duvida_upvotes x
              where x.duvida_id = d.id)::int as votos,
            exists (select 1 from duvida_upvotes x
                     where x.duvida_id = d.id and x.usuario_id = $2) as votei
       from duvidas d
       join usuarios u on u.id = d.autor_id
      where d.turma_id = $1 ${CONDICAO_FILTRO[filtro]}
      order by ${moderacao ? "d.respondida asc," : ""}
               d.destaque desc, votos desc, d.created_at desc, d.id
      limit ${POR_PAGINA_DUVIDAS} offset $3`,
    [
      membro.turmaId,
      membro.usuarioId,
      deslocamento(paginaAtual, POR_PAGINA_DUVIDAS),
    ],
  );
  return { itens: rows, pagina: paginaAtual, totalPaginas, contagens };
}
