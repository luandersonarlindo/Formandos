"use client";

import dynamic from "next/dynamic";
import type { OpcaoRelatorio } from "@/lib/relatorio";

// Recharts só baixa quando há voto para desenhar: a página renderiza este
// componente só no ramo `votantes > 0`, então visita sem voto nunca puxa o
// chunk. O `ssr: false` mora aqui (Client Component) porque o gráfico mede a
// largura no cliente (ResizeObserver) — e `next/dynamic` proíbe `ssr: false`
// direto em Server Component.
const GraficoEnqueteDinamico = dynamic(
  () => import("./grafico-enquete").then((m) => m.GraficoEnquete),
  {
    ssr: false,
    loading: () => (
      <div className="h-24 animate-pulse rounded-lg bg-muted" aria-hidden />
    ),
  },
);

export function GraficoEnqueteLazy({ opcoes }: { opcoes: OpcaoRelatorio[] }) {
  return <GraficoEnqueteDinamico opcoes={opcoes} />;
}
