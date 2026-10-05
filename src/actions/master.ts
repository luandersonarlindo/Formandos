"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { exigirMaster } from "@/lib/dal";
import { pool, transacao } from "@/lib/db";
import {
  emailContaExcluida,
  emailRemovidoDaTurma,
  enviarEmailSilencioso,
  urlDoSite,
} from "@/lib/email";
import { emailsMaster } from "@/lib/master";
import { removerMembroDaTurma } from "@/lib/saida-turma";
import { apagarUsuario, dadosParaEmail } from "@/lib/usuarios";
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

  // Nome, email e nome da turma saem lidos aqui: a transação abaixo apaga o
  // rastro do membro, e depois não há mais de onde tirar nada disso.
  const [alvo, turmas] = await Promise.all([
    dadosParaEmail(usuarioId),
    pool.query("select nome from turmas where id = $1", [turmaId]),
  ]);
  const nomeTurma = turmas.rows[0]?.nome as string | undefined;

  const removido = await transacao(async (db) => {
    const { rows } = await db.query(
      "select usuario_id, papel from membros where turma_id = $1 for update",
      [turmaId],
    );
    const alvoMembro = rows.find((r) => r.usuario_id === usuarioId);
    if (!alvoMembro) return false;
    const admins = rows.filter((r) => r.papel === "admin").length;
    // Não deixa a turma sem administrador. Para encerrá-la, exclua a turma.
    if (alvoMembro.papel === "admin" && admins === 1) return false;
    // Como sair da turma, remove também o rastro dela naquela turma.
    await removerMembroDaTurma(db, turmaId, usuarioId);
    return true;
  });

  // Só avisa quando saiu mesmo: os dois "false" são recusas do servidor, e
  // mandar "você foi removido" para quem continua na turma seria mentira.
  if (removido && alvo && nomeTurma) {
    await enviarEmailSilencioso({
      para: alvo.email,
      ...emailRemovidoDaTurma(alvo.name, nomeTurma, urlDoSite("/dashboard")),
    });
  }
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
      "select email, name from usuarios where id = $1",
      [usuarioId],
    );
    if (rows.length === 0) return { ok: false as const, erro: "Este usuário não existe mais." };
    const { email, name } = rows[0] as { email: string; name: string };
    if (emailsMaster().includes(email.toLowerCase())) {
      return { ok: false as const, erro: "Não é possível excluir um administrador master." };
    }
    if (confirmacao.toLowerCase() !== email.toLowerCase()) {
      return { ok: false as const, erro: "O email digitado não confere com o do usuário." };
    }

    const apagado = await apagarUsuario(db, usuarioId);
    if (!apagado.ok) return { ok: false as const, erro: apagado.erro };
    return { ok: true as const, turmas: apagado.turmas, email, name };
  });

  if (!resultado.ok) return { erro: resultado.erro };

  // A conta já era, mas o email ainda é a última prova de que a exclusão
  // aconteceu — e cita as turmas que existiam enquanto ela estava de pé.
  await enviarEmailSilencioso({
    para: resultado.email,
    ...emailContaExcluida(resultado.name, resultado.turmas, { porAdmin: true }),
  });

  revalidatePath("/master/usuarios");
  revalidatePath("/master/turmas");
  revalidatePath("/master");
  return { ok: "Usuário excluído." };
}
