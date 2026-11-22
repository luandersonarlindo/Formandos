import { AbasRota } from "@/components/features/abas-rota";

// Abas de Votações: votar, ver os resultados e ver o que a comissão decidiu
// ficam no mesmo lugar. Cada aba é uma rota.
export function AbasVotacoes({ atual, className }: { atual: "votar" | "resultados" | "decisoes"; className?: string }) {
  return (
    <AbasRota
      className={className}
      rotulo="Votações"
      abas={[
        { rotulo: "Votar", href: "/votacoes", ativa: atual === "votar" },
        { rotulo: "Resultados", href: "/votacoes/relatorio", ativa: atual === "resultados" },
        { rotulo: "Decisões", href: "/votacoes/decisoes", ativa: atual === "decisoes" },
      ]}
    />
  );
}
