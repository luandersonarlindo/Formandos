import { registrarAuditoria } from "@/lib/auditoria";
import { nomeDeArquivo, paraCsv } from "@/lib/csv";
import { exigirAdmin } from "@/lib/dal";
import { pool } from "@/lib/db";
import { TIPOS_EXPORTACAO, montarPlanilha, type TipoExportacao } from "@/lib/exportacao";
import { hojeBrasil } from "@/lib/situacao-regras";

// Planilha CSV da turma (ADR-0007). Só a comissão; "pagamentos" só a
// tesouraria (ADR-0005). Cada download vai para a auditoria.
export async function GET(request: Request) {
  const admin = await exigirAdmin();
  const tipo = new URL(request.url).searchParams.get("tipo") as TipoExportacao | null;
  if (!tipo || !TIPOS_EXPORTACAO.includes(tipo)) {
    return new Response("Tipo de planilha inválido.", { status: 400 });
  }
  if (tipo === "pagamentos" && !admin.tesouraria) {
    return new Response("Só a tesouraria baixa os pagamentos.", { status: 403 });
  }
  const { cabecalho, linhas } = await montarPlanilha(tipo, admin.turmaId);
  await registrarAuditoria(pool, {
    usuarioId: admin.usuarioId,
    turmaId: admin.turmaId,
    acao: "turma.exportada",
    entidade: "turma",
    entidadeId: admin.turmaId,
    detalhe: { tipo, linhas: linhas.length },
  });
  const arquivo = `formandos-${nomeDeArquivo(admin.turmaNome)}-${tipo}-${hojeBrasil()}.csv`;
  return new Response(paraCsv(cabecalho, linhas), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${arquivo}"`,
      "Cache-Control": "no-store",
    },
  });
}
