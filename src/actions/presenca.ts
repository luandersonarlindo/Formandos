"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirMembroEditavel } from "@/lib/dal";
import { pool } from "@/lib/db";
import { normalizarPresenca, STATUS_PRESENCA } from "@/lib/presenca-regras";
import type { EstadoForm } from "./tipos";

// Cada membro responde só por si: a turma e a pessoa vêm da sessão.

const esquema = z.object({
  status: z.enum(STATUS_PRESENCA, "Escolha se você vai."),
  acompanhantes: z.coerce.number("Informe quantos acompanhantes.").int("Informe um número inteiro."),
  observacao: z
    .string()
    .trim()
    .max(255, "A observação pode ter no máximo 255 caracteres.")
    .transform((v) => v || null),
});

export async function responderPresenca(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const membro = await exigirMembroEditavel();
  const dados = esquema.safeParse({
    status: formData.get("status"),
    acompanhantes: formData.get("acompanhantes") || 0,
    observacao: formData.get("observacao") ?? "",
  });
  if (!dados.success) return { erro: dados.error.issues[0].message };
  const { status, acompanhantes } = normalizarPresenca(dados.data.status, dados.data.acompanhantes);

  await pool.query(
    `insert into presencas (turma_id, usuario_id, status, acompanhantes, observacao)
     values ($1, $2, $3, $4, $5)
     on conflict (turma_id, usuario_id)
     do update set status = excluded.status, acompanhantes = excluded.acompanhantes,
                   observacao = excluded.observacao, updated_at = now()`,
    [membro.turmaId, membro.usuarioId, status, acompanhantes, dados.data.observacao],
  );
  revalidatePath("/dashboard");
  revalidatePath("/admin", "layout");
  return { ok: "Resposta salva." };
}
