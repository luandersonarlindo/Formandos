import { Pool, type PoolClient } from "pg";

// Uma única conexão por processo. Em desenvolvimento, o hot reload recarrega
// os módulos, então o Pool fica guardado em globalThis para não abrir vários.
const globalForDb = globalThis as unknown as { pgPool?: Pool };

// Em hospedagem serverless cada instância abre o seu próprio Pool, então o
// limite padrão é baixo. Ajuste com DB_POOL_MAX se o banco aguentar mais.
export const pool =
  globalForDb.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: Number(process.env.DB_POOL_MAX ?? 5),
  });

if (process.env.NODE_ENV !== "production") globalForDb.pgPool = pool;

// Executa `fn` dentro de uma transação. Se `fn` lançar erro, faz rollback.
export async function transacao<T>(fn: (client: PoolClient) => Promise<T>) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const resultado = await fn(client);
    await client.query("commit");
    return resultado;
  } catch (erro) {
    await client.query("rollback");
    throw erro;
  } finally {
    client.release();
  }
}
