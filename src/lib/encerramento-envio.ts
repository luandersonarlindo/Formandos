import "server-only";
import { pool } from "./db";
import { emailEncerramento } from "./email";
import { enviarParaTurma } from "./email-turma";
import { dataEncerramento } from "./encerramento";

// Aviso de encerramento por email (ADR-0021). Chamado por
// scripts/encerramento.sh via /api/encerramento. Manda a todo usuário com email
// confirmado que ainda não recebeu, um por vez, até o teto diário. Rodar de
// novo no dia seguinte continua de onde parou; quem recebeu fica em
// `avisos_encerramento` e não recebe de novo.
export async function enviarAvisoEncerramento(): Promise<
  { estado: "sem_data" } | { estado: "ok"; data: string; enviados: number; faltam: number }
> {
  const data = dataEncerramento();
  if (!data) return { estado: "sem_data" };
  const { rows: pessoas } = await pool.query(
    `select u.id as "usuarioId", u.name as nome, u.email
       from usuarios u
      where u."emailVerified"
        and not exists (select 1 from avisos_encerramento a where a.usuario_id = u.id)
      order by u."createdAt", u.id`,
  );
  let enviados = 0;
  for (const pessoa of pessoas) {
    const { enviados: n } = await enviarParaTurma([pessoa], (d) => emailEncerramento({ nome: d.nome, data }));
    if (n === 0) break; // teto diário: continua amanhã
    await pool.query("insert into avisos_encerramento (usuario_id) values ($1) on conflict do nothing", [
      pessoa.usuarioId,
    ]);
    enviados++;
  }
  return { estado: "ok", data, enviados, faltam: pessoas.length - enviados };
}
