import { cn } from "@/lib/utils";

// Cabeçalho padrão das telas internas: um título (o único h1), no máximo uma
// frase de apoio e, à direita, a ação primária da tela ("Novo aviso"…).
export function CabecalhoPagina({
  titulo,
  descricao,
  acao,
  antes,
  className,
}: {
  titulo: React.ReactNode;
  descricao?: React.ReactNode;
  /** A ação primária da tela (no máximo uma). */
  acao?: React.ReactNode;
  /** Acima do título: LinkVoltar, seletor de abas… */
  antes?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-3", className)}>
      {antes}
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <div className="min-w-0 flex-1 basis-64">
          <h1 className="text-2xl font-semibold tracking-tight text-balance md:text-3xl">{titulo}</h1>
          {descricao ? <p className="mt-1.5 max-w-2xl text-muted-foreground text-pretty">{descricao}</p> : null}
        </div>
        {acao ? <div className="flex shrink-0 flex-wrap gap-2">{acao}</div> : null}
      </div>
    </header>
  );
}
