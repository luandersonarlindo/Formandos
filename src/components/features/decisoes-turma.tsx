import { HistoricoDecisoes } from "@/components/features/historico-decisoes";
import { PainelRecolhivel } from "@/components/features/painel-recolhivel";
import { Badge } from "@/components/ui/badge";
import type { ItemHistorico } from "@/lib/auditoria";
import type { Decisao } from "@/lib/dashboard";

// Decisões que a comissão fixou, com os números do dia e a regra (ADR-0003),
// e o histórico de fixar e reabrir. Mora na aba "Decisões" de Votações: votar,
// ver resultados e ver o que foi decidido ficam no mesmo lugar.
export function DecisoesTurma({
  decisoes,
  historico,
}: {
  decisoes: Decisao[];
  historico: ItemHistorico[];
}) {
  return (
    <>
    {decisoes.length > 0 && (
      <ul data-grupo className="divide-y rounded-xl border">
        {decisoes.map((d) => (
          <li key={d.enqueteId} className="flex flex-col gap-1 p-3 md:px-4">
            <p className="text-xs text-muted-foreground text-pretty">
              {d.categoria} · {d.pergunta}
            </p>
            <p className="font-medium wrap-break-word">{d.escolhas.join(" · ")}</p>
            {/* Números do dia e regra (ADR-0003), numa linha só. Decisões
                antigas não têm a fotografia, então ficam só com a escolha. */}
            {(d.votantes !== null || d.linkDocumento) && (
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {d.votantes !== null && (
                  <>
                    <span className="tabular-nums">
                      votaram {d.votantes} de {d.membros}
                    </span>
                    {!d.foraDaRegra ? (
                      <Badge variant="success">Dentro da regra</Badge>
                    ) : (
                      <Badge variant="warning">Fora da regra</Badge>
                    )}
                  </>
                )}
                {d.linkDocumento && (
                  <a
                    href={d.linkDocumento}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground underline underline-offset-4 pointer-coarse:py-2"
                  >
                    Ver documento
                    <span className="sr-only"> de {d.pergunta} (abre em nova aba)</span>
                  </a>
                )}
              </p>
            )}
            {d.justificativa && (
              <p className="text-xs text-muted-foreground text-pretty">
                Motivo da comissão: “{d.justificativa}”
              </p>
            )}
          </li>
        ))}
      </ul>
    )}
    {historico.length > 0 && (
      <PainelRecolhivel className="mt-3">
        <summary className="cursor-pointer text-sm font-medium pointer-coarse:py-2.5">
          Ver histórico das decisões
        </summary>
        <div className="mt-3">
          <HistoricoDecisoes itens={historico} mostrarPergunta />
        </div>
      </PainelRecolhivel>
    )}
    </>
  );
}
