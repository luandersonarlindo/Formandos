"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirAdmin } from "@/lib/dal";
import { pool, transacao } from "@/lib/db";
import { gerarCodigoConvite } from "@/lib/convite";

// Toda action daqui confere o papel de administrador e usa a turma da sessão.
// O id do membro vem do formulário, mas só vale se pertencer à turma do admin.

const esquemaMembro = z.object({ usuarioId: z.uuid() });
const esquemaPapel = esquemaMembro.extend({
  papel: z.enum(["admin", "participante"]),
});

export async function regenerarConvite() {
  const admin = await exigirAdmin();
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
}

export async function alterarPapel(formData: FormData) {
  const admin = await exigirAdmin();
  const dados = esquemaPapel.safeParse(Object.fromEntries(formData));
  if (!dados.success) return;
  const { usuarioId, papel } = dados.data;

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
  });
  revalidatePath("/admin/membros");
}

export async function removerMembro(formData: FormData) {
  const admin = await exigirAdmin();
  const dados = esquemaMembro.safeParse(Object.fromEntries(formData));
  if (!dados.success) return;
  // Sair da própria turma é outra ação (sairDaTurma).
  if (dados.data.usuarioId === admin.usuarioId) return;

  await pool.query(
    "delete from membros where turma_id = $1 and usuario_id = $2",
    [admin.turmaId, dados.data.usuarioId],
  );
  revalidatePath("/admin/membros");
}
