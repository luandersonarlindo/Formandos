"use client";

import { ThumbsUp } from "lucide-react";
import { startTransition, useOptimistic } from "react";
import { alternarUpvote } from "@/actions/duvidas";
import { Button } from "@/components/ui/button";

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
    <Button
      type="button"
      variant={otimista.votei ? "default" : "outline"}
      size="sm"
      onClick={alternar}
      aria-pressed={otimista.votei}
      aria-label={otimista.votei ? "Remover meu voto" : "Votar nesta dúvida"}
    >
      <ThumbsUp className="size-4" aria-hidden />
      {otimista.votos}
    </Button>
  );
}
