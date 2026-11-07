"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirAdminEditavel } from "@/lib/dal";
import { pool } from "@/lib/db";
import { ehLinkHttps } from "@/lib/evento";
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
  imagemUrl: z
    .string()
    .trim()
    .max(500, "O link da imagem pode ter no máximo 500 caracteres.")
    .refine((v) => v === "" || ehLinkHttps(v), "O link da imagem precisa começar com https://.")
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
  const { nome, categoria, descricao, contato, imagemUrl, valorOrcado } = dados.data;

  const valor = lerValorOrcado(valorOrcado ?? "");
  if ((valorOrcado ?? "").trim() !== "" && valor === null) {
    return { erro: "Informe um valor válido, maior ou igual a zero." };
  }

  await pool.query(
    `insert into fornecedores (turma_id, nome, categoria, descricao, contato, imagem_url, valor_orcado)
     values ($1, $2, $3, $4, $5, $6, $7)`,
    [admin.turmaId, nome, categoria, descricao, contato, imagemUrl, valor],
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
  const { id, nome, categoria, descricao, contato, imagemUrl, valorOrcado, status } =
    dados.data;

  const valor = lerValorOrcado(valorOrcado ?? "");
  if ((valorOrcado ?? "").trim() !== "" && valor === null) {
    return { erro: "Informe um valor válido, maior ou igual a zero." };
  }

  const { rowCount } = await pool.query(
    `update fornecedores
       set nome = $1, categoria = $2, descricao = $3, contato = $4,
           imagem_url = $5, status = $6, valor_orcado = $7
     where id = $8 and turma_id = $9`,
    [nome, categoria, descricao, contato, imagemUrl, status, valor, id, admin.turmaId],
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
