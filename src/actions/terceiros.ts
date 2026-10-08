"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirAdminEditavel } from "@/lib/dal";
import { pool } from "@/lib/db";
import { lerValorOrcado, STATUS_ORCAMENTO } from "@/lib/orcamento";
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
  valorOrcado: z.string().max(20, "O valor pode ter no máximo 20 caracteres.").optional(),
});

export async function criarFornecedor(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const admin = await exigirAdminEditavel();
  const dados = esquemaFornecedor.safeParse(Object.fromEntries(formData));
  if (!dados.success) return { erro: dados.error.issues[0].message };
  const { nome, categoria, descricao, contato, valorOrcado } = dados.data;

  const valor = lerValorOrcado(valorOrcado ?? "");
  if ((valorOrcado ?? "").trim() !== "" && valor === null) {
    return { erro: "Informe um valor válido, maior ou igual a zero." };
  }

  await pool.query(
    `insert into fornecedores (turma_id, nome, categoria, descricao, contato, valor_orcado)
     values ($1, $2, $3, $4, $5, $6)`,
    [admin.turmaId, nome, categoria, descricao, contato, valor],
  );
  revalidatePath("/terceiros");
  return { ok: "Fornecedor adicionado." };
}

export async function atualizarFornecedor(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const admin = await exigirAdminEditavel();
  const dados = esquemaFornecedor
    .extend({
      id: z.uuid(),
      status: z.enum(STATUS_ORCAMENTO),
    })
    .safeParse(Object.fromEntries(formData));
  if (!dados.success) return { erro: dados.error.issues[0].message };
  const { id, nome, categoria, descricao, contato, valorOrcado, status } =
    dados.data;

  const valor = lerValorOrcado(valorOrcado ?? "");
  if ((valorOrcado ?? "").trim() !== "" && valor === null) {
    return { erro: "Informe um valor válido, maior ou igual a zero." };
  }

  const { rowCount } = await pool.query(
    `update fornecedores
       set nome = $1, categoria = $2, descricao = $3, contato = $4,
           status = $5, valor_orcado = $6
     where id = $7 and turma_id = $8`,
    [nome, categoria, descricao, contato, status, valor, id, admin.turmaId],
  );
  if (!rowCount) return { erro: "Fornecedor não encontrado." };
  revalidatePath("/terceiros");
  return { ok: "Fornecedor atualizado." };
}

export async function excluirFornecedor(formData: FormData) {
  const admin = await exigirAdminEditavel();
  const dados = z.object({ id: z.uuid() }).safeParse(Object.fromEntries(formData));
  if (!dados.success) return;
  await pool.query("delete from fornecedores where id = $1 and turma_id = $2", [
    dados.data.id,
    admin.turmaId,
  ]);
  revalidatePath("/terceiros");
}
