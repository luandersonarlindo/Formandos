import "server-only";
import { pool, transacao } from "./db";
import { enviarEmailSilencioso, type Email } from "./email";

// Envio para a turma (ADR-0006): um email por pessoa, só para quem não
// desligou em Minha conta, com teto diário para não passar do limite do
// provedor (o Gmail aceita cerca de 500 destinatários por dia). Os emails da
// conta (confirmação, senha) não passam por aqui e não gastam o teto.

export type Destinatario = { usuarioId: string; nome: string; email: string };

const TETO_PADRAO = 400;
const tetoDiario = () => Number(process.env.EMAIL_TETO_DIA) || TETO_PADRAO;

// Membros da turma que aceitam email, com email confirmado. `exceto` tira quem
// fez a ação (não precisa de email do que acabou de fazer).
export async function destinatariosDaTurma(turmaId: string, exceto?: string): Promise<Destinatario[]> {
  const { rows } = await pool.query(
    `select u.id as "usuarioId", u.name as nome, u.email
       from membros m join usuarios u on u.id = m.usuario_id
      where m.turma_id = $1 and u.receber_emails and u."emailVerified"
        and ($2::text is null or u.id::text <> $2::text)
      order by u.name`,
    [turmaId, exceto ?? null],
  );
  return rows;
}

// Reserva até `quantos` envios dentro do teto das últimas 24 horas e devolve
// quantos cabem. Usa a tabela `throttle`, com trava para dois envios ao mesmo
// tempo não furarem o teto.
async function reservarEnvios(quantos: number): Promise<number> {
  if (quantos <= 0) return 0;
  return transacao(async (db) => {
    await db.query("select pg_advisory_xact_lock(hashtext('throttle:email:dia'))");
    const { rows } = await db.query(
      "select count(*)::int as n from throttle where chave = 'email:dia' and created_at > now() - interval '1 day'",
    );
    const livres = Math.max(0, Math.min(quantos, tetoDiario() - rows[0].n));
    if (livres > 0) {
      await db.query(
        "insert into throttle (chave) select 'email:dia' from generate_series(1, $1)",
        [livres],
      );
    }
    await db.query(
      "delete from throttle where chave = 'email:dia' and created_at < now() - interval '1 day'",
    );
    return livres;
  });
}

// Manda um email por destinatário, em sequência. Falha de um não para os
// outros (enviarEmailSilencioso). Chame dentro de `after()`: a tela não espera.
export async function enviarParaTurma(
  destinatarios: Destinatario[],
  montar: (d: Destinatario) => Omit<Email, "para">,
): Promise<{ enviados: number; semTeto: number }> {
  const livres = await reservarEnvios(destinatarios.length);
  const lista = destinatarios.slice(0, livres);
  for (const d of lista) {
    await enviarEmailSilencioso({ para: d.email, ...montar(d) });
  }
  const semTeto = destinatarios.length - lista.length;
  if (semTeto > 0) {
    console.warn(JSON.stringify({ msg: "teto diário de email atingido", semTeto }));
  }
  return { enviados: lista.length, semTeto };
}
