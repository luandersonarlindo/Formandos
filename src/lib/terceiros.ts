import "server-only";
import { pool } from "./db";
import { calcularPaginas, deslocamento, limitarPagina } from "./paginacao";
import type { Membro } from "./dal";
import type { StatusOrcamento } from "./orcamento";

// Categorias da vitrine de terceiros. Nenhum item é apagado quando uma categoria
// sai daqui: os fornecedores antigos continuam com o texto que já tinham.
export const CATEGORIAS_FORNECEDOR = [
  "Buffet",
  "Música e DJ",
  "Fotografia e vídeo",
  "Cabine de fotos",
  "Decoração",
  "Cerimônia e honras",
  "Equipe de apoio",
  "Segurança e portaria",
  "Iluminação e som",
  "Espaço",
  "Transporte e hospedagem",
  "Higiene e limpeza",
  "Brindes e lembrancinhas",
  "Outros",
] as const;

export type Fornecedor = {
  id: string;
  nome: string;
  categoria: string;
  descricao: string | null;
  contato: string | null;
  // Só a página de terceiros filtra para quem não é admin: participantes nunca
  // recebem esses dois campos na consulta.
  valorOrcado: number | null;
  status: StatusOrcamento;
};

export type FornecedorParticipante = Omit<Fornecedor, "valorOrcado" | "status">;

export type ResumoOrcamento = {
  orcado: number;
  contratado: number;
  cotando: number;
};

export const POR_PAGINA_FORNECEDORES = 10;

export type PaginaFornecedores<T> = {
  itens: T[];
  // Quantos batem com a categoria ativa.
  total: number;
  pagina: number;
  totalPaginas: number;
  // Turma inteira, por categoria: contadores do filtro.
  totais: Record<string, number>;
};

async function contarPorCategoria(turmaId: string): Promise<Record<string, number>> {
  const { rows } = await pool.query<{ categoria: string; n: number }>(
    `select categoria, count(*)::int as n
       from fornecedores
      where turma_id = $1
      group by categoria`,
    [turmaId],
  );
  const totais: Record<string, number> = {};
  for (const r of rows) totais[r.categoria] = r.n;
  return totais;
}

// Participante: sem valor orçado nem status (não passam pela consulta).
export async function listarFornecedores(
  membro: Membro,
  { categoria, pagina = 1 }: { categoria?: string; pagina?: number } = {},
): Promise<PaginaFornecedores<FornecedorParticipante>> {
  const totais = await contarPorCategoria(membro.turmaId);
  const filtro = categoria ? `and categoria = $2` : "";
  const parametros: unknown[] = categoria ? [membro.turmaId, categoria] : [membro.turmaId];
  const {
    rows: [{ total }],
  } = await pool.query(
    `select count(*)::int as total from fornecedores where turma_id = $1 ${filtro}`,
    parametros,
  );
  const totalPaginas = calcularPaginas(total, POR_PAGINA_FORNECEDORES);
  const paginaAtual = limitarPagina(pagina, totalPaginas);
  const { rows } = await pool.query(
    `select id, nome, categoria, descricao, contato
       from fornecedores
      where turma_id = $1 ${filtro}
      order by categoria, nome, id
      limit ${POR_PAGINA_FORNECEDORES} offset $${parametros.length + 1}`,
    [...parametros, deslocamento(paginaAtual, POR_PAGINA_FORNECEDORES)],
  );
  return { itens: rows, total, pagina: paginaAtual, totalPaginas, totais };
}

// Administrador: com valor orçado e status da negociação.
export async function listarFornecedoresAdmin(
  turmaId: string,
  { categoria, pagina = 1 }: { categoria?: string; pagina?: number } = {},
): Promise<PaginaFornecedores<Fornecedor>> {
  const totais = await contarPorCategoria(turmaId);
  const filtro = categoria ? `and categoria = $2` : "";
  const parametros: unknown[] = categoria ? [turmaId, categoria] : [turmaId];
  const {
    rows: [{ total }],
  } = await pool.query(
    `select count(*)::int as total from fornecedores where turma_id = $1 ${filtro}`,
    parametros,
  );
  const totalPaginas = calcularPaginas(total, POR_PAGINA_FORNECEDORES);
  const paginaAtual = limitarPagina(pagina, totalPaginas);
  const { rows } = await pool.query(
    `select id, nome, categoria, descricao, contato,
            valor_orcado::float8 as "valorOrcado", status
       from fornecedores
      where turma_id = $1 ${filtro}
      order by categoria, nome, id
      limit ${POR_PAGINA_FORNECEDORES} offset $${parametros.length + 1}`,
    [...parametros, deslocamento(paginaAtual, POR_PAGINA_FORNECEDORES)],
  );
  return { itens: rows, total, pagina: paginaAtual, totalPaginas, totais };
}

export async function getResumoOrcamento(turmaId: string): Promise<ResumoOrcamento> {
  const { rows } = await pool.query(
    `select coalesce(sum(valor_orcado), 0)::float8 as orcado,
            coalesce(sum(valor_orcado) filter (where status = 'contratado'), 0)::float8 as contratado,
            coalesce(sum(valor_orcado) filter (where status = 'cotando'), 0)::float8 as cotando
       from fornecedores where turma_id = $1`,
    [turmaId],
  );
  return rows[0];
}
