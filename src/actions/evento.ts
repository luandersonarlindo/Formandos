"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirAdminEditavel } from "@/lib/dal";
import { pool } from "@/lib/db";
import { ehLinkHttps } from "@/lib/evento";
import type { EstadoForm } from "./tipos";

// <input type="datetime-local"> envia "AAAA-MM-DDTHH:mm" (sem fuso).
// O horário é interpretado como horário de Brasília.
const dataHora = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Data ou hora inválida.");

const opcional = (max: number, mensagem: string) =>
  z
    .string()
    .trim()
    .max(max, mensagem)
    .transform((v) => v || null);

const esquemaEvento = z.object({
  nome: z
    .string()
    .trim()
    .min(3, "O nome da turma precisa ter pelo menos 3 caracteres.")
    .max(100, "O nome da turma pode ter no máximo 100 caracteres."),
  dataEvento: z.union([z.literal("").transform(() => null), dataHora]),
  dataFimEvento: z.union([z.literal("").transform(() => null), dataHora]),
  localEvento: z
    .string()
    .trim()
    .max(255, "O local pode ter no máximo 255 caracteres.")
    .transform((v) => v || null),
  descricao: opcional(1000, "A descrição pode ter no máximo 1000 caracteres."),
  endereco: opcional(255, "O endereço pode ter no máximo 255 caracteres."),
  linkMapa: z
    .string()
    .trim()
    .max(500, "O link do mapa pode ter no máximo 500 caracteres.")
    .refine((v) => v === "" || ehLinkHttps(v), "O link do mapa precisa começar com https://.")
    .transform((v) => v || null),
  traje: opcional(100, "O traje pode ter no máximo 100 caracteres."),
  observacoesLocal: opcional(500, "As observações podem ter no máximo 500 caracteres."),
});

const esquemaItem = z.object({
  horario: dataHora,
  titulo: z
    .string()
    .trim()
    .min(2, "O título precisa ter pelo menos 2 caracteres.")
    .max(255, "O título pode ter no máximo 255 caracteres."),
  descricao: z
    .string()
    .trim()
    .max(500, "A descrição pode ter no máximo 500 caracteres.")
    .transform((v) => v || null),
});

const MAX_ITENS_PROGRAMACAO = 100;

function revalidarEvento() {
  revalidatePath("/admin/evento");
  revalidatePath("/dashboard");
}

export async function salvarEvento(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const admin = await exigirAdminEditavel();
  const dados = esquemaEvento.safeParse(Object.fromEntries(formData));
  if (!dados.success) return { erro: dados.error.issues[0].message };
  const { nome, dataEvento, dataFimEvento, localEvento, descricao, endereco, linkMapa, traje, observacoesLocal } =
    dados.data;
  if (dataFimEvento && !dataEvento) {
    return { erro: "Informe a data de início para usar um horário de término." };
  }
  // Mesmo formato ("AAAA-MM-DDTHH:mm"), então comparar como texto funciona.
  if (dataFimEvento && dataEvento && dataFimEvento <= dataEvento) {
    return { erro: "O término precisa ser depois do início." };
  }

  await pool.query(
    `update turmas
        set nome = $1,
            data_evento = $2::timestamp at time zone 'America/Sao_Paulo',
            data_fim_evento = $3::timestamp at time zone 'America/Sao_Paulo',
            local_evento = $4, descricao = $5, endereco = $6, link_mapa = $7,
            traje = $8, observacoes_local = $9
      where id = $10`,
    [nome, dataEvento, dataFimEvento, localEvento, descricao, endereco, linkMapa, traje, observacoesLocal, admin.turmaId],
  );
  revalidarEvento();
  revalidatePath("/", "layout");
  return { ok: "Dados do evento salvos." };
}

export async function adicionarItemProgramacao(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const admin = await exigirAdminEditavel();
  const dados = esquemaItem.safeParse(Object.fromEntries(formData));
  if (!dados.success) return { erro: dados.error.issues[0].message };
  const { horario, titulo, descricao } = dados.data;

  const { rows } = await pool.query(
    "select count(*)::int as total from programacao where turma_id = $1",
    [admin.turmaId],
  );
  if (rows[0].total >= MAX_ITENS_PROGRAMACAO) {
    return { erro: `A programação pode ter no máximo ${MAX_ITENS_PROGRAMACAO} itens.` };
  }

  await pool.query(
    `insert into programacao (turma_id, horario, titulo, descricao)
     values ($1, $2::timestamp at time zone 'America/Sao_Paulo', $3, $4)`,
    [admin.turmaId, horario, titulo, descricao],
  );
  revalidarEvento();
  return { ok: "Item adicionado." };
}

export async function atualizarItemProgramacao(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const admin = await exigirAdminEditavel();
  const dados = esquemaItem
    .extend({ id: z.uuid() })
    .safeParse(Object.fromEntries(formData));
  if (!dados.success) return { erro: dados.error.issues[0].message };
  const { id, horario, titulo, descricao } = dados.data;

  const { rowCount } = await pool.query(
    `update programacao
        set horario = $1::timestamp at time zone 'America/Sao_Paulo', titulo = $2, descricao = $3
      where id = $4 and turma_id = $5`,
    [horario, titulo, descricao, id, admin.turmaId],
  );
  if (!rowCount) return { erro: "Item não encontrado." };
  revalidarEvento();
  return { ok: "Item atualizado." };
}

export async function removerItemProgramacao(formData: FormData) {
  const admin = await exigirAdminEditavel();
  const dados = z.object({ id: z.uuid() }).safeParse(Object.fromEntries(formData));
  if (!dados.success) return;
  await pool.query("delete from programacao where id = $1 and turma_id = $2", [
    dados.data.id,
    admin.turmaId,
  ]);
  revalidarEvento();
}
