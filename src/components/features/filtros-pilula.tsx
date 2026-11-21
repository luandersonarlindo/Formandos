import Link from "next/link";
import { cn } from "@/lib/utils";

export type FiltroPilula = {
  rotulo: string;
  href: string;
  ativo: boolean;
  contagem?: number;
};

// Filtros por estado, com o estado na URL. Era copiado em seis páginas, cada
// uma com um tamanho; aqui todos têm 44px no toque e rolam na horizontal no
// celular sem barra de rolagem.
export function FiltrosPilula({
  rotulo,
  filtros,
  className,
}: {
  /** O que o grupo filtra, para o leitor de tela: "Filtrar por resposta". */
  rotulo: string;
  filtros: FiltroPilula[];
  className?: string;
}) {
  return (
    <nav
      aria-label={rotulo}
      className={cn(
        "-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {filtros.map((f) => (
        <Link
          key={f.href}
          href={f.href}
          scroll={false}
          aria-current={f.ativo ? "true" : undefined}
          className={cn(
            "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm whitespace-nowrap transition-colors pointer-coarse:h-11 pointer-coarse:px-4",
            f.ativo
              ? "border-primary/40 bg-primary/10 font-medium text-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {f.rotulo}
          {f.contagem !== undefined ? (
            <span className="text-xs tabular-nums text-muted-foreground">{f.contagem}</span>
          ) : null}
        </Link>
      ))}
    </nav>
  );
}
