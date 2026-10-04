import "server-only";
import { pool } from "./db";
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

// Participante: sem valor orçado nem status (não passam pela consulta).
export async function listarFornecedores(membro: Membro): Promise<FornecedorParticipante[]> {
  const { rows } = await pool.query(
    `select id, nome, categoria, descricao, contato
       from fornecedores
      where turma_id = $1
      order by categoria, nome`,
    [membro.turmaId],
  );
  return rows;
}

// Administrador: com valor orçado e status da negociação.
export async function listarFornecedoresAdmin(turmaId: string): Promise<Fornecedor[]> {
  const { rows } = await pool.query(
    `select id, nome, categoria, descricao, contato,
            valor_orcado::float8 as "valorOrcado", status
       from fornecedores
      where turma_id = $1
      order by categoria, nome`,
    [turmaId],
  );
  return rows;
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
