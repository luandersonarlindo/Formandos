import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { EnqueteCard } from "@/components/features/enquete-card";
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

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Link
        href="/votacoes"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Todos os catálogos
      </Link>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        {catalogo.nome}
      </h1>

      {catalogo.categorias.map((categoria) => (
        <section key={categoria.id} className="mt-8">
          <h2 className="text-lg font-semibold">{categoria.nome}</h2>
          <div className="mt-3 grid gap-4">
            {categoria.enquetes.map((enquete) => (
              <EnqueteCard key={enquete.id} enquete={enquete} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
