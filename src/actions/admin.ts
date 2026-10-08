"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirAdminEditavel } from "@/lib/dal";
import { pool, transacao } from "@/lib/db";
import { emailRemovidoDaTurma, enviarEmailSilencioso, urlDoSite } from "@/lib/email";
import { removerMembroDaTurma } from "@/lib/saida-turma";
import { dadosParaEmail } from "@/lib/usuarios";
import type { EstadoForm } from "./tipos";
import { gerarCodigoConvite } from "@/lib/convite";

// Toda action daqui confere o papel de administrador e usa a turma da sessão.
// O id do membro vem do formulário, mas só vale se pertencer à turma do admin.

const esquemaMembro = z.object({ usuarioId: z.uuid() });
const esquemaPapel = esquemaMembro.extend({
  papel: z.enum(["admin", "participante"]),
});

export async function regenerarConvite(): Promise<EstadoForm> {
  const admin = await exigirAdminEditavel();
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    try {
      await pool.query("update turmas set codigo_convite = $1 where id = $2", [
        gerarCodigoConvite(),
        admin.turmaId,
      ]);
      break;
    } catch (erro) {
      if ((erro as { code?: string }).code !== "23505") throw erro;
    }
  }
  revalidatePath("/admin/convite");
  return { ok: "Novo código gerado." };
}

export async function alterarPapel(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const admin = await exigirAdminEditavel();
  const dados = esquemaPapel.safeParse(Object.fromEntries(formData));
  if (!dados.success) return { erro: "Dados inválidos." };
  const { usuarioId, papel } = dados.data;

  let alterado = false;
  await transacao(async (db) => {
    const { rows } = await db.query(
      "select usuario_id, papel from membros where turma_id = $1 for update",
      [admin.turmaId],
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
      [papel, admin.turmaId, usuarioId],
    );
    alterado = true;
  });
  revalidatePath("/admin/membros");
  if (!alterado) return { erro: "A turma não pode ficar sem administrador." };
  return { ok: "Papel atualizado." };
}

export async function removerMembro(formData: FormData) {
  const admin = await exigirAdminEditavel();
  const dados = esquemaMembro.safeParse(Object.fromEntries(formData));
  if (!dados.success) return;
  // Sair da própria turma é outra ação (sairDaTurma).
  if (dados.data.usuarioId === admin.usuarioId) return;

  // Nome e email do removido saem lidos agora: logo abaixo a transação apaga o
  // rastro dele, e o email precisa saber para quem falar.
  const alvo = await dadosParaEmail(dados.data.usuarioId);
  if (!alvo) return;

  // Expulso da turma é apagar o rastro dela: votos, dúvidas, presença e upvotes.
  await transacao((db) => removerMembroDaTurma(db, admin.turmaId, dados.data.usuarioId));
  await enviarEmailSilencioso({
    para: alvo.email,
    ...emailRemovidoDaTurma(alvo.name, admin.turmaNome, urlDoSite("/dashboard")),
  });
  revalidatePath("/admin/membros");
}

// Moderação de dúvidas ------------------------------------------------------
// Todas filtram por turma_id da sessão: um admin só mexe nas dúvidas da sua turma.

const esquemaDuvidaId = z.object({ duvidaId: z.uuid() });
const esquemaResposta = esquemaDuvidaId.extend({
  resposta: z
    .string()
    .trim()
    .max(1000, "A resposta pode ter no máximo 1000 caracteres."),
});

function revalidarDuvidas() {
  revalidatePath("/admin/duvidas");
  revalidatePath("/duvidas");
}

// Salva a resposta oficial. Com texto, a dúvida vira "respondida";
// com o campo vazio, a resposta é removida e a dúvida volta a "aberta".
export async function responderDuvida(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const admin = await exigirAdminEditavel();
  const dados = esquemaResposta.safeParse(Object.fromEntries(formData));
  if (!dados.success) return { erro: dados.error.issues[0].message };
  const { duvidaId, resposta } = dados.data;

  const { rowCount } = await pool.query(
    `update duvidas
        set resposta = $1, respondida = $2
      where id = $3 and turma_id = $4`,
    [resposta || null, resposta !== "", duvidaId, admin.turmaId],
  );
  if (!rowCount) return { erro: "Dúvida não encontrada." };
  revalidarDuvidas();
  return { ok: resposta ? "Resposta salva." : "Resposta removida." };
}

export async function alternarDestaque(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const admin = await exigirAdminEditavel();
  const dados = esquemaDuvidaId.safeParse(Object.fromEntries(formData));
  if (!dados.success) return { erro: "Dúvida não encontrada." };
  const { rowCount } = await pool.query(
    "update duvidas set destaque = not destaque where id = $1 and turma_id = $2",
    [dados.data.duvidaId, admin.turmaId],
  );
  if (!rowCount) return { erro: "Dúvida não encontrada." };
  revalidarDuvidas();
  return { ok: "Destaque atualizado." };
}

export async function alternarRespondida(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const admin = await exigirAdminEditavel();
  const dados = esquemaDuvidaId.safeParse(Object.fromEntries(formData));
  if (!dados.success) return { erro: "Dúvida não encontrada." };
  const { rowCount } = await pool.query(
    "update duvidas set respondida = not respondida where id = $1 and turma_id = $2",
    [dados.data.duvidaId, admin.turmaId],
  );
  if (!rowCount) return { erro: "Dúvida não encontrada." };
  revalidarDuvidas();
  return { ok: "Situação atualizada." };
}

export async function apagarDuvida(formData: FormData) {
  const admin = await exigirAdminEditavel();
  const dados = esquemaDuvidaId.safeParse(Object.fromEntries(formData));
  if (!dados.success) return;
  await pool.query("delete from duvidas where id = $1 and turma_id = $2", [
    dados.data.duvidaId,
    admin.turmaId,
  ]);
  revalidarDuvidas();
}
