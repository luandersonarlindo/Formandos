import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PaginacaoProps = {
  pagina: number;
  totalPaginas: number;
  // Caminho da página (ex.: "/duvidas") e os outros parâmetros da URL que devem
  // ser mantidos ao trocar de página (ex.: { filtro: "abertas" }).
  caminho: string;
  parametros?: Record<string, string | undefined>;
  className?: string;
};

function href(caminho: string, parametros: PaginacaoProps["parametros"], pagina: number) {
  const busca = new URLSearchParams();
  for (const [chave, valor] of Object.entries(parametros ?? {})) {
    if (valor) busca.set(chave, valor);
  }
  if (pagina > 1) busca.set("pagina", String(pagina));
  const texto = busca.toString();
  return texto ? `${caminho}?${texto}` : caminho;
}

// Anterior / Próxima com "Página X de Y". Só links, sem estado no cliente.
// Não aparece quando há uma página só.
//
// scroll={false} de propósito: o padrão do Next volta ao topo a cada troca,
// e a pessoa perde o ponto da lista (pior em lista longa, mobile e TV com
// D-pad). Sem scroll, a posição fica onde estava, junto da paginação.
// O contador tem role="status" para leitor de tela anunciar a troca.
export function Paginacao({ pagina, totalPaginas, caminho, parametros, className }: PaginacaoProps) {
  if (totalPaginas <= 1) return null;
  const classe = buttonVariants({ variant: "outline", size: "sm" });
  const desativado = cn(classe, "pointer-events-none opacity-50");

  return (
    <nav
      aria-label="Paginação"
      className={cn("mt-6 flex items-center justify-between gap-3", className)}
    >
      {pagina > 1 ? (
        <Link href={href(caminho, parametros, pagina - 1)} rel="prev" scroll={false} className={classe}>
          <ChevronLeft aria-hidden /> Anterior
        </Link>
      ) : (
        <span aria-disabled="true" className={desativado}>
          <ChevronLeft aria-hidden /> Anterior
        </span>
      )}
      <p role="status" className="text-sm text-muted-foreground tabular-nums">
        Página {pagina} de {totalPaginas}
      </p>
      {pagina < totalPaginas ? (
        <Link href={href(caminho, parametros, pagina + 1)} rel="next" scroll={false} className={classe}>
          Próxima <ChevronRight aria-hidden />
        </Link>
      ) : (
        <span aria-disabled="true" className={desativado}>
          Próxima <ChevronRight aria-hidden />
        </span>
      )}
    </nav>
  );
}
