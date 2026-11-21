import Link from "next/link";
import { cn } from "@/lib/utils";

export type AbaRota = { rotulo: string; href: string; ativa: boolean };

// Abas que são rotas: cada aba tem URL própria (link guardado e voltar do
// navegador continuam funcionando), sem JS. Visual das Tabs do shadcn.
export function AbasRota({ rotulo, abas, className }: { rotulo: string; abas: AbaRota[]; className?: string }) {
  return (
    <nav
      aria-label={rotulo}
      className={cn(
        "-mx-1 flex gap-1 overflow-x-auto border-b px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {abas.map((a) => (
        <Link
          key={a.href}
          href={a.href}
          aria-current={a.ativa ? "page" : undefined}
          className={cn(
            "-mb-px inline-flex h-10 shrink-0 items-center border-b-2 px-3 text-sm whitespace-nowrap transition-colors pointer-coarse:h-11",
            a.ativa
              ? "border-primary font-medium text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          {a.rotulo}
        </Link>
      ))}
    </nav>
  );
}
