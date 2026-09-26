import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { z } from "zod";
import { EnqueteCard } from "@/components/features/enquete-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { exigirMembro } from "@/lib/dal";
import { getCatalogoParaVotar } from "@/lib/votacoes";

export default async function CatalogoPage(
  props: PageProps<"/votacoes/[catalogoId]">,
) {
  const membro = await exigirMembro();
  const { catalogoId } = await props.params;
  if (!z.uuid().safeParse(catalogoId).success) notFound();

  const catalogo = await getCatalogoParaVotar(catalogoId, membro);
  if (!catalogo) notFound();

  const enquetes = catalogo.categorias.flatMap((c) => c.enquetes);
  const respondidas = enquetes.filter((e) => e.selecionadas.length > 0).length;

  return (
    <div className="mx-auto w-full max-w-3xl 2xl:max-w-5xl">
      <Link
        href="/votacoes"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden /> Todos os catálogos
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {catalogo.nome}
        </h1>
        <Badge variant={catalogo.padrao ? "secondary" : "default"}>
          {catalogo.padrao ? "Padrão" : "Personalizado"}
        </Badge>
      </div>

      <Card className="vitrine-fundo-hero mt-4">
        <CardHeader>
          <CardDescription>Seu progresso neste catálogo</CardDescription>
          <CardTitle className="text-2xl tabular-nums">
            <span data-contar={respondidas}>{respondidas}</span>{" "}
            <span className="text-base font-normal text-muted-foreground">
              de {enquetes.length} respondidas
            </span>
          </CardTitle>
          <Progress
            className="mt-2 h-2"
            value={enquetes.length === 0 ? 0 : (respondidas / enquetes.length) * 100}
            aria-label="Seu progresso neste catálogo"
          />
        </CardHeader>
      </Card>

      {catalogo.categorias.length > 1 && (
        <nav
          aria-label="Categorias"
          className="sticky top-0 z-10 mt-4 flex gap-2 overflow-x-auto border-b [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-background/85 py-2 backdrop-blur"
        >
          {catalogo.categorias.map((c) => (
            <a
              key={c.id}
              href={`#cat-${c.id}`}
              className="shrink-0 rounded-full border px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {c.nome}
            </a>
          ))}
        </nav>
      )}

      {catalogo.categorias.map((categoria) => (
        <section key={categoria.id} id={`cat-${categoria.id}`} className="mt-8 scroll-mt-16">
          <h2 className="text-lg font-semibold">{categoria.nome}</h2>
          <div data-grupo className="mt-3 grid gap-4">
            {categoria.enquetes.map((enquete) => (
              <EnqueteCard key={enquete.id} enquete={enquete} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
