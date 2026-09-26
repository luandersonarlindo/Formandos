"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirMembro } from "@/lib/dal";
import { pool, transacao } from "@/lib/db";
import type { EstadoForm } from "./tipos";

const esquemaDuvida = z.object({
  conteudo: z
    .string()
    .trim()
    .min(5, "Escreva a sua dúvida com pelo menos 5 caracteres.")
    .max(500, "A dúvida pode ter no máximo 500 caracteres."),
});

export async function enviarDuvida(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const membro = await exigirMembro();
  const texto = String(formData.get("conteudo") ?? "");

  const dados = esquemaDuvida.safeParse({ conteudo: texto });
  if (!dados.success) {
    return { erro: dados.error.issues[0].message, valor: texto };
  }

  await pool.query(
    "insert into duvidas (turma_id, autor_id, conteudo) values ($1, $2, $3)",
    [membro.turmaId, membro.usuarioId, dados.data.conteudo],
  );
  revalidatePath("/duvidas");
  return { ok: "Dúvida enviada." };
}

// Liga ou desliga o upvote do usuário. Só vale para dúvidas da própria turma.
export async function alternarUpvote(duvidaId: string) {
  const membro = await exigirMembro();
  if (!z.uuid().safeParse(duvidaId).success) return;

  await transacao(async (db) => {
    const { rowCount } = await db.query(
      "select 1 from duvidas where id = $1 and turma_id = $2",
      [duvidaId, membro.turmaId],
    );
    if (!rowCount) return;

    const removido = await db.query(
      "delete from duvida_upvotes where duvida_id = $1 and usuario_id = $2",
      [duvidaId, membro.usuarioId],
    );
    if (removido.rowCount === 0) {
      await db.query(
        `insert into duvida_upvotes (duvida_id, usuario_id) values ($1, $2)
         on conflict do nothing`,
        [duvidaId, membro.usuarioId],
      );
    }
  });
  revalidatePath("/duvidas");
}
