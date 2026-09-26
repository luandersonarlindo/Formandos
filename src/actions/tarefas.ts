"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirAdmin, exigirMembro } from "@/lib/dal";
import { pool } from "@/lib/db";
import { STATUS_TAREFA } from "@/lib/tarefas";
import type { EstadoForm } from "./tipos";

// Campos opcionais chegam como "" do formulário; viram null.
const opcional = <T extends z.ZodType>(esquema: T) =>
  z.union([z.literal("").transform(() => null), esquema]);

const esquemaTarefa = z.object({
  titulo: z
    .string()
    .trim()
    .min(3, "O título precisa ter pelo menos 3 caracteres.")
    .max(255, "O título pode ter no máximo 255 caracteres."),
  descricao: z
    .string()
    .trim()
    .max(1000, "A descrição pode ter no máximo 1000 caracteres.")
    .transform((v) => v || null),
  responsavelId: opcional(z.uuid()),
  prazo: opcional(z.iso.date("Data inválida.")),
});

const esquemaAtualizacao = z.object({
  tarefaId: z.uuid(),
  status: z.enum(STATUS_TAREFA),
  responsavelId: opcional(z.uuid()),
  prazo: opcional(z.iso.date("Data inválida.")),
});

const esquemaStatus = z.object({
  tarefaId: z.uuid(),
  status: z.enum(STATUS_TAREFA),
});

const esquemaId = z.object({ tarefaId: z.uuid() });

// O responsável precisa ser membro da mesma turma.
async function responsavelValido(turmaId: string, usuarioId: string | null) {
  if (!usuarioId) return true;
  const { rowCount } = await pool.query(
    "select 1 from membros where turma_id = $1 and usuario_id = $2",
    [turmaId, usuarioId],
  );
  return !!rowCount;
}

export async function criarTarefa(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const admin = await exigirAdmin();
  const dados = esquemaTarefa.safeParse(Object.fromEntries(formData));
  if (!dados.success) return { erro: dados.error.issues[0].message };
  const { titulo, descricao, responsavelId, prazo } = dados.data;

  if (!(await responsavelValido(admin.turmaId, responsavelId))) {
    return { erro: "O responsável precisa ser membro da turma." };
  }
  await pool.query(
    `insert into tarefas (turma_id, titulo, descricao, responsavel_id, prazo)
     values ($1, $2, $3, $4, $5)`,
    [admin.turmaId, titulo, descricao, responsavelId, prazo],
  );
  revalidatePath("/tarefas");
  revalidatePath("/dashboard");
  return { ok: "Tarefa criada." };
}

// Administrador: muda status, responsável e prazo.
export async function atualizarTarefa(formData: FormData) {
  const admin = await exigirAdmin();
  const dados = esquemaAtualizacao.safeParse(Object.fromEntries(formData));
  if (!dados.success) return;
  const { tarefaId, status, responsavelId, prazo } = dados.data;
  if (!(await responsavelValido(admin.turmaId, responsavelId))) return;

  await pool.query(
    `update tarefas set status = $1, responsavel_id = $2, prazo = $3
      where id = $4 and turma_id = $5`,
    [status, responsavelId, prazo, tarefaId, admin.turmaId],
  );
  revalidatePath("/tarefas");
  revalidatePath("/dashboard");
}

// Responsável (mesmo sem ser admin) muda só o status da própria tarefa.
export async function atualizarStatusTarefa(formData: FormData) {
  const membro = await exigirMembro();
  const dados = esquemaStatus.safeParse(Object.fromEntries(formData));
  if (!dados.success) return;

  await pool.query(
    `update tarefas set status = $1
      where id = $2 and turma_id = $3 and responsavel_id = $4`,
    [dados.data.status, dados.data.tarefaId, membro.turmaId, membro.usuarioId],
  );
  revalidatePath("/tarefas");
  revalidatePath("/dashboard");
}

export async function excluirTarefa(formData: FormData) {
  const admin = await exigirAdmin();
  const dados = esquemaId.safeParse(Object.fromEntries(formData));
  if (!dados.success) return;
  await pool.query("delete from tarefas where id = $1 and turma_id = $2", [
    dados.data.tarefaId,
    admin.turmaId,
  ]);
  revalidatePath("/tarefas");
  revalidatePath("/dashboard");
}
