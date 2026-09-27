// Grava o catálogo padrão a partir de docs/catalogo-enquetes.md.
// Se o catálogo ainda não existe, insere tudo. Se já existe, só acrescenta o que
// falta (categorias, perguntas e opções) e atualiza ordem, tipo e exclusiva:
// nada é apagado, então os votos já dados continuam valendo. Perguntas e
// opções que saíram do Markdown ficam no banco e são só avisadas.
// Uso: npm run db:seed        (grava no banco)
//      npm run db:seed -- --dry   (só mostra o que leria, sem tocar no banco)
import { readFile } from "node:fs/promises";
import pg from "pg";
import { lerCatalogo } from "./catalogo-md.mjs";

const NOME_CATALOGO = "Catálogo Padrão";
const dry = process.argv.includes("--dry");

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

const novos = { categorias: 0, enquetes: 0, opcoes: 0 };
const avisos = [];

// Devolve o id da linha com essa chave ou insere e devolve o id novo.
async function acharOuInserir(select, valoresSelect, insert, valoresInsert, contador) {
  const { rows } = await client.query(select, valoresSelect);
  if (rows.length > 0) return rows[0].id;
  const {
    rows: [{ id }],
  } = await client.query(insert, valoresInsert);
  novos[contador]++;
  return id;
}

try {
  await client.query("begin");
  const antigo = await client.query(
    "select id from catalogos where turma_id is null and nome = $1",
    [NOME_CATALOGO],
  );
  const catalogoId =
    antigo.rows[0]?.id ??
    (
      await client.query(
        "insert into catalogos (turma_id, nome) values (null, $1) returning id",
        [NOME_CATALOGO],
      )
    ).rows[0].id;
  const jaExistia = antigo.rowCount > 0;

  const categoriasNoMd = new Set();
  for (const [i, c] of categorias.entries()) {
    categoriasNoMd.add(c.nome);
    const categoriaId = await acharOuInserir(
      "select id from categorias where catalogo_id = $1 and nome = $2",
      [catalogoId, c.nome],
      "insert into categorias (catalogo_id, nome, ordem) values ($1, $2, $3) returning id",
      [catalogoId, c.nome, i],
      "categorias",
    );
    await client.query("update categorias set ordem = $2 where id = $1", [categoriaId, i]);

    for (const [j, e] of c.enquetes.entries()) {
      const enqueteId = await acharOuInserir(
        "select id from enquetes where categoria_id = $1 and titulo = $2",
        [categoriaId, e.titulo],
        "insert into enquetes (categoria_id, titulo, tipo, ordem) values ($1, $2, $3, $4) returning id",
        [categoriaId, e.titulo, e.tipo, j],
        "enquetes",
      );
      await client.query("update enquetes set tipo = $2, ordem = $3 where id = $1", [
        enqueteId,
        e.tipo,
        j,
      ]);

      for (const [k, o] of e.opcoes.entries()) {
        const opcaoId = await acharOuInserir(
          "select id from opcoes where enquete_id = $1 and texto = $2",
          [enqueteId, o.texto],
          "insert into opcoes (enquete_id, texto, exclusiva, ordem) values ($1, $2, $3, $4) returning id",
          [enqueteId, o.texto, o.exclusiva, k],
          "opcoes",
        );
        await client.query("update opcoes set exclusiva = $2, ordem = $3 where id = $1", [
          opcaoId,
          o.exclusiva,
          k,
        ]);
      }
    }
  }

  // Só avisa do que sobrou no banco e não está mais no Markdown.
  const { rows: sobras } = await client.query(
    `select ca.nome as categoria, e.titulo
       from enquetes e join categorias ca on ca.id = e.categoria_id
      where ca.catalogo_id = $1`,
    [catalogoId],
  );
  const titulosNoMd = new Set(
    categorias.flatMap((c) => c.enquetes.map((e) => `${c.nome}|${e.titulo}`)),
  );
  for (const s of sobras) {
    if (!titulosNoMd.has(`${s.categoria}|${s.titulo}`)) {
      avisos.push(`${s.categoria} / ${s.titulo}`);
    }
  }

  await client.query("commit");
  console.log(
    jaExistia
      ? `Catálogo padrão atualizado: +${novos.categorias} categorias, +${novos.enquetes} perguntas, +${novos.opcoes} opções.`
      : "Catálogo padrão inserido.",
  );
  for (const a of avisos) console.log(`Fora do Markdown (mantida no banco): ${a}`);
} catch (erro) {
  await client.query("rollback");
  throw erro;
} finally {
  await client.end();
}
