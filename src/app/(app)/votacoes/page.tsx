import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AbasRota } from "@/components/features/abas-rota";
import { CabecalhoPagina } from "@/components/features/cabecalho-pagina";
import { EstadoVazio } from "@/components/features/estado-vazio";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { exigirMembro } from "@/lib/dal";
import { listarCatalogos } from "@/lib/votacoes";

export const metadata: Metadata = { title: "Votações" };

// Lista dos catálogos, com os que ainda têm pergunta sem voto primeiro. O
// texto de quem vê o voto (ADR-0001) fica na tela do catálogo, onde se vota.
export default async function VotacoesPage() {
  const membro = await exigirMembro();
  const catalogos = await listarCatalogos(membro);
  const completo = (c: { votadas: number; total: number }) => c.total > 0 && c.votadas === c.total;
  const ordenados = [...catalogos].sort((a, b) => Number(completo(a)) - Number(completo(b)));

  return (
    <div className="mx-auto w-full max-w-3xl">
      <CabecalhoPagina
        titulo="Votações"
        descricao="Responda as perguntas da turma. Você pode mudar o voto até a comissão decidir."
      />
      {/* Votar e ver os resultados são a mesma área (P-01). */}
      <AbasRota
        className="mt-4"
        rotulo="Votações"
        abas={[
          { rotulo: "Votar", href: "/votacoes", ativa: true },
          { rotulo: "Resultados", href: "/votacoes/relatorio", ativa: false },
        ]}
      />

      {ordenados.length === 0 ? (
        <EstadoVazio className="mt-6" titulo="Nenhum catálogo para votar" descricao="Quando a comissão abrir as votações, elas aparecem aqui." />
      ) : (
        <ul data-grupo className="mt-6 divide-y rounded-xl border">
          {ordenados.map((c) => {
            const feito = completo(c);
            const acao = feito ? "Revisar votos" : c.votadas > 0 ? "Continuar" : "Começar";
            return (
              <li key={c.id}>
                <Link
                  href={`/votacoes/${c.id}`}
                  className="flex items-center gap-4 p-4 transition-colors first:rounded-t-xl last:rounded-b-xl hover:bg-muted/60 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{c.nome}</p>
                      {feito && <Badge variant="secondary">Tudo respondido</Badge>}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground tabular-nums">
                      {c.votadas} de {c.total} enquetes respondidas
                    </p>
                    <Progress
                      className="mt-2 h-1.5 max-w-60"
                      value={c.total === 0 ? 0 : (c.votadas / c.total) * 100}
                      // O texto acima diz o mesmo: a barra fica fora da leitura.
                      aria-hidden
                    />
                  </div>
                  <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground">
                    {acao} <ChevronRight className="size-4" aria-hidden />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
