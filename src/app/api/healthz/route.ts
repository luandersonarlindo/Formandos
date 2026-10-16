import { pool } from "@/lib/db";

// Saúde do app para o pico: a plataforma (ou o admin) bate aqui antes de
// liberar a votação. Checa banco com `select 1` e devolve versão.
// Sem auth de propósito: não expõe dado, só "banco responde?".
export async function GET() {
  try {
    await pool.query("select 1");
    return Response.json(
      { ok: true, banco: "ok", versao: process.env.npm_package_version ?? "0.1.0" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ ok: false, banco: "erro" }, { status: 503 });
  }
}
