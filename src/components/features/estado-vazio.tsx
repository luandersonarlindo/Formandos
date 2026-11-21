import type { ReactNode } from "react";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { cn } from "@/lib/utils";

type EstadoVazioProps = {
  /** Cena do Storyset. Opcional: em sub-seções, o vazio vai sem ilustração. */
  ilustracao?: ReactNode;
  titulo: ReactNode;
  descricao?: ReactNode;
  /** O próximo passo (no máximo uma ação): "Criar a primeira categoria". */
  acao?: ReactNode;
  className?: string;
};

// Bloco de lista sem itens, sobre o Empty do shadcn. Título, uma frase e no
// máximo uma ação: o vazio diz o que fazer em seguida.
//
// A ilustração é passada como elemento (e não como componente) para que cada
// página carregue só a sua: importando o componente direto aqui, qualquer
// página que usasse o bloco puxaria todas as ilustrações no bundle.
//
// Aqui a ilustração é estática, de propósito: nas páginas internas ela não se
// move, e só a vitrine anima a dela. A atribuição do Storyset fica no rodapé da
// vitrine, e não repetida em cada bloco.
export function EstadoVazio({ ilustracao, titulo, descricao, acao, className }: EstadoVazioProps) {
  return (
    <Empty className={cn("border p-8 sm:p-10", className)}>
      <EmptyHeader>
        {ilustracao ? (
          // data-amico marca "isto é uma ilustração Amico". Não é gancho de
          // animação aqui: nas páginas internas a ilustração não se move.
          <EmptyMedia data-amico className="w-full max-w-60 [&_svg]:h-auto [&_svg]:w-full">
            {ilustracao}
          </EmptyMedia>
        ) : null}
        <EmptyTitle className="text-base text-balance">{titulo}</EmptyTitle>
        {descricao ? <EmptyDescription className="text-pretty">{descricao}</EmptyDescription> : null}
      </EmptyHeader>
      {acao ? <EmptyContent>{acao}</EmptyContent> : null}
    </Empty>
  );
}
