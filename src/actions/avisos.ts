"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirAdminEditavel } from "@/lib/dal";
import { pool, transacao } from "@/lib/db";
import { consumirLimite } from "@/lib/throttle";
import type { EstadoForm } from "./tipos";

const esquemaAviso = z.object({
  titulo: z
    .string()
    .trim()
    .min(3, "O título precisa ter pelo menos 3 caracteres.")
    .max(200, "O título pode ter no máximo 200 caracteres."),
  conteudo: z
    .string()
    .trim()
    .min(3, "O recado precisa ter pelo menos 3 caracteres.")
    .max(2000, "O recado pode ter no máximo 2000 caracteres."),
});

function revalidarAvisos() {
  revalidatePath("/avisos");
  revalidatePath("/dashboard");
}

export async function criarAviso(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const admin = await exigirAdminEditavel();
  const dados = esquemaAviso.safeParse(Object.fromEntries(formData));
  if (!dados.success) return { erro: dados.error.issues[0].message };

  // Teto generoso contra flood (cada aviso invalida dashboard + lista):
  // 10/hora por turma nunca pega uso normal da comissão.
  const livre = await transacao(
    async (db) => {
      const ok = await consumirLimite(db, `aviso:${admin.turmaId}`, 10, 60);
      if (!ok) return false;
      await db.query(
        "insert into avisos (turma_id, autor_id, titulo, conteudo) values ($1, $2, $3, $4)",
        [admin.turmaId, admin.usuarioId, dados.data.titulo, dados.data.conteudo],
      );
      return true;
    },
    { acao: "avisos.criar" },
  );
  if (!livre) return { erro: "Muitos avisos em pouco tempo. Aguarde alguns minutos." };
  revalidarAvisos();
  return { ok: "Aviso publicado." };
}

export async function atualizarAviso(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const admin = await exigirAdminEditavel();
  const dados = esquemaAviso
    .extend({ id: z.uuid() })
    .safeParse(Object.fromEntries(formData));
  if (!dados.success) return { erro: dados.error.issues[0].message };

  const { rowCount } = await pool.query(
    "update avisos set titulo = $1, conteudo = $2 where id = $3 and turma_id = $4",
    [dados.data.titulo, dados.data.conteudo, dados.data.id, admin.turmaId],
  );
  if (!rowCount) return { erro: "Aviso não encontrado." };
  revalidarAvisos();
  return { ok: "Aviso atualizado." };
}

export async function excluirAviso(formData: FormData) {
  const admin = await exigirAdminEditavel();
  const dados = z.object({ id: z.uuid() }).safeParse(Object.fromEntries(formData));
  if (!dados.success) return;
  await pool.query("delete from avisos where id = $1 and turma_id = $2", [
    dados.data.id,
    admin.turmaId,
  ]);
  revalidarAvisos();
}
