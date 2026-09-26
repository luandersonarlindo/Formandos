import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CircleCheck, Vote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { exigirMembro } from "@/lib/dal";
import { listarCatalogos } from "@/lib/votacoes";

export const metadata: Metadata = { title: "Votações" };

export default async function VotacoesPage() {
  const membro = await exigirMembro();
  const catalogos = await listarCatalogos(membro);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Votações</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground text-pretty">
        Escolha um catálogo e responda às enquetes. Você pode mudar o seu voto
        quando quiser. O administrador vê quem votou em cada opção.
      </p>

      <div data-grupo className="mt-6 grid gap-4 md:grid-cols-2">
        {catalogos.map((c) => {
          const completo = c.total > 0 && c.votadas === c.total;
          const acao = completo ? "Revisar votos" : c.votadas > 0 ? "Continuar" : "Começar";
          return (
            <Link key={c.id} href={`/votacoes/${c.id}`} className="block">
              <Card className="vitrine-cartao h-full">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex size-10 items-center justify-center rounded-lg border bg-muted/50 text-[var(--vitrine-a)]">
                      {completo ? (
                        <CircleCheck className="size-5" aria-hidden />
                      ) : (
                        <Vote className="size-5" aria-hidden />
                      )}
                    </span>
                    <Badge variant={c.padrao ? "secondary" : "default"}>
                      {c.padrao ? "Padrão" : "Personalizado"}
                    </Badge>
                  </div>
                  <CardTitle className="mt-2 text-lg">{c.nome}</CardTitle>
                  <CardDescription>
                    {c.votadas} de {c.total} enquetes respondidas
                  </CardDescription>
                  <Progress
                    className="mt-2 h-2"
                    value={c.total === 0 ? 0 : (c.votadas / c.total) * 100}
                    aria-label={`Progresso em ${c.nome}`}
                  />
                  <p className="mt-3 flex items-center gap-1 text-sm font-medium text-[var(--vitrine-a)]">
                    {acao} <ArrowRight className="size-4" aria-hidden />
                  </p>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
