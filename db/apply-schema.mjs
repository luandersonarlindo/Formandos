// Executa db/schema.sql no banco apontado por DATABASE_URL.
// Uso: npm run db:schema
import { readFile } from "node:fs/promises";
import pg from "pg";

const sql = await readFile(new URL("./schema.sql", import.meta.url), "utf8");
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

await client.connect();
try {
  await client.query("begin");
  await client.query(sql);
  await client.query("commit");
  console.log("Esquema aplicado.");
} catch (erro) {
  await client.query("rollback");
  throw erro;
} finally {
  await client.end();
}
