import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EstadoVazioProps = {
  ilustracao: ReactNode;
  titulo: ReactNode;
  descricao?: ReactNode;
  className?: string;
};

// Bloco de lista sem itens. Este mesmo <div> de borda tracejada estava copiado
// em dez páginas, cada uma com um ícone do lucide-react no lugar da ilustração;
// agora a cena entra no lugar do ícone.
//
// A ilustração é passada como elemento (e não como componente) para que cada
// página carregue só a sua: importando o componente direto aqui, qualquer
// página que usasse o bloco puxaria todas as ilustrações no bundle.
//
// Aqui a ilustração é estática, de propósito: nas páginas internas ela não se
// move, e só a vitrine anima a dela. A atribuição do Storyset fica no rodapé da
// vitrine, e não repetida em cada bloco.
export function EstadoVazio({ ilustracao, titulo, descricao, className }: EstadoVazioProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center sm:p-10",
        className,
      )}
    >
      {/* data-amico marca "isto é uma ilustração Amico". Não é gancho de animação
          aqui: nas páginas internas a ilustração não se move. */}
      <div data-amico className="w-full max-w-60 [&_svg]:h-auto [&_svg]:w-full">
        {ilustracao}
      </div>
      <p className="font-medium text-balance">{titulo}</p>
      {descricao ? <p className="text-sm text-muted-foreground text-pretty">{descricao}</p> : null}
    </div>
  );
}