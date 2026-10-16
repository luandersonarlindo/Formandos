import "server-only";
import type { PoolClient } from "pg";

// Throttle genérico contra flood no pico (spam de dúvidas, upvotes, avisos).
// Uso: dentro da transação da ação, antes do write principal:
//
//   const livre = await consumirLimite(db, `duvida:${membro.usuarioId}`, 20, 60);
//   if (!livre) return { erro: "Muitas tentativas. Aguarde alguns minutos." };
//
// Limites generosos de propósito: usuário normal nunca encosta (1-2 dúvidas
// por hora); só flood automático bate. O lock serializa consumos concorrentes
// da mesma chave, então dois cliques simultâneos não furam o teto.
export async function consumirLimite(
  db: PoolClient,
  chave: string,
  max: number,
  janelaMinutos: number,
): Promise<boolean> {
  await db.query("select pg_advisory_xact_lock(hashtext($1))", [`throttle:${chave}`]);
  const { rows } = await db.query(
    `select count(*)::int as n from throttle
      where chave = $1 and created_at > now() - make_interval(mins => $2)`,
    [chave, janelaMinutos],
  );
  if (rows[0].n >= max) return false;
  await db.query("insert into throttle (chave) values ($1)", [chave]);
  // Limpeza com a mesma chave para usar o índice (chave, created_at): sem o
  // filtro por chave, o delete varria a tabela inteira a cada ação no pico.
  // Cada ação limpa o próprio histórico; chaves de outras ações são limpas
  // quando elas rodarem.
  await db.query(
    "delete from throttle where chave = $1 and created_at < now() - interval '1 day'",
    [chave],
  );
  return true;
}
