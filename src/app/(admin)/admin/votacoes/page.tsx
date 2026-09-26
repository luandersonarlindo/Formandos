import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listarCatalogosAdmin } from "@/lib/admin";
import { exigirAdmin } from "@/lib/dal";
import { cn } from "@/lib/utils";

export default async function VotacoesAdminPage() {
  const admin = await exigirAdmin();
  const catalogos = await listarCatalogosAdmin(admin.turmaId);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Catálogos de enquetes</h1>
        <Link href="/admin/votacoes/nova" className={cn(buttonVariants())}>
          Novo catálogo
        </Link>
      </div>
      <p className="mt-2 text-muted-foreground">
        O catálogo padrão vale para todas as turmas e não pode ser editado. Nos
        catálogos personalizados você cria categorias e perguntas próprias. Em
        qualquer um, dá para ver quem votou em cada opção.
      </p>

      <div className="mt-6 grid gap-4">
        {catalogos.map((c) => (
          <Link key={c.id} href={`/admin/votacoes/${c.id}`} className="block">
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle>{c.nome}</CardTitle>
                  <Badge variant={c.padrao ? "secondary" : "default"}>
                    {c.padrao ? "Padrão" : "Personalizado"}
                  </Badge>
                </div>
                <CardDescription>
                  {c.enquetes} {c.enquetes === 1 ? "pergunta" : "perguntas"}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
