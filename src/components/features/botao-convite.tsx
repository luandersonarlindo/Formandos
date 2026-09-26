"use client";

import { BotaoCopiar } from "./botao-copiar";

// Copia uma mensagem pronta para colar no grupo da turma.
export function BotaoConvite({ nomeTurma, codigo }: { nomeTurma: string; codigo: string }) {
  return (
    <BotaoCopiar
      variante="outline"
      rotulo="Copiar mensagem de convite"
      montarTexto={() =>
        `Entre na turma "${nomeTurma}" no Formandos: acesse ${window.location.origin}/convite e use o código ${codigo}.`
      }
    />
  );
}
