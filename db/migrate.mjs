// Prepara o banco do deploy antes do `next build`. Roda no build da Vercel.
//
// Duas etapas, na mesma conexão:
//   1. as tabelas do Better Auth (usuarios, session, account, verification),
//      pelo CLI oficial do pacote;
//   2. db/schema.sql, as tabelas do domínio (turmas, avisos, enquetes...).
//
// Usa MIGRATION_DATABASE_URL (conexão direta do Neon) e não DATABASE_URL: o
// pooler do Neon é PgBouncer em modo transação, que não aceita DDL. A URL
// direta é o host SEM o sufixo "-pooler".
//
// As duas etapas são idempotentes, então dá para repetir a cada build sem
// efeito colateral. O seed do catálogo padrão NÃO roda aqui: ele é conteúdo,
// não esquema, e fica no comando manual `npm run db:seed`.
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pg from "pg";
import { aplicarSchema } from "./apply-schema.mjs";

const raiz = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
// Chamado pelo `prebuild`. Em dev e em build local não há MIGRATION_DATABASE_URL
// e o banco local já está migrado, então o script sai sem fazer nada em vez de
// derrubar `npm run build`.
const seConfigurado = process.argv.includes("--if-configured");
const urlDireta = process.env.MIGRATION_DATABASE_URL;

if (!urlDireta) {
  if (seConfigurado) {
    console.log("MIGRATION_DATABASE_URL vazia: nenhuma migração a aplicar.");
    process.exit(0);
  }
  console.error("MIGRATION_DATABASE_URL vazia: a migração não pode rodar.");
  process.exit(1);
}

if (urlDireta.includes("-pooler.")) {
  // O pooler rejeita DDL com "prepared statement s0 already exists" e afins.
  // Falhar aqui é melhor do que deixar a compilação passar com o banco pela metade.
  console.error(
    "MIGRATION_DATABASE_URL aponta para o pooler (-pooler). Use a conexão direta do Neon.",
  );
  process.exit(1);
}

const migraAuth = () =>
  new Promise((resolve, reject) => {
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
    migracao.on("exit", (codigo) =>
      codigo ? reject(new Error(`Better Auth: código ${codigo}`)) : resolve(),
    );
    migracao.on("error", reject);
  });

// O schema inteiro numa transação: se um `alter table` falhar, nada fica pela
// metade. Vale para banco novo (tudo criado) e para banco já em uso (só as
// colunas novas). Mesmo código do `npm run db:schema`.
const migraDominio = async () => {
  const client = new pg.Client({ connectionString: urlDireta });
  await client.connect();
  try {
    await aplicarSchema(client);
  } finally {
    await client.end();
  }
};

try {
  await migraAuth();
  await migraDominio();
  console.log("Migração aplicada: Better Auth + db/schema.sql.");
} catch (erro) {
  console.error(`Migração falhou: ${erro.message}`);
  process.exit(1);
}