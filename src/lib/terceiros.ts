import "server-only";
import { pool } from "./db";
import type { Membro } from "./dal";

export const CATEGORIAS_FORNECEDOR = [
  "Buffet",
  "Música e DJ",
  "Fotografia e vídeo",
  "Decoração",
  "Equipe de apoio",
  "Espaço",
  "Outros",
] as const;

export type Fornecedor = {
  id: string;
  nome: string;
  categoria: string;
  descricao: string | null;
  contato: string | null;
};

export async function listarFornecedores(membro: Membro): Promise<Fornecedor[]> {
  const { rows } = await pool.query(
    `select id, nome, categoria, descricao, contato
       from fornecedores
      where turma_id = $1
      order by categoria, nome`,
    [membro.turmaId],
  );
  return rows;
}
