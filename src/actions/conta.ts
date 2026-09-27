"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { COOKIE_TURMA, exigirSessao } from "@/lib/dal";
import { transacao } from "@/lib/db";
import { ehMaster } from "@/lib/master";
import { apagarUsuario } from "@/lib/usuarios";
import type { EstadoForm } from "./tipos";

// Cada pessoa só apaga a própria conta: o id vem da sessão, nunca do formulário.

const esquema = z.object({ confirmacao: z.string().trim() });

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

  const erro = await transacao((db) => apagarUsuario(db, user.id));
  if (erro) return { erro };

  // As sessões foram apagadas junto com a conta; só resta limpar o cookie da turma.
  (await cookies()).delete(COOKIE_TURMA);
  redirect("/");
}
