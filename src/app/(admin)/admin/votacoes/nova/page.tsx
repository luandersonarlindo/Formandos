import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, LayoutList } from "lucide-react";
import { criarCatalogo } from "@/actions/catalogos";
import { FormAcao } from "@/components/features/form-acao";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = { title: "Novo catálogo" };

export default function NovoCatalogoPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <Link
        href="/admin/votacoes"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden /> Catálogos de enquetes
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">Novo catálogo</h1>
      <p className="mt-2 text-muted-foreground text-pretty">
        Dê um nome ao catálogo. Em seguida você adiciona as categorias e as
        perguntas.
      </p>
      <Card className="mt-6">
        <CardHeader>
          <span className="mb-1 flex size-10 items-center justify-center rounded-lg border bg-muted/50 text-[var(--vitrine-a)]">
            <LayoutList className="size-5" aria-hidden />
          </span>
          <CardTitle className="text-lg">Nome do catálogo</CardTitle>
          <CardDescription>Ex.: Escolhas do baile de gala</CardDescription>
        </CardHeader>
        <CardContent>
          <FormAcao acao={criarCatalogo} rotulo="Criar catálogo" rotuloPendente="Criando…">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" name="nome" maxLength={255} className="h-10" required />
            </div>
          </FormAcao>
        </CardContent>
      </Card>
    </div>
  );
}
