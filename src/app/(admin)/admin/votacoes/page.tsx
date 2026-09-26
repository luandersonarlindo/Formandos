import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, LayoutList, Lock, Plus } from "lucide-react";
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

export const metadata: Metadata = { title: "Catálogos de enquetes" };

export default async function VotacoesAdminPage() {
  const admin = await exigirAdmin();
  const catalogos = await listarCatalogosAdmin(admin.turmaId);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Catálogos de enquetes</h1>
        <Link href="/admin/votacoes/nova" className={cn(buttonVariants())}>
          <Plus aria-hidden /> Novo catálogo
        </Link>
      </div>
      <p className="mt-2 max-w-2xl text-muted-foreground text-pretty">
        O catálogo padrão vale para todas as turmas e não pode ser editado. Nos
        catálogos personalizados você cria categorias e perguntas próprias. Em
        qualquer um, dá para ver quem votou em cada opção.
      </p>

      <div data-grupo className="mt-6 grid gap-4 md:grid-cols-2">
        {catalogos.map((c) => (
          <Link key={c.id} href={`/admin/votacoes/${c.id}`} className="block">
            <Card className="vitrine-cartao h-full">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-10 items-center justify-center rounded-lg border bg-muted/50 text-[var(--vitrine-a)]">
                    {c.padrao ? (
                      <Lock className="size-5" aria-hidden />
                    ) : (
                      <LayoutList className="size-5" aria-hidden />
                    )}
                  </span>
                  <Badge variant={c.padrao ? "secondary" : "default"}>
                    {c.padrao ? "Padrão" : "Personalizado"}
                  </Badge>
                </div>
                <CardTitle className="mt-2 text-lg">{c.nome}</CardTitle>
                <CardDescription>
                  {c.enquetes} {c.enquetes === 1 ? "pergunta" : "perguntas"}
                </CardDescription>
                <p className="mt-3 flex items-center gap-1 text-sm font-medium text-[var(--vitrine-a)]">
                  {c.padrao ? "Ver votos" : "Editar e ver votos"} <ArrowRight className="size-4" aria-hidden />
                </p>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
