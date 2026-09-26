"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { exigirMaster } from "@/lib/dal";
import { transacao } from "@/lib/db";
import { emailsMaster } from "@/lib/master";
import type { EstadoForm } from "./tipos";

// Toda action daqui exige o administrador master (exigirMaster) ANTES de
// qualquer coisa. Os ids vêm do formulário e são validados como uuid; como o
// master gerencia toda a plataforma, não há filtro pela turma da sessão.

const esquemaMembro = z.object({ turmaId: z.uuid(), usuarioId: z.uuid() });
const esquemaPapel = esquemaMembro.extend({
  papel: z.enum(["admin", "participante"]),
});

function revalidarTurma(turmaId: string) {
  revalidatePath(`/master/turmas/${turmaId}`);
  revalidatePath("/master/turmas");
  revalidatePath("/master/usuarios");
  revalidatePath("/master");
}

export async function alterarPapelMaster(formData: FormData) {
  await exigirMaster();
  const dados = esquemaPapel.safeParse(Object.fromEntries(formData));
  if (!dados.success) return;
  const { turmaId, usuarioId, papel } = dados.data;

  await transacao(async (db) => {
    const { rows } = await db.query(
      "select usuario_id, papel from membros where turma_id = $1 for update",
      [turmaId],
    );
    const alvo = rows.find((r) => r.usuario_id === usuarioId);
    if (!alvo) return;
    const admins = rows.filter((r) => r.papel === "admin").length;
    // A turma nunca fica sem administrador.
    if (alvo.papel === "admin" && papel === "participante" && admins === 1) {
      return;
    }
    await db.query(
      "update membros set papel = $1 where turma_id = $2 and usuario_id = $3",
      [papel, turmaId, usuarioId],
    );
  });
  revalidarTurma(turmaId);
}

export async function removerMembroMaster(formData: FormData) {
  await exigirMaster();
  const dados = esquemaMembro.safeParse(Object.fromEntries(formData));
  if (!dados.success) return;
  const { turmaId, usuarioId } = dados.data;

  await transacao(async (db) => {
    const { rows } = await db.query(
      "select usuario_id, papel from membros where turma_id = $1 for update",
      [turmaId],
    );
    const alvo = rows.find((r) => r.usuario_id === usuarioId);
    if (!alvo) return;
    const admins = rows.filter((r) => r.papel === "admin").length;
    // Não deixa a turma sem administrador. Para encerrá-la, exclua a turma.
    if (alvo.papel === "admin" && admins === 1) return;
    await db.query(
      "delete from membros where turma_id = $1 and usuario_id = $2",
      [turmaId, usuarioId],
    );
  });
  revalidarTurma(turmaId);
}

// Exclusões exigem digitar uma confirmação (o nome da turma ou o email do
// usuário) para evitar cliques acidentais.

const esquemaExcluirTurma = z.object({
  turmaId: z.uuid(),
  confirmacao: z.string().trim(),
});

export async function excluirTurma(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  await exigirMaster();
  const dados = esquemaExcluirTurma.safeParse(Object.fromEntries(formData));
  if (!dados.success) return { erro: "Dados inválidos." };
  const { turmaId, confirmacao } = dados.data;

  const resultado = await transacao(async (db) => {
    const { rows } = await db.query("select nome from turmas where id = $1", [
      turmaId,
    ]);
    if (rows.length === 0) return "inexistente" as const;
    if (confirmacao !== rows[0].nome) return "confirmacao" as const;
    // Apaga em cascata membros, catálogos, votos, dúvidas, tarefas e terceiros.
    await db.query("delete from turmas where id = $1", [turmaId]);
    return "ok" as const;
  });

  if (resultado === "inexistente") return { erro: "Esta turma não existe mais." };
  if (resultado === "confirmacao") {
    return { erro: "O nome digitado não confere com o da turma." };
  }
  revalidarTurma(turmaId);
  redirect("/master/turmas");
}

const esquemaExcluirUsuario = z.object({
  usuarioId: z.uuid(),
  confirmacao: z.string().trim(),
});

export async function excluirUsuario(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const master = await exigirMaster();
  const dados = esquemaExcluirUsuario.safeParse(Object.fromEntries(formData));
  if (!dados.success) return { erro: "Dados inválidos." };
  const { usuarioId, confirmacao } = dados.data;
  if (usuarioId === master.id) {
    return { erro: "Você não pode excluir a própria conta." };
  }

  const resultado = await transacao(async (db) => {
    const { rows } = await db.query(
      "select email from usuarios where id = $1",
      [usuarioId],
    );
    if (rows.length === 0) return { erro: "Este usuário não existe mais." };
    const email: string = rows[0].email;
    if (emailsMaster().includes(email.toLowerCase())) {
      return { erro: "Não é possível excluir um administrador master." };
    }
    if (confirmacao.toLowerCase() !== email.toLowerCase()) {
      return { erro: "O email digitado não confere com o do usuário." };
    }

    // Trava os membros das turmas dele para conferir os administradores.
    const { rows: membros } = await db.query(
      `select m.turma_id, m.usuario_id, m.papel, t.nome
         from membros m
         join turmas t on t.id = m.turma_id
        where m.turma_id in (select turma_id from membros where usuario_id = $1)
        for update of m`,
      [usuarioId],
    );
    const porTurma = new Map<string, typeof membros>();
    for (const m of membros) {
      porTurma.set(m.turma_id, [...(porTurma.get(m.turma_id) ?? []), m]);
    }
    const vazias: string[] = [];
    for (const [turmaId, lista] of porTurma) {
      const ele = lista.find((m) => m.usuario_id === usuarioId);
      const admins = lista.filter((m) => m.papel === "admin").length;
      if (lista.length === 1) vazias.push(turmaId);
      else if (ele?.papel === "admin" && admins === 1) {
        return {
          erro: `É o único administrador de "${lista[0].nome}". Promova outro membro antes.`,
        };
      }
    }
    // Turma que ficaria sem ninguém é removida junto.
    for (const turmaId of vazias) {
      await db.query("delete from turmas where id = $1", [turmaId]);
    }
    // Apaga em cascata sessões, contas, participação, votos e dúvidas dele.
    await db.query("delete from usuarios where id = $1", [usuarioId]);
    return { ok: "Usuário excluído." };
  });

  revalidatePath("/master/usuarios");
  revalidatePath("/master/turmas");
  revalidatePath("/master");
  return resultado;
}
