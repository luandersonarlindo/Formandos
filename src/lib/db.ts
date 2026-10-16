import { Pool, type PoolClient } from "pg";

// Uma única conexão por processo. Em desenvolvimento, o hot reload recarrega
// os módulos, então o Pool fica guardado em globalThis para não abrir vários.
const globalForDb = globalThis as unknown as { pgPool?: Pool };

// Limite de conexões do Pool (padrão 5). Ajuste com DB_POOL_MAX.
// Timeouts evitam 1 query lenta de prender conexão no pico e esgotar o pool.
export const pool =
  globalForDb.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: Number(process.env.DB_POOL_MAX ?? 5),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    statement_timeout: 8000,
  });

if (process.env.NODE_ENV !== "production") globalForDb.pgPool = pool;

// Executa `fn` dentro de uma transação. Se `fn` lançar erro, faz rollback.
//
// Observabilidade mínima do pico: mede a duração e registra em JSON
// (sem dado da pessoa, só duração e desfecho). Lenta (>1s) vira warn para
// achar gargalo antes de virar timeout; erro vira error com a duração.
// `acao` é opcional para não mexer nas 25 chamadas existentes: quem quiser
// nomear a operação passa `{ acao: "votos.salvar" }`.
export async function transacao<T>(
  fn: (client: PoolClient) => Promise<T>,
  opcao?: { acao?: string },
) {
  const inicio = Date.now();
  const acao = opcao?.acao ?? "?";
  const client = await pool.connect();
  try {
    await client.query("begin");
    const resultado = await fn(client);
    await client.query("commit");
    const duracao = Date.now() - inicio;
    if (duracao > 1000) {
      console.warn(JSON.stringify({ msg: "transacao lenta", acao, duracao_ms: duracao }));
    }
    return resultado;
  } catch (erro) {
    await client.query("rollback");
    console.error(
      JSON.stringify({
        msg: "transacao erro",
        acao,
        duracao_ms: Date.now() - inicio,
        erro: erro instanceof Error ? erro.message : String(erro),
      }),
    );
    throw erro;
  } finally {
    client.release();
  }
}
