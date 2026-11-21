"use client";

import { ThumbsUp } from "lucide-react";
import { startTransition, useOptimistic } from "react";
import { alternarUpvote } from "@/actions/duvidas";

type Estado = { votos: number; votei: boolean };

export function BotaoUpvote({
  duvidaId,
  duvida,
  votos,
  votei,
  somenteLeitura = false,
}: {
  duvidaId: string;
  // Texto da dúvida: entra no nome do botão. O leitor de tela lista os botões
  // fora do contexto, e "Votar nesta dúvida" repetido não diz qual (ADR-0015).
  duvida: string;
  somenteLeitura?: boolean;
} & Estado) {
  const trecho = duvida.length > 60 ? `${duvida.slice(0, 60).trimEnd()}…` : duvida;
  // Mostra o resultado na hora; o servidor confirma e reordena a lista depois.
  const [otimista, setOtimista] = useOptimistic<Estado>({ votos, votei });

  function alternar() {
    startTransition(async () => {
      setOtimista({
        votos: otimista.votos + (otimista.votei ? -1 : 1),
        votei: !otimista.votei,
      });
      await alternarUpvote(duvidaId);
    });
  }

  return (
    <button
      type="button"
      // Observador (ADR-0012) vê a contagem, mas não apoia.
      disabled={somenteLeitura}
      onClick={alternar}
      aria-pressed={otimista.votei}
      aria-label={`${otimista.votei ? "Remover meu voto" : "Votar nesta dúvida"}: ${trecho}`}
      className={
        otimista.votei
          ? "flex w-12 shrink-0 flex-col items-center gap-0.5 self-start rounded-xl border border-primary/40 bg-primary/10 py-2 text-primary transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          : "flex w-12 shrink-0 flex-col items-center gap-0.5 self-start rounded-xl border py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      }
    >
      <ThumbsUp className="size-4" aria-hidden />
      <span className="text-sm font-semibold tabular-nums">{otimista.votos}</span>
      {/* O aria-label do botão mascara a contagem; esta região anuncia a
          mudança de votos, no padrão do BotaoCopiar. */}
      <span role="status" className="sr-only">
        {otimista.votos} {otimista.votos === 1 ? "voto" : "votos"}
      </span>
    </button>
  );
}
