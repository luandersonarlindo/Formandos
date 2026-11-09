import { pool } from "@/lib/db";

// Saúde do app para o pico: a plataforma (ou o admin) bate aqui antes de
// liberar a votação. Checa banco com `select 1` e devolve versão.
// Sem auth de propósito: não expõe dado, só "banco responde?".
export async function GET() {
  try {
    // Última execução dos lembretes (ADR-0006): parado há muito tempo = o
    // agendador caiu. Só a hora, sem dado de ninguém.
    const { rows } = await pool.query("select ultima from cron_execucoes where nome = 'lembretes'");
    return Response.json(
      {
        ok: true,
        banco: "ok",
        versao: process.env.npm_package_version ?? "0.1.0",
        lembretes: rows[0]?.ultima ?? null,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ ok: false, banco: "erro" }, { status: 503 });
  }
}
