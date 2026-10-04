import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Cartão de indicador dos painéis de resumo (admin e master). Se `valor` for
// número, ele sobe até o valor final ao aparecer na tela (data-contar).
//
// `href` é opcional de propósito. Os painéis são listas de atalhos, então um
// número sem tela própria não deve virar link mentiroso: sem `href` o cartão
// não recebe clique, foco nem a seta que anuncia "isto abre outra página".
export function CartaoResumo({
  href,
  titulo,
  valor,
  sufixo,
  texto,
  icone: Icone,
}: {
  href?: string;
  titulo: string;
  valor: number | string;
  sufixo?: string;
  texto: string;
  icone: LucideIcon;
}) {
  const cartao = (
    <Card className="vitrine-cartao h-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg border bg-muted/50 text-[var(--vitrine-a)]">
            <Icone className="size-5" aria-hidden />
          </span>
          {href && (
            <ArrowUpRight
              className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
              aria-hidden
            />
          )}
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
  );

  if (!href) return cartao;

  return (
    <Link href={href} className="group block">
      {cartao}
    </Link>
  );
}
