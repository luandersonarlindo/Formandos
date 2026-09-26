"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirAdmin } from "@/lib/dal";
import { pool } from "@/lib/db";
import { CATEGORIAS_FORNECEDOR } from "@/lib/terceiros";
import type { EstadoForm } from "./tipos";

const esquemaFornecedor = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "O nome precisa ter pelo menos 2 caracteres.")
    .max(255, "O nome pode ter no máximo 255 caracteres."),
  categoria: z.enum(CATEGORIAS_FORNECEDOR, "Escolha uma categoria."),
  descricao: z
    .string()
    .trim()
    .max(1000, "A descrição pode ter no máximo 1000 caracteres.")
    .transform((v) => v || null),
  contato: z
    .string()
    .trim()
    .max(255, "O contato pode ter no máximo 255 caracteres.")
    .transform((v) => v || null),
});

export async function criarFornecedor(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const admin = await exigirAdmin();
  const dados = esquemaFornecedor.safeParse(Object.fromEntries(formData));
  if (!dados.success) return { erro: dados.error.issues[0].message };
  const { nome, categoria, descricao, contato } = dados.data;

  await pool.query(
    `insert into fornecedores (turma_id, nome, categoria, descricao, contato)
     values ($1, $2, $3, $4, $5)`,
    [admin.turmaId, nome, categoria, descricao, contato],
  );
  revalidatePath("/terceiros");
  return { ok: "Fornecedor adicionado." };
}

export async function excluirFornecedor(formData: FormData) {
  const admin = await exigirAdmin();
  const dados = z.object({ id: z.uuid() }).safeParse(Object.fromEntries(formData));
  if (!dados.success) return;
  await pool.query("delete from fornecedores where id = $1 and turma_id = $2", [
    dados.data.id,
    admin.turmaId,
  ]);
  revalidatePath("/terceiros");
}
