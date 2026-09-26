// Insere o catálogo padrão a partir de docs/catalogo-enquetes.md.
// Uso: npm run db:seed        (grava no banco)
//      npm run db:seed -- --dry   (só mostra o que leria, sem tocar no banco)
import { readFile } from "node:fs/promises";
import pg from "pg";

const NOME_CATALOGO = "Catálogo Padrão";
const dry = process.argv.includes("--dry");

export function lerCatalogo(markdown) {
  const categorias = [];
  let categoria = null;
  let enquete = null;

  for (const linha of markdown.split("\n")) {
    let m;
    if ((m = linha.match(/^## \d+\.\s+(.+)$/))) {
      categoria = { nome: m[1].trim(), enquetes: [] };
      categorias.push(categoria);
      enquete = null;
    } else if (categoria && (m = linha.match(/^### \d+\.\d+\.\s+(.+)$/))) {
      enquete = { titulo: m[1].trim(), tipo: "unica", opcoes: [] };
      categoria.enquetes.push(enquete);
    } else if (enquete && (m = linha.match(/^> \*\*Tipo:\*\*\s+(.+)$/))) {
      enquete.tipo = /m[úu]ltipla/i.test(m[1]) ? "multipla" : "unica";
    } else if (enquete && (m = linha.match(/^- `\[\s*(.+?)\s*\]`(.*)$/))) {
      enquete.opcoes.push({
        texto: m[1],
        exclusiva: /\(exclusiva\)/i.test(m[2]),
      });
    }
  }
  return categorias;
}

const md = await readFile(
  new URL("../docs/catalogo-enquetes.md", import.meta.url),
  "utf8",
);
const categorias = lerCatalogo(md);
const totalEnquetes = categorias.reduce((n, c) => n + c.enquetes.length, 0);
const totalOpcoes = categorias.reduce(
  (n, c) => n + c.enquetes.reduce((k, e) => k + e.opcoes.length, 0),
  0,
);
console.log(
  `Lido: ${categorias.length} categorias, ${totalEnquetes} enquetes, ${totalOpcoes} opções.`,
);

if (dry) {
  for (const c of categorias) {
    console.log(`- ${c.nome}`);
    for (const e of c.enquetes)
      console.log(`    [${e.tipo}] ${e.titulo} (${e.opcoes.length} opções)`);
  }
  process.exit(0);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await client.query("begin");
  const existente = await client.query(
    "select 1 from catalogos where turma_id is null and nome = $1",
    [NOME_CATALOGO],
  );
  if (existente.rowCount > 0) {
    console.log("Catálogo padrão já existe. Nada a fazer.");
  } else {
    const {
      rows: [{ id: catalogoId }],
    } = await client.query(
      "insert into catalogos (turma_id, nome) values (null, $1) returning id",
      [NOME_CATALOGO],
    );
    for (const [i, c] of categorias.entries()) {
      const {
        rows: [{ id: categoriaId }],
      } = await client.query(
        "insert into categorias (catalogo_id, nome, ordem) values ($1, $2, $3) returning id",
        [catalogoId, c.nome, i],
      );
      for (const [j, e] of c.enquetes.entries()) {
        const {
          rows: [{ id: enqueteId }],
        } = await client.query(
          "insert into enquetes (categoria_id, titulo, tipo, ordem) values ($1, $2, $3, $4) returning id",
          [categoriaId, e.titulo, e.tipo, j],
        );
        for (const [k, o] of e.opcoes.entries()) {
          await client.query(
            "insert into opcoes (enquete_id, texto, exclusiva, ordem) values ($1, $2, $3, $4)",
            [enqueteId, o.texto, o.exclusiva, k],
          );
        }
      }
    }
    console.log("Catálogo padrão inserido.");
  }
  await client.query("commit");
} catch (erro) {
  await client.query("rollback");
  throw erro;
} finally {
  await client.end();
}
