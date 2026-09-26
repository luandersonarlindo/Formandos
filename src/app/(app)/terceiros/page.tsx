import type { Metadata } from "next";
import Link from "next/link";
import { excluirFornecedor } from "@/actions/terceiros";
import { FormNovoFornecedor } from "@/components/features/form-novo-fornecedor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { exigirMembro } from "@/lib/dal";
import { cn } from "@/lib/utils";
import { CATEGORIAS_FORNECEDOR, listarFornecedores } from "@/lib/terceiros";

export const metadata: Metadata = { title: "Terceiros" };

// Só vira link se for um endereço web; qualquer outro texto (telefone, e-mail)
// aparece como texto puro.
function Contato({ valor }: { valor: string }) {
  if (/^https?:\/\//i.test(valor)) {
    return (
      <a
        href={valor}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-4"
      >
        {valor}
      </a>
    );
  }
  return <>{valor}</>;
}

export default async function TerceirosPage(props: PageProps<"/terceiros">) {
  const membro = await exigirMembro();
  const { categoria: parametro } = await props.searchParams;
  const fornecedores = await listarFornecedores(membro);

  const categoriaAtiva = CATEGORIAS_FORNECEDOR.find((c) => c === parametro);
  const visiveis = categoriaAtiva
    ? fornecedores.filter((f) => f.categoria === categoriaAtiva)
    : fornecedores;
  const ehAdmin = membro.papel === "admin";

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Terceiros</h1>
      <p className="mt-2 text-muted-foreground">
        Fornecedores e prestadores de serviço indicados pela comissão
        organizadora.
      </p>

      {ehAdmin && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Adicionar fornecedor</CardTitle>
          </CardHeader>
          <CardContent>
            <FormNovoFornecedor categorias={CATEGORIAS_FORNECEDOR} />
          </CardContent>
        </Card>
      )}

      <nav aria-label="Categorias" className="mt-6 flex flex-wrap gap-2">
        {[undefined, ...CATEGORIAS_FORNECEDOR].map((c) => (
          <Link
            key={c ?? "todas"}
            href={c ? `/terceiros?categoria=${encodeURIComponent(c)}` : "/terceiros"}
            aria-current={c === categoriaAtiva ? "page" : undefined}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm transition-colors hover:bg-muted",
              c === categoriaAtiva && "bg-muted font-medium",
            )}
          >
            {c ?? "Todas"}
          </Link>
        ))}
      </nav>

      <h2 className="mt-8 text-lg font-semibold">
        {visiveis.length === 0
          ? "Nenhum fornecedor por aqui"
          : `${visiveis.length} ${visiveis.length === 1 ? "fornecedor" : "fornecedores"}`}
      </h2>

      <ul className="mt-3 grid gap-3">
        {visiveis.map((f) => (
          <li key={f.id}>
            <Card>
              <CardContent className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{f.nome}</p>
                    <Badge variant="secondary">{f.categoria}</Badge>
                  </div>
                  {f.descricao && (
                    <p className="mt-1 wrap-break-word whitespace-pre-wrap text-sm text-muted-foreground">
                      {f.descricao}
                    </p>
                  )}
                  {f.contato && (
                    <p className="mt-2 wrap-break-word text-sm">
                      Contato: <Contato valor={f.contato} />
                    </p>
                  )}
                </div>
                {ehAdmin && (
                  <form action={excluirFornecedor}>
                    <input type="hidden" name="id" value={f.id} />
                    <Button type="submit" variant="destructive" size="sm">
                      Remover
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
