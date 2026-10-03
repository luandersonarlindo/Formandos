// Aplica as tabelas do Better Auth (usuarios, session, account, verification)
// no banco do deploy. Roda no build da Vercel, antes do `next build`.
//
// Usa MIGRATION_DATABASE_URL (conexao direta do Neon) e não DATABASE_URL: o
// pooler do Neon e PgBouncer em modo transacao, que nao aceita DDL. A URL
// direta e o host SEM o sufixo "-pooler".
//
// As tabelas do dominio (turmas, avisos, enquetes...) sao do db/schema.sql e
// entram por `npm run db:schema`.
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const raiz = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
// Chamado pelo `prebuild`. Em dev e em build local não há MIGRATION_DATABASE_URL
// e o banco local já está migrado, então o script sai sem fazer nada em vez de
// derrubar `npm run build`.
const seConfigurado = process.argv.includes("--if-configured");
const urlDireta = process.env.MIGRATION_DATABASE_URL;

if (!urlDireta) {
  if (seConfigurado) {
    console.log("MIGRATION_DATABASE_URL vazia: nenhuma migracao a aplicar.");
    process.exit(0);
  }
  console.error("MIGRATION_DATABASE_URL vazia: a migracao nao pode rodar.");
  process.exit(1);
}

if (urlDireta.includes("-pooler.")) {
  // O pooler rejeita DDL com "prepared statement s0 already exists" e afins.
  // Falhar aqui é melhor do que deixar a compilação passar com o banco pela metade.
  console.error(
    "MIGRATION_DATABASE_URL aponta para o pooler (-pooler). Use a conexao direta do Neon.",
  );
  process.exit(1);
}

const args = [
  "node_modules/auth/dist/index.mjs",
  "migrate",
  "--config",
  "src/lib/auth.ts",
  "-y",
];

const migracao = spawn(process.execPath, args, {
  cwd: raiz,
  stdio: "inherit",
  // O CLI carrega src/lib/auth.ts, que lê a conexão do próprio processo.
  env: { ...process.env, DATABASE_URL: urlDireta },
});

migracao.on("exit", (codigo) => process.exit(codigo ?? 1));