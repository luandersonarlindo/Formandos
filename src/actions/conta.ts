"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { COOKIE_TURMA, exigirSessao } from "@/lib/dal";
import { transacao } from "@/lib/db";
import { emailContaExcluida, enviarEmailSilencioso } from "@/lib/email";
import { ehMaster } from "@/lib/master";
import { apagarUsuario } from "@/lib/usuarios";
import type { EstadoForm } from "./tipos";

// Cada pessoa só apaga a própria conta: o id vem da sessão, nunca do formulário.

const esquema = z.object({ confirmacao: z.string().trim() });

// O nome é o que as outras pessoas da turma leem em membros, presença, avisos e
// tarefas. Como quase todo mundo usa um email diferente do nome, ele precisa ser
// corrigível depois do cadastro. A coluna `usuarios.name` é text e nasce do
// Better Auth: o limite de tamanho é nosso, para não depender do banco.
const esquemaNome = z.object({
  nome: z
    .string()
    // Espaços repetidos e das pontas viram um só: o nome aparece em telas
    // estreitas e sobra espaço é sempre erro de digitação.
    .transform((v) => v.replace(/\s+/g, " ").trim())
    .pipe(
      z
        .string()
        .min(2, "O nome precisa ter pelo menos 2 caracteres.")
        .max(120, "O nome pode ter no máximo 120 caracteres."),
    ),
});

export async function atualizarMeuNome(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const { user } = await exigirSessao();
  const dados = esquemaNome.safeParse(Object.fromEntries(formData));
  if (!dados.success) return { erro: dados.error.issues[0].message };
  const nome = dados.data.nome;
  if (nome === user.name) return { ok: "Nome atualizado." };

  try {
    // Pelo Better Auth, e não com update direto: ele regrava o cookie de sessão
    // com o nome novo, então o cabeçalho e o avatar já saem atualizados.
    await auth.api.updateUser({ body: { name: nome }, headers: await headers() });
  } catch {
    return { erro: "Não foi possível atualizar o nome. Tente novamente." };
  }
  return { ok: "Nome atualizado." };
}

export async function excluirMinhaConta(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const { user } = await exigirSessao();
  const dados = esquema.safeParse(Object.fromEntries(formData));
  if (!dados.success) return { erro: "Dados inválidos." };
  // O master vem de uma variável de ambiente: apagar a conta não tira o acesso.
  if (ehMaster(user)) {
    return { erro: "Contas de administrador master não podem ser excluídas por aqui." };
  }
  if (dados.data.confirmacao.toLowerCase() !== user.email.toLowerCase()) {
    return { erro: "O email digitado não confere com o da sua conta." };
  }

  const resultado = await transacao((db) => apagarUsuario(db, user.id));
  if (!resultado.ok) return { erro: resultado.erro };

  // O email sai depois da transação e antes do redirect: ele cita as turmas que
  // só existiam enquanto a conta estava de pé, e o catch garante que uma falha
  // de SMTP não segure a pessoa numa tela de conta que não existe mais.
  await enviarEmailSilencioso({
    para: user.email,
    ...emailContaExcluida(user.name, resultado.turmas),
  });

  // As sessões foram apagadas junto com a conta; só resta limpar o cookie da turma.
  (await cookies()).delete(COOKIE_TURMA);
  redirect("/");
}
