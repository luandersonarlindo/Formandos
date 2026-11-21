import { timingSafeEqual } from "node:crypto";
import { enviarAvisoEncerramento } from "@/lib/encerramento-envio";

// Aviso de encerramento do site por email (ADR-0021). Chamada à mão por
// scripts/encerramento.sh, com o mesmo `Authorization: Bearer $CRON_SECRET`
// dos lembretes. Sem CRON_SECRET, a rota não existe (404). Sem
// ENCERRAMENTO_EM, recusa (409). Chamar de novo não repete email.

function autorizado(cabecalho: string | null): boolean {
  const segredo = process.env.CRON_SECRET;
  if (!segredo || !cabecalho) return false;
  const esperado = Buffer.from(`Bearer ${segredo}`);
  const recebido = Buffer.from(cabecalho);
  return esperado.length === recebido.length && timingSafeEqual(esperado, recebido);
}

export async function POST(request: Request) {
  if (!process.env.CRON_SECRET) return new Response(null, { status: 404 });
  if (!autorizado(request.headers.get("authorization"))) {
    return new Response(null, { status: 401 });
  }
  const resultado = await enviarAvisoEncerramento();
  if (resultado.estado === "sem_data") {
    return Response.json(
      { erro: "ENCERRAMENTO_EM não está definida (formato AAAA-MM-DD)." },
      { status: 409, headers: { "Cache-Control": "no-store" } },
    );
  }
  return Response.json(resultado, { headers: { "Cache-Control": "no-store" } });
}
