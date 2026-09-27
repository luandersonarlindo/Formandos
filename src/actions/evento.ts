"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirAdminEditavel } from "@/lib/dal";
import { pool } from "@/lib/db";
import type { EstadoForm } from "./tipos";

// <input type="datetime-local"> envia "AAAA-MM-DDTHH:mm" (sem fuso).
// O horário é interpretado como horário de Brasília.
const dataHora = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Data ou hora inválida.");

const esquemaEvento = z.object({
  nome: z
    .string()
    .trim()
    .min(3, "O nome da turma precisa ter pelo menos 3 caracteres.")
    .max(100, "O nome da turma pode ter no máximo 100 caracteres."),
  dataEvento: z.union([z.literal("").transform(() => null), dataHora]),
  localEvento: z
    .string()
    .trim()
    .max(255, "O local pode ter no máximo 255 caracteres.")
    .transform((v) => v || null),
});

const esquemaItem = z.object({
  horario: dataHora,
  titulo: z
    .string()
    .trim()
    .min(2, "O título precisa ter pelo menos 2 caracteres.")
    .max(255, "O título pode ter no máximo 255 caracteres."),
  descricao: z
    .string()
    .trim()
    .max(500, "A descrição pode ter no máximo 500 caracteres.")
    .transform((v) => v || null),
});

const MAX_ITENS_PROGRAMACAO = 100;

function revalidarEvento() {
  revalidatePath("/admin/evento");
  revalidatePath("/dashboard");
}

export async function salvarEvento(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const admin = await exigirAdminEditavel();
  const dados = esquemaEvento.safeParse(Object.fromEntries(formData));
  if (!dados.success) return { erro: dados.error.issues[0].message };
  const { nome, dataEvento, localEvento } = dados.data;

  await pool.query(
    `update turmas
        set nome = $1,
            data_evento = $2::timestamp at time zone 'America/Sao_Paulo',
            local_evento = $3
      where id = $4`,
    [nome, dataEvento, localEvento, admin.turmaId],
  );
  revalidarEvento();
  revalidatePath("/", "layout");
  return { ok: "Dados do evento salvos." };
}

export async function adicionarItemProgramacao(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const admin = await exigirAdminEditavel();
  const dados = esquemaItem.safeParse(Object.fromEntries(formData));
  if (!dados.success) return { erro: dados.error.issues[0].message };
  const { horario, titulo, descricao } = dados.data;

  const { rows } = await pool.query(
    "select count(*)::int as total from programacao where turma_id = $1",
    [admin.turmaId],
  );
  if (rows[0].total >= MAX_ITENS_PROGRAMACAO) {
    return { erro: `A programação pode ter no máximo ${MAX_ITENS_PROGRAMACAO} itens.` };
  }

  await pool.query(
    `insert into programacao (turma_id, horario, titulo, descricao)
     values ($1, $2::timestamp at time zone 'America/Sao_Paulo', $3, $4)`,
    [admin.turmaId, horario, titulo, descricao],
  );
  revalidarEvento();
  return { ok: "Item adicionado." };
}

export async function removerItemProgramacao(formData: FormData) {
  const admin = await exigirAdminEditavel();
  const dados = z.object({ id: z.uuid() }).safeParse(Object.fromEntries(formData));
  if (!dados.success) return;
  await pool.query("delete from programacao where id = $1 and turma_id = $2", [
    dados.data.id,
    admin.turmaId,
  ]);
  revalidarEvento();
}
