"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirMembroEditavel } from "@/lib/dal";
import { pool, transacao } from "@/lib/db";
import type { EstadoForm } from "./tipos";

const esquemaVoto = z.object({
  enqueteId: z.uuid(),
  opcaoIds: z.array(z.uuid()).min(1, "Escolha pelo menos uma opção."),
});

// Registra (ou substitui) o voto do usuário em uma enquete.
// Regras: enquete do catálogo padrão ou da própria turma; opções da própria
// enquete; seleção única = 1 opção; múltipla = 1 ou mais; uma opção
// exclusiva ("Sem preferência"…) não pode vir junto com outras.
export async function votar(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const membro = await exigirMembroEditavel();

  const dados = esquemaVoto.safeParse({
    enqueteId: formData.get("enqueteId"),
    opcaoIds: [...new Set(formData.getAll("opcaoId"))],
  });
  if (!dados.success) return { erro: dados.error.issues[0].message };
  const { enqueteId, opcaoIds } = dados.data;

  const { rows: enquetes } = await pool.query(
    `select e.tipo, ca.catalogo_id
       from enquetes e
       join categorias ca on ca.id = e.categoria_id
       join catalogos c on c.id = ca.catalogo_id
      where e.id = $1 and (c.turma_id is null or c.turma_id = $2)`,
    [enqueteId, membro.turmaId],
  );
  if (enquetes.length === 0) return { erro: "Enquete não encontrada." };
  const { tipo, catalogo_id: catalogoId } = enquetes[0];

  const { rows: opcoes } = await pool.query(
    "select id, exclusiva from opcoes where enquete_id = $1",
    [enqueteId],
  );
  const validas = new Map<string, boolean>(
    opcoes.map((o) => [o.id, o.exclusiva]),
  );
  if (opcaoIds.some((id) => !validas.has(id))) {
    return { erro: "Opção inválida para esta enquete." };
  }
  if (tipo === "unica" && opcaoIds.length !== 1) {
    return { erro: "Escolha apenas uma opção." };
  }
  if (opcaoIds.length > 1 && opcaoIds.some((id) => validas.get(id))) {
    return { erro: "Essa opção não pode ser combinada com as outras." };
  }

  await transacao(async (db) => {
    // Dois envios simultâneos do mesmo usuário na mesma enquete esperam a vez.
    await db.query("select pg_advisory_xact_lock(hashtext($1))", [
      `${membro.usuarioId}:${enqueteId}`,
    ]);
    await db.query(
      "delete from votos where usuario_id = $1 and opcao_id = any($2::uuid[])",
      [membro.usuarioId, opcoes.map((o) => o.id)],
    );
    await db.query(
      `insert into votos (turma_id, opcao_id, usuario_id)
       select $1, unnest($2::uuid[]), $3`,
      [membro.turmaId, opcaoIds, membro.usuarioId],
    );
  });

  revalidatePath(`/votacoes/${catalogoId}`);
  revalidatePath("/votacoes");
  return { ok: "Voto salvo." };
}
