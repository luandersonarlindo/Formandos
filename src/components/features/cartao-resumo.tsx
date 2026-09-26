import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Cartão de indicador dos painéis de resumo (admin e master). Se `valor` for
// número, ele sobe até o valor final ao aparecer na tela (data-contar).
export function CartaoResumo({
  href,
  titulo,
  valor,
  sufixo,
  texto,
  icone: Icone,
}: {
  href: string;
  titulo: string;
  valor: number | string;
  sufixo?: string;
  texto: string;
  icone: LucideIcon;
}) {
  return (
    <Link href={href} className="group block">
      <Card className="vitrine-cartao h-full">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg border bg-muted/50 text-[var(--vitrine-a)]">
              <Icone className="size-5" aria-hidden />
            </span>
            <ArrowUpRight
              className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
              aria-hidden
            />
          </div>
          <CardDescription className="mt-2">{titulo}</CardDescription>
          <CardTitle className="text-3xl tabular-nums">
            {typeof valor === "number" ? <span data-contar={valor}>{valor}</span> : valor}
            {sufixo && (
              <span className="ml-1.5 text-base font-normal text-muted-foreground">{sufixo}</span>
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{texto}</p>
        </CardHeader>
      </Card>
    </Link>
  );
}
