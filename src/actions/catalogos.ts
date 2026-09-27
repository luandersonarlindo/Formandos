"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { exigirAdminEditavel } from "@/lib/dal";
import { pool, transacao } from "@/lib/db";
import { getModelo } from "@/lib/modelos";
import type { EstadoForm } from "./tipos";

// Só o catálogo PERSONALIZADO da própria turma pode ser alterado. Toda consulta
// filtra por `catalogos.turma_id = turma do admin`, o que exclui o catálogo
// padrão (turma_id nulo) e os de outras turmas.

const MAX_CATALOGOS = 10;
const MAX_CATEGORIAS = 20;
const MAX_ENQUETES_POR_CATEGORIA = 50;

const nome = (campo: string, max: number) =>
  z
    .string()
    .trim()
    .min(2, `${campo} precisa ter pelo menos 2 caracteres.`)
    .max(max, `${campo} pode ter no máximo ${max} caracteres.`);

const esquemaCatalogo = z.object({ nome: nome("O nome", 255) });
const esquemaRenomear = esquemaCatalogo.extend({ catalogoId: z.uuid() });
const esquemaCategoria = z.object({
  catalogoId: z.uuid(),
  nome: nome("O nome da categoria", 100),
});
const esquemaEnquete = z.object({
  categoriaId: z.uuid(),
  titulo: z
    .string()
    .trim()
    .min(5, "A pergunta precisa ter pelo menos 5 caracteres.")
    .max(500, "A pergunta pode ter no máximo 500 caracteres."),
  tipo: z.enum(["unica", "multipla"], "Escolha o tipo da pergunta."),
  opcoes: z.string(),
  exclusiva: z.string().trim().max(255, "A opção exclusiva é longa demais."),
});

function revalidarCatalogo(catalogoId?: string) {
  revalidatePath("/admin/votacoes");
  if (catalogoId) revalidatePath(`/admin/votacoes/${catalogoId}`);
  revalidatePath("/votacoes");
  revalidatePath("/votacoes/relatorio");
}

export async function criarCatalogo(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const admin = await exigirAdminEditavel();
  const dados = esquemaCatalogo.safeParse(Object.fromEntries(formData));
  if (!dados.success) return { erro: dados.error.issues[0].message };

  const total = await pool.query(
    "select count(*)::int as n from catalogos where turma_id = $1",
    [admin.turmaId],
  );
  if (total.rows[0].n >= MAX_CATALOGOS) {
    return { erro: `A turma pode ter no máximo ${MAX_CATALOGOS} catálogos personalizados.` };
  }

  const { rows } = await pool.query(
    "insert into catalogos (turma_id, nome) values ($1, $2) returning id",
    [admin.turmaId, dados.data.nome],
  );
  revalidarCatalogo();
  redirect(`/admin/votacoes/${rows[0].id}`);
}

// Copia um catálogo-modelo (docs/catalogos-modelo) para a turma. A cópia é um
// catálogo personalizado comum: o administrador pode editar como quiser.
export async function criarCatalogoDeModelo(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const admin = await exigirAdminEditavel();
  const dados = z.object({ modelo: z.string().min(1) }).safeParse(Object.fromEntries(formData));
  if (!dados.success) return { erro: "Escolha um modelo." };
  const modelo = await getModelo(dados.data.modelo);
  if (!modelo) return { erro: "Modelo não encontrado." };

  const catalogoId = await transacao(async (db) => {
    // Bloqueia a turma para dois cliques seguidos não passarem do limite.
    await db.query("select 1 from turmas where id = $1 for update", [admin.turmaId]);
    const { rows: total } = await db.query(
      "select count(*)::int as n from catalogos where turma_id = $1",
      [admin.turmaId],
    );
    if (total[0].n >= MAX_CATALOGOS) return null;
    const {
      rows: [{ id }],
    } = await db.query(
      "insert into catalogos (turma_id, nome) values ($1, $2) returning id",
      [admin.turmaId, modelo.nome],
    );
    for (const [i, c] of modelo.categorias.entries()) {
      const {
        rows: [{ id: categoriaId }],
      } = await db.query(
        "insert into categorias (catalogo_id, nome, ordem) values ($1, $2, $3) returning id",
        [id, c.nome, i],
      );
      for (const [j, e] of c.enquetes.entries()) {
        const {
          rows: [{ id: enqueteId }],
        } = await db.query(
          "insert into enquetes (categoria_id, titulo, tipo, ordem) values ($1, $2, $3, $4) returning id",
          [categoriaId, e.titulo, e.tipo, j],
        );
        for (const [k, o] of e.opcoes.entries()) {
          await db.query(
            "insert into opcoes (enquete_id, texto, exclusiva, ordem) values ($1, $2, $3, $4)",
            [enqueteId, o.texto, o.exclusiva, k],
          );
        }
      }
    }
    return id as string;
  });
  if (!catalogoId) {
    return { erro: `A turma pode ter no máximo ${MAX_CATALOGOS} catálogos personalizados.` };
  }
  revalidarCatalogo();
  redirect(`/admin/votacoes/${catalogoId}`);
}

export async function renomearCatalogo(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const admin = await exigirAdminEditavel();
  const dados = esquemaRenomear.safeParse(Object.fromEntries(formData));
  if (!dados.success) return { erro: dados.error.issues[0].message };
  const { rowCount } = await pool.query(
    "update catalogos set nome = $1 where id = $2 and turma_id = $3",
    [dados.data.nome, dados.data.catalogoId, admin.turmaId],
  );
  if (!rowCount) return { erro: "Catálogo não encontrado." };
  revalidarCatalogo(dados.data.catalogoId);
  return { ok: "Nome salvo." };
}

export async function excluirCatalogo(formData: FormData) {
  const admin = await exigirAdminEditavel();
  const dados = z.object({ catalogoId: z.uuid() }).safeParse(Object.fromEntries(formData));
  if (!dados.success) return;
  // Apaga em cascata categorias, enquetes, opções e votos.
  await pool.query("delete from catalogos where id = $1 and turma_id = $2", [
    dados.data.catalogoId,
    admin.turmaId,
  ]);
  revalidarCatalogo();
  redirect("/admin/votacoes");
}

export async function adicionarCategoria(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const admin = await exigirAdminEditavel();
  const dados = esquemaCategoria.safeParse(Object.fromEntries(formData));
  if (!dados.success) return { erro: dados.error.issues[0].message };
  const { catalogoId, nome } = dados.data;

  const resultado = await transacao(async (db) => {
    const { rowCount } = await db.query(
      "select 1 from catalogos where id = $1 and turma_id = $2 for update",
      [catalogoId, admin.turmaId],
    );
    if (!rowCount) return "inexistente" as const;
    const { rows } = await db.query(
      "select count(*)::int as n, coalesce(max(ordem), -1) + 1 as proxima from categorias where catalogo_id = $1",
      [catalogoId],
    );
    if (rows[0].n >= MAX_CATEGORIAS) return "limite" as const;
    await db.query(
      "insert into categorias (catalogo_id, nome, ordem) values ($1, $2, $3)",
      [catalogoId, nome, rows[0].proxima],
    );
    return "ok" as const;
  });
  if (resultado === "inexistente") return { erro: "Catálogo não encontrado." };
  if (resultado === "limite") {
    return { erro: `O catálogo pode ter no máximo ${MAX_CATEGORIAS} categorias.` };
  }
  revalidarCatalogo(catalogoId);
  return { ok: "Categoria adicionada." };
}

export async function excluirCategoria(formData: FormData) {
  const admin = await exigirAdminEditavel();
  const dados = z.object({ categoriaId: z.uuid() }).safeParse(Object.fromEntries(formData));
  if (!dados.success) return;
  await pool.query(
    `delete from categorias ca
      using catalogos c
      where ca.id = $1 and c.id = ca.catalogo_id and c.turma_id = $2`,
    [dados.data.categoriaId, admin.turmaId],
  );
  revalidarCatalogo();
}

