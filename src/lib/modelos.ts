import "server-only";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { lerModelo } from "../../db/catalogo-md.mjs";

// Catálogos-modelo: um Markdown por perfil de turma em docs/catalogos-modelo/.
// O administrador escolhe um e ele vira um catálogo personalizado da turma.

export type ModeloCategoria = {
  nome: string;
  enquetes: {
    titulo: string;
    tipo: "unica" | "multipla";
    opcoes: { texto: string; exclusiva: boolean }[];
  }[];
};

export type Modelo = {
  slug: string;
  nome: string;
  descricao: string;
  categorias: ModeloCategoria[];
};

const PASTA = path.join(process.cwd(), "docs", "catalogos-modelo");

export async function listarModelos(): Promise<Modelo[]> {
  const arquivos = (await readdir(PASTA)).filter((a) => a.endsWith(".md")).sort();
  const modelos = await Promise.all(
    arquivos.map(async (arquivo) => ({
      slug: arquivo.slice(0, -3),
      ...lerModelo(await readFile(path.join(PASTA, arquivo), "utf8")),
    })),
  );
  return modelos as Modelo[];
}

// O slug vem do formulário: só vale se bater com um arquivo que existe na pasta.
export async function getModelo(slug: string): Promise<Modelo | null> {
  return (await listarModelos()).find((m) => m.slug === slug) ?? null;
}
