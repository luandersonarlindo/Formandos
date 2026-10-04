"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirAdminEditavel, exigirMembroEditavel } from "@/lib/dal";
import { pool, transacao } from "@/lib/db";
import {
  normalizarPresenca,
  STATUS_PRESENCA,
  TETO_ACOMPANHANTES,
} from "@/lib/presenca-regras";
import type { EstadoForm } from "./tipos";

// Cada membro responde só por si: a turma e a pessoa vêm da sessão. Quantos
// acompanhantes são permitidos é o limite que o admin da turma escolheu.

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
  const { status, acompanhantes } = normalizarPresenca(
    dados.data.status,
    dados.data.acompanhantes,
    membro.maxAcompanhantes,
  );

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

const esquemaLimite = z.object({
  maxAcompanhantes: z.coerce
    .number("Informe um número.")
    .int("Informe um número inteiro.")
    .min(0, "O limite não pode ser negativo.")
    .max(TETO_ACOMPANHANTES, `O limite não pode passar de ${TETO_ACOMPANHANTES}.`),
});

// Limite de acompanhantes da turma. Baixar o limite também corta as respostas
// que ficaram acima dele, senão o total de pessoas esperada não fecharia.
export async function salvarLimiteAcompanhantes(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const admin = await exigirAdminEditavel();
  const dados = esquemaLimite.safeParse(Object.fromEntries(formData));
  if (!dados.success) return { erro: dados.error.issues[0].message };
  const limite = dados.data.maxAcompanhantes;

  const cortados = await transacao(async (db) => {
    await db.query("update turmas set max_acompanhantes = $1 where id = $2", [limite, admin.turmaId]);
    const { rowCount } = await db.query(
      `update presencas
          set acompanhantes = $1, updated_at = now()
        where turma_id = $2 and status = 'vou' and acompanhantes > $1`,
      [limite, admin.turmaId],
    );
    return rowCount ?? 0;
  });

  revalidatePath("/admin/presenca");
  revalidatePath("/dashboard");
  revalidatePath("/", "layout");
  return {
    ok:
      cortados > 0
        ? `Limite salvo. ${cortados} ${cortados === 1 ? "resposta foi ajustada" : "respostas foram ajustadas"} para o novo limite.`
        : "Limite salvo.",
  };
}