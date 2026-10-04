"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Um <details> que só se fecha quando a pessoa fecha.
//
// O <details> nativo aceita só a propriedade `open`, que o React reaplica a
// cada render. Se `open` depender do tamanho da lista, criar o primeiro item faz
// o painel fechar sozinho — e como o formulário mora dentro dele, a mensagem de
// sucesso vai embora junto. Já o estado mora aqui dentro, então os renders do
// servidor não mexem no que a pessoa escolheu.
//
// Preferi este componente a trocar <details> por <Collapsible> do shadcn porque
// <details> continua sendo o que a navigaçao por teclado e os leitores de tela
// já conhecem, sem aria-expanded para manter sincronizado.

export function PainelRecolhivel({
  abertoInicial = false,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"details">, "open"> & { abertoInicial?: boolean }) {
  const [aberto, setAberto] = React.useState(abertoInicial);

  return (
    <details
      open={aberto}
      onToggle={(evento) => setAberto(evento.currentTarget.open)}
      className={className}
      {...props}
    >
      {children}
    </details>
  );
}