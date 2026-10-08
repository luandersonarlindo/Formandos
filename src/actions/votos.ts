"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirMembroEditavel } from "@/lib/dal";
import { catalogoVisivelSql } from "@/lib/catalogo-visibilidade";
import { pool, transacao } from "@/lib/db";
import type { EstadoForm } from "./tipos";

const uuid = z.uuid();

// Salva, de uma vez, os votos de todas as enquetes que o membro respondeu em um
// catálogo. Pergunta sem nenhuma opção marcada não entra no formData, então é
// ignorada: o membro pode deixar o catálogo pela metade e salvar o que fez.
//
// Regras por enquete: opções da própria enquete; seleção única = 1 opção;
// múltipla = 1 ou mais; uma opção exclusiva ("Sem preferência"…) não pode vir
// junto com outras. Pergunta com decisão fixada fica de fora.
export async function salvarVotos(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const membro = await exigirMembroEditavel();

  const catalogoId = uuid.safeParse(formData.get("catalogoId"));
  if (!catalogoId.success) return { erro: "Catálogo não encontrado." };

  // Checkboxes não marcados não são enviados: cada resposta entra como
  // "opcao-<id da enquete>". Enquetes sem resposta ficam de fora.
  const porEnquete = new Map<string, string[]>();
  for (const [chave, valor] of formData) {
    if (!chave.startsWith("opcao-")) continue;
    if (typeof valor !== "string") continue;
    const enqueteId = chave.slice("opcao-".length);
    if (!uuid.safeParse(enqueteId).success || !uuid.safeParse(valor).success) {
      return { erro: "Dados inválidos." };
    }
    const lista = porEnquete.get(enqueteId) ?? [];
    lista.push(valor);
    porEnquete.set(enqueteId, lista);
  }
  if (porEnquete.size === 0) {
    return { ok: "Nada para salvar." };
  }

  const { rows: catalogo } = await pool.query(
    `select 1 from catalogos c
      where c.id = $1 and ${catalogoVisivelSql("$2")}`,
    [catalogoId.data, membro.turmaId],
  );
  if (catalogo.length === 0) return { erro: "Catálogo não encontrado." };

  const enqueteIds = [...porEnquete.keys()];
  const { rows: enquetes } = await pool.query(
    `select e.id, e.tipo
       from enquetes e
       join categorias ca on ca.id = e.categoria_id
      where ca.catalogo_id = $1 and e.id = any($2::uuid[])`,
    [catalogoId.data, enqueteIds],
  );
  const encontradas = new Map<string, "unica" | "multipla">(
    enquetes.map((e) => [e.id, e.tipo]),
  );
  const { rows: opcoes } = await pool.query(
    `select id, enquete_id, exclusiva
       from opcoes
      where enquete_id = any($1::uuid[])`,
    [enqueteIds],
  );
  const porOpcao = new Map<string, { enqueteId: string; exclusiva: boolean }>(
    opcoes.map((o) => [o.id, { enqueteId: o.enquete_id, exclusiva: o.exclusiva }]),
  );
  const { rows: decisoes } = await pool.query(
    "select enquete_id from decisoes where turma_id = $1 and enquete_id = any($2::uuid[])",
    [membro.turmaId, enqueteIds],
  );
  const decididas = new Set(decisoes.map((d) => d.enquete_id));

  const validos = new Map<string, string[]>();
  for (const [enqueteId, opcaoIds] of porEnquete) {
    const tipo = encontradas.get(enqueteId);
    if (!tipo) return { erro: "Catálogo foi alterado. Recarregue a página." };
    if (decididas.has(enqueteId)) continue;
    const unicas = new Set(opcaoIds);
    if (unicas.size !== opcaoIds.length) {
      return { erro: "Escolha apenas uma vez cada opção." };
    }
    const exclusiva = (id: string) => porOpcao.get(id)?.exclusiva;
    if (opcaoIds.some((id) => !porOpcao.get(id) || porOpcao.get(id)!.enqueteId !== enqueteId)) {
      return { erro: "Opção inválida para esta pergunta." };
    }
    if (tipo === "unica" && opcaoIds.length !== 1) {
      return { erro: "Escolha apenas uma opção." };
    }
    if (opcaoIds.length > 1 && opcaoIds.some((id) => exclusiva(id))) {
      return { erro: "Essa opção não pode ser combinada com as outras." };
    }
    validos.set(enqueteId, opcaoIds);
  }

  await transacao(async (db) => {
    for (const [enqueteId, opcaoIds] of validos) {
      // Dois envios simultâneos do mesmo usuário na mesma enquete esperam a vez.
      await db.query("select pg_advisory_xact_lock(hashtext($1))", [
        `${membro.usuarioId}:${enqueteId}`,
      ]);
      const daEnquete = [...porOpcao.keys()].filter(
        (id) => porOpcao.get(id)!.enqueteId === enqueteId,
      );
      await db.query(
        "delete from votos where usuario_id = $1 and opcao_id = any($2::uuid[])",
        [membro.usuarioId, daEnquete],
      );
      await db.query(
        `insert into votos (turma_id, opcao_id, usuario_id)
         select $1, unnest($2::uuid[]), $3`,
        [membro.turmaId, opcaoIds, membro.usuarioId],
      );
    }
  });

  revalidatePath(`/votacoes/${catalogoId.data}`);
  revalidatePath("/votacoes");
  return { ok: "Votos salvos." };
}