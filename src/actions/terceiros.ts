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
});

export async function criarFornecedor(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const admin = await exigirAdminEditavel();
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

export async function atualizarFornecedor(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const admin = await exigirAdminEditavel();
  const dados = esquemaFornecedor
    .extend({ id: z.uuid() })
    .safeParse(Object.fromEntries(formData));
  if (!dados.success) return { erro: dados.error.issues[0].message };
  const { id, nome, categoria, descricao, contato } = dados.data;

  const { rowCount } = await pool.query(
    `update fornecedores set nome = $1, categoria = $2, descricao = $3, contato = $4
      where id = $5 and turma_id = $6`,
    [nome, categoria, descricao, contato, id, admin.turmaId],
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

const esquemaOrcamento = z.object({
  id: z.uuid(),
  status: z.enum(STATUS_ORCAMENTO),
  valorOrcado: z.string().max(20),
});

// Só admin vê e muda valor orçado e status: não faz parte do formulário de
// criação, que qualquer administrador usa para cadastrar o fornecedor.
export async function atualizarOrcamento(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const admin = await exigirAdminEditavel();
  const dados = esquemaOrcamento.safeParse(Object.fromEntries(formData));
  if (!dados.success) return { erro: "Dados inválidos." };
  const valor = lerValorOrcado(dados.data.valorOrcado);
  if (dados.data.valorOrcado.trim() !== "" && valor === null) {
    return { erro: "Informe um valor válido, maior ou igual a zero." };
  }

  const { rowCount } = await pool.query(
    "update fornecedores set valor_orcado = $1, status = $2 where id = $3 and turma_id = $4",
    [valor, dados.data.status, dados.data.id, admin.turmaId],
  );
  if (!rowCount) return { erro: "Fornecedor não encontrado." };
  revalidatePath("/terceiros");
  return { ok: "Orçamento salvo." };
}
