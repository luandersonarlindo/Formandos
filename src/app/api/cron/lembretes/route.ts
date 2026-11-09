import { timingSafeEqual } from "node:crypto";
import { rodarLembretes } from "@/lib/lembretes";

// Lembretes de prazo (ADR-0006). Chamada de hora em hora pelo serviço `cron`
// do compose.yaml (ou, num deploy, pelo Vercel Cron / GitHub Actions) com o
// cabeçalho `Authorization: Bearer $CRON_SECRET`. Sem CRON_SECRET configurado,
// a rota não existe (404). Chamar de novo não repete email.

function autorizado(cabecalho: string | null): boolean {
  const segredo = process.env.CRON_SECRET;
  if (!segredo || !cabecalho) return false;
  const esperado = Buffer.from(`Bearer ${segredo}`);
  const recebido = Buffer.from(cabecalho);
  return esperado.length === recebido.length && timingSafeEqual(esperado, recebido);
}

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) return new Response(null, { status: 404 });
  if (!autorizado(request.headers.get("authorization"))) {
    return new Response(null, { status: 401 });
  }
  const resultado = await rodarLembretes();
  return Response.json(resultado, { headers: { "Cache-Control": "no-store" } });
}
