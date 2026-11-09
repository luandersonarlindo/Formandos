"use client";

import { BotaoCopiar } from "./botao-copiar";
import { linkConvite } from "@/lib/convite-link";

// Copia uma mensagem pronta para colar no grupo da turma.
export function BotaoConvite({ nomeTurma, codigo }: { nomeTurma: string; codigo: string }) {
  return (
    <BotaoCopiar
      variante="outline"
      rotulo="Copiar mensagem de convite"
      montarTexto={() =>
        `Entre na turma "${nomeTurma}" no Formandos: ${linkConvite(window.location.origin, codigo)}\n` +
        `Se pedir, o código é ${codigo}.`
      }
    />
  );
}
