import Link from "next/link";
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

export default async function VotacoesPage() {
  const membro = await exigirMembro();
  const catalogos = await listarCatalogos(membro);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Votações</h1>
      <p className="mt-2 text-muted-foreground">
        Escolha um catálogo e responda às enquetes. Você pode mudar o seu voto
        quando quiser. O administrador vê quem votou em cada opção.
      </p>

      <div className="mt-6 grid gap-4">
        {catalogos.map((c) => (
          <Link key={c.id} href={`/votacoes/${c.id}`} className="block">
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle>{c.nome}</CardTitle>
                  <Badge variant={c.padrao ? "secondary" : "default"}>
                    {c.padrao ? "Padrão" : "Personalizado"}
                  </Badge>
                </div>
                <CardDescription>
                  {c.votadas} de {c.total} enquetes respondidas
                </CardDescription>
                <Progress
                  className="mt-2"
                  value={c.total === 0 ? 0 : (c.votadas / c.total) * 100}
                  aria-label={`Progresso em ${c.nome}`}
                />
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
