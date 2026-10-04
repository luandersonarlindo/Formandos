"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirAdminEditavel } from "@/lib/dal";
import { catalogoVisivelSql } from "@/lib/catalogo-visibilidade";
import { pool, transacao } from "@/lib/db";
import type { EstadoForm } from "./tipos";

// A decisão vale para a turma do administrador (vem da sessão). O id da enquete
// e das opções vêm do formulário e são conferidos: a enquete precisa ser do
// catálogo padrão ou da turma, e as opções precisam ser dela.

const esquemaFixar = z.object({
  enqueteId: z.uuid(),
  opcaoIds: z.array(z.uuid()).min(1, "Escolha pelo menos uma opção."),
});

function revalidarDecisoes() {
  revalidatePath("/dashboard");
  revalidatePath("/votacoes", "layout");
  revalidatePath("/admin/votacoes", "layout");
}

// Fixa (ou troca) a decisão da turma em uma enquete. Enquanto houver decisão, a
// enquete não aceita mais votos; reabrir a votação apaga a decisão.
export async function fixarDecisao(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const admin = await exigirAdminEditavel();
  const dados = esquemaFixar.safeParse({
    enqueteId: formData.get("enqueteId"),
    opcaoIds: [...new Set(formData.getAll("opcaoId"))],
  });
  if (!dados.success) return { erro: dados.error.issues[0].message };
  const { enqueteId, opcaoIds } = dados.data;

  const resultado = await transacao(async (db) => {
    const { rows: enquetes } = await db.query(
      `select e.tipo
         from enquetes e
         join categorias ca on ca.id = e.categoria_id
         join catalogos c on c.id = ca.catalogo_id
        where e.id = $1 and ${catalogoVisivelSql("$2")}`,
      [enqueteId, admin.turmaId],
    );
    if (enquetes.length === 0) return "inexistente" as const;
    if (enquetes[0].tipo === "unica" && opcaoIds.length !== 1) return "unica" as const;

    const { rows: opcoes } = await db.query(
      "select id, exclusiva from opcoes where enquete_id = $1 and id = any($2::uuid[])",
      [enqueteId, opcaoIds],
    );
    if (opcoes.length !== opcaoIds.length) return "opcao" as const;
    if (opcoes.length > 1 && opcoes.some((o) => o.exclusiva)) return "exclusiva" as const;

    await db.query("delete from decisoes where turma_id = $1 and enquete_id = $2", [
      admin.turmaId,
      enqueteId,
    ]);
    await db.query(
      `insert into decisoes (turma_id, enquete_id, opcao_id, decidido_por)
       select $1, $2, unnest($3::uuid[]), $4`,
      [admin.turmaId, enqueteId, opcaoIds, admin.usuarioId],
    );
    return "ok" as const;
  });

  if (resultado === "inexistente") return { erro: "Enquete não encontrada." };
  if (resultado === "unica") return { erro: "Escolha apenas uma opção." };
  if (resultado === "opcao") return { erro: "Opção inválida para esta enquete." };
  if (resultado === "exclusiva") {
    return { erro: "Essa opção não pode ser combinada com as outras." };
  }
  revalidarDecisoes();
  return { ok: "Decisão fixada. A votação desta pergunta foi encerrada." };
}

export async function reabrirVotacao(formData: FormData) {
  const admin = await exigirAdminEditavel();
  const dados = z.object({ enqueteId: z.uuid() }).safeParse(Object.fromEntries(formData));
  if (!dados.success) return;
  await pool.query("delete from decisoes where turma_id = $1 and enquete_id = $2", [
    admin.turmaId,
    dados.data.enqueteId,
  ]);
  revalidarDecisoes();
}
