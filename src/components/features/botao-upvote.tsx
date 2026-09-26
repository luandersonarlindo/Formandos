"use client";

import { ThumbsUp } from "lucide-react";
import { startTransition, useOptimistic } from "react";
import { alternarUpvote } from "@/actions/duvidas";

type Estado = { votos: number; votei: boolean };

export function BotaoUpvote({
  duvidaId,
  votos,
  votei,
}: { duvidaId: string } & Estado) {
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
      onClick={alternar}
      aria-pressed={otimista.votei}
      aria-label={otimista.votei ? "Remover meu voto" : "Votar nesta dúvida"}
      className={
        otimista.votei
          ? "flex w-12 shrink-0 flex-col items-center gap-0.5 self-start rounded-xl border border-[var(--vitrine-a)]/40 bg-[color-mix(in_oklch,var(--vitrine-a)_12%,transparent)] py-2 text-[var(--vitrine-a)] transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          : "flex w-12 shrink-0 flex-col items-center gap-0.5 self-start rounded-xl border py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      }
    >
      <ThumbsUp className="size-4" aria-hidden />
      <span className="text-sm font-semibold tabular-nums">{otimista.votos}</span>
    </button>
  );
}
