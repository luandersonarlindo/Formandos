"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirMembroEditavel } from "@/lib/dal";
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
  const membro = await exigirMembroEditavel();
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

// O autor pode editar o texto da própria dúvida (a resposta, se houver, não muda).
export async function editarDuvida(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const membro = await exigirMembroEditavel();
  const dados = esquemaDuvida
    .extend({ duvidaId: z.uuid() })
    .safeParse(Object.fromEntries(formData));
  if (!dados.success) return { erro: dados.error.issues[0].message };

  const { rowCount } = await pool.query(
    "update duvidas set conteudo = $1 where id = $2 and turma_id = $3 and autor_id = $4",
    [dados.data.conteudo, dados.data.duvidaId, membro.turmaId, membro.usuarioId],
  );
  if (!rowCount) return { erro: "Dúvida não encontrada." };
  revalidatePath("/duvidas");
  return { ok: "Dúvida atualizada." };
}

// O autor pode apagar a própria dúvida. A comissão tem a moderação em
// /admin/duvidas, que apaga a dúvida de qualquer membro da turma.
export async function excluirDuvida(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const membro = await exigirMembroEditavel();
  const dados = z.object({ duvidaId: z.uuid() }).safeParse(Object.fromEntries(formData));
  if (!dados.success) return { erro: "Dúvida não encontrada." };

  const { rowCount } = await pool.query(
    "delete from duvidas where id = $1 and turma_id = $2 and autor_id = $3",
    [dados.data.duvidaId, membro.turmaId, membro.usuarioId],
  );
  if (!rowCount) return { erro: "Dúvida não encontrada." };
  revalidatePath("/duvidas");
  revalidatePath("/admin/duvidas");
  return { ok: "Dúvida excluída." };
}

// Liga ou desliga o upvote do usuário. Só vale para dúvidas da própria turma.
export async function alternarUpvote(duvidaId: string) {
  const membro = await exigirMembroEditavel();
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
