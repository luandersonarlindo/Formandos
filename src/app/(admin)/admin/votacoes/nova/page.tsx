import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, LayoutList } from "lucide-react";
import { criarCatalogo, criarCatalogoDeModelo } from "@/actions/catalogos";
import { FormAcao } from "@/components/features/form-acao";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listarModelos } from "@/lib/modelos";

export const metadata: Metadata = { title: "Novo catálogo" };

export default async function NovoCatalogoPage() {
  const modelos = await listarModelos();
  return (
    <div className="mx-auto w-full max-w-3xl 2xl:max-w-5xl">
      <Link
        href="/admin/votacoes"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden /> Catálogos de enquetes
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">Novo catálogo</h1>
      <p className="mt-2 text-muted-foreground text-pretty">
        Comece de um modelo pronto ou dê um nome e monte o catálogo do zero. Em
        seguida você pode editar categorias e perguntas.
      </p>
      <h2 className="mt-8 text-lg font-semibold tracking-tight">Começar de um modelo</h2>
      <p className="mt-1 text-sm text-muted-foreground text-pretty">
        O modelo vira um catálogo só da sua turma, que você pode editar.
      </p>
      <ul className="mt-4 grid gap-4 md:grid-cols-2">
        {modelos.map((m) => {
          const perguntas = m.categorias.reduce((n, c) => n + c.enquetes.length, 0);
          return (
            <li key={m.slug}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-base">{m.nome}</CardTitle>
                  <CardDescription>
                    {m.categorias.length} categorias · {perguntas} perguntas
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <p className="text-sm text-muted-foreground text-pretty">{m.descricao}</p>
                  <FormAcao
                    acao={criarCatalogoDeModelo}
                    rotulo="Usar este modelo"
                    rotuloPendente="Criando…"
                  >
                    <input type="hidden" name="modelo" value={m.slug} />
                  </FormAcao>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
      <h2 className="mt-10 text-lg font-semibold tracking-tight">Ou comece do zero</h2>
      <Card className="mt-4">
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
