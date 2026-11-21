import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type NumeroFaixa = {
  rotulo: string;
  valor: ReactNode;
  /** Linha pequena abaixo do número: "de R$ 3.000,00 previstos". */
  detalhe?: ReactNode;
};

// Faixa de até 4 números-chave (caixa da turma, situação de uma pessoa). Era um
// card com gradiente numa tela e uma frase com os números dentro em outra; agora
// é um lugar só, sem gradiente (Flat-By-Default) e com algarismos alinhados.
// No celular cada número vira uma linha (rótulo à esquerda, valor à direita):
// três colunas de "R$ 12.345,00" não cabem em 360px.
export function FaixaNumeros({ numeros, className }: { numeros: NumeroFaixa[]; className?: string }) {
  return (
    <dl
      className={cn(
        "grid divide-y rounded-lg border sm:auto-cols-fr sm:grid-flow-col sm:divide-x sm:divide-y-0",
        className,
      )}
    >
      {numeros.map((n) => (
        <div
          key={n.rotulo}
          className="flex items-baseline justify-between gap-3 px-4 py-3 sm:flex-col sm:items-start sm:justify-start sm:gap-0.5"
        >
          <dt className="text-sm text-muted-foreground">{n.rotulo}</dt>
          <dd className="text-right sm:text-left">
            <span className="block text-base font-semibold tabular-nums sm:text-xl">{n.valor}</span>
            {n.detalhe ? <span className="block text-xs text-muted-foreground tabular-nums">{n.detalhe}</span> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}