// Opções chegam como texto, uma por linha. A opção "exclusiva" (ex.: "Sem
// preferência") só vale em pergunta de múltipla escolha e vai por último.
export async function adicionarEnquete(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const admin = await exigirAdminEditavel();
  const enviados = Object.fromEntries(formData) as Record<string, string>;
  const dados = esquemaEnquete.safeParse(enviados);
  if (!dados.success) {
    return { erro: dados.error.issues[0].message, valores: enviados };
  }
  const { categoriaId, titulo, tipo, opcoes: bruto, exclusiva } = dados.data;
  const erro = (mensagem: string): EstadoForm => ({ erro: mensagem, valores: enviados });

  const vistas = new Set<string>();
  const textos: { texto: string; exclusiva: boolean }[] = [];
  for (const linha of bruto.split("\n")) {
    const texto = linha.trim();
    if (!texto || vistas.has(texto.toLowerCase())) continue;
    vistas.add(texto.toLowerCase());
    textos.push({ texto, exclusiva: false });
  }
  if (tipo === "multipla" && exclusiva && !vistas.has(exclusiva.toLowerCase())) {
    textos.push({ texto: exclusiva, exclusiva: true });
  }
  if (textos.length < 2) return erro("Informe pelo menos 2 opções.");
  if (textos.length > 12) return erro("Use no máximo 12 opções.");
  if (textos.some((o) => o.texto.length > 255)) {
    return erro("Cada opção pode ter no máximo 255 caracteres.");
  }

  const resultado = await transacao(async (db) => {
    const { rowCount } = await db.query(
      `select 1 from categorias ca
         join catalogos c on c.id = ca.catalogo_id
        where ca.id = $1 and c.turma_id = $2
          for update of ca`,
      [categoriaId, admin.turmaId],
    );
    if (!rowCount) return { estado: "inexistente" as const };
    const { rows } = await db.query(
      `select count(*)::int as n, coalesce(max(ordem), -1) + 1 as proxima,
              (select catalogo_id from categorias where id = $1) as catalogo
         from enquetes where categoria_id = $1`,
      [categoriaId],
    );
    if (rows[0].n >= MAX_ENQUETES_POR_CATEGORIA) return { estado: "limite" as const };
    const { rows: nova } = await db.query(
      `insert into enquetes (categoria_id, titulo, tipo, ordem)
       values ($1, $2, $3, $4) returning id`,
      [categoriaId, titulo, tipo, rows[0].proxima],
    );
    for (const [i, o] of textos.entries()) {
      await db.query(
        "insert into opcoes (enquete_id, texto, exclusiva, ordem) values ($1, $2, $3, $4)",
        [nova[0].id, o.texto, o.exclusiva, i],
      );
    }
    return { estado: "ok" as const, catalogo: rows[0].catalogo as string };
  });

  if (resultado.estado === "inexistente") return erro("Categoria não encontrada.");
  if (resultado.estado === "limite") {
    return erro(`A categoria pode ter no máximo ${MAX_ENQUETES_POR_CATEGORIA} perguntas.`);
  }
  revalidarCatalogo(resultado.catalogo);
  return { ok: "Pergunta adicionada." };
}

export async function excluirEnquete(formData: FormData) {
  const admin = await exigirAdminEditavel();
  const dados = z.object({ enqueteId: z.uuid() }).safeParse(Object.fromEntries(formData));
  if (!dados.success) return;
  // Apaga também as opções e os votos da pergunta.
  await pool.query(
    `delete from enquetes e
      using categorias ca, catalogos c
      where e.id = $1 and ca.id = e.categoria_id
        and c.id = ca.catalogo_id and c.turma_id = $2`,
    [dados.data.enqueteId, admin.turmaId],
  );
  revalidarCatalogo();
}
