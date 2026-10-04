// Executa db/schema.sql no banco apontado por DATABASE_URL. Uso: npm run db:schema
//
// É o mesmo esquema que db/migrate.mjs aplica no build da Vercel, para o banco
// local não ficar atrasado em relação ao deploy. Em produção quem roda é o
// prebuild; aqui a conexão é a do .env.local e por isso pode ser o pooler.
import { readFile } from "node:fs/promises";
import pg from "pg";

export async function aplicarSchema(client) {
  const sql = await readFile(new URL("./schema.sql", import.meta.url), "utf8");
  await client.query("begin");
  try {
    await client.query(sql);
    await client.query("commit");
  } catch (erro) {
    await client.query("rollback");
    throw erro;
  }
}

// Só quando chamado direto (`node db/apply-schema.mjs`), não quando importado.
if (import.meta.url === `file://${process.argv[1]}`) {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await aplicarSchema(client);
    console.log("Esquema aplicado.");
  } finally {
    await client.end();
  }
}