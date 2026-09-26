import Link from "next/link";
import {
  ArrowLeft,
  CircleDot,
  Eye,
  Folder,
  ListChecks,
  Lock,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { notFound } from "next/navigation";
import { z } from "zod";
import {
  adicionarCategoria,
  excluirCatalogo,
  excluirCategoria,
  excluirEnquete,
  renomearCatalogo,
} from "@/actions/catalogos";
import { FormAcao } from "@/components/features/form-acao";
import { FormEnquete } from "@/components/features/form-enquete";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCatalogoAdmin } from "@/lib/admin";
import { exigirAdmin } from "@/lib/dal";

export default async function CatalogoAdminPage(
  props: PageProps<"/admin/votacoes/[catalogoId]">,
) {
  const admin = await exigirAdmin();
  const { catalogoId } = await props.params;
  if (!z.uuid().safeParse(catalogoId).success) notFound();
  const catalogo = await getCatalogoAdmin(catalogoId, admin.turmaId);
  if (!catalogo) notFound();
  const editavel = !catalogo.padrao;

  const totalPerguntas = catalogo.categorias.reduce((n, c) => n + c.enquetes.length, 0);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Link
        href="/admin/votacoes"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden /> Todos os catálogos
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{catalogo.nome}</h1>
        <Badge variant={catalogo.padrao ? "secondary" : "default"}>
          {catalogo.padrao ? "Padrão (somente leitura)" : "Personalizado"}
        </Badge>
      </div>
      <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Folder className="size-4 text-[var(--vitrine-a)]" aria-hidden />
          {catalogo.categorias.length} {catalogo.categorias.length === 1 ? "categoria" : "categorias"}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ListChecks className="size-4 text-[var(--vitrine-a)]" aria-hidden />
          {totalPerguntas} {totalPerguntas === 1 ? "pergunta" : "perguntas"}
        </span>
      </p>

      {!editavel && (
        <p className="mt-4 flex items-start gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
          O catálogo padrão vale para todas as turmas e não pode ser editado. Você pode ver quem votou em cada pergunta.
        </p>
      )}

      {editavel && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Pencil className="size-4 text-[var(--vitrine-a)]" aria-hidden /> Nome do catálogo
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <FormAcao acao={renomearCatalogo} rotulo="Renomear">
              <input type="hidden" name="catalogoId" value={catalogo.id} />
              <Input name="nome" defaultValue={catalogo.nome} maxLength={255} className="h-10" required aria-label="Nome do catálogo" />
            </FormAcao>
            <form action={excluirCatalogo} className="flex flex-col gap-2 rounded-lg border border-dashed border-destructive/40 p-3 md:flex-row md:items-center md:justify-between">
              <input type="hidden" name="catalogoId" value={catalogo.id} />
              <p className="text-xs text-muted-foreground">
                Apaga também todas as perguntas e os votos deste catálogo. Não dá para desfazer.
              </p>
              <Button type="submit" variant="destructive" size="sm" className="self-start">
                <Trash2 aria-hidden /> Excluir catálogo
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {catalogo.categorias.length > 1 && (
        <nav
          aria-label="Categorias"
          className="sticky top-0 z-10 mt-6 flex gap-2 overflow-x-auto border-b bg-background/85 py-2 backdrop-blur [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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

      {catalogo.categorias.length === 0 && (
        <div className="mt-8 flex flex-col items-center gap-2 rounded-xl border border-dashed p-10 text-center">
          <Folder className="size-8 text-muted-foreground" aria-hidden />
          <p className="font-medium">Nenhuma categoria ainda</p>
          {editavel && (
            <p className="text-sm text-muted-foreground">Crie a primeira categoria no formulário abaixo.</p>
          )}
        </div>
      )}

      {catalogo.categorias.map((categoria) => (
        <section key={categoria.id} id={`cat-${categoria.id}`} className="mt-8 scroll-mt-16">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">{categoria.nome}</h2>
            {editavel && (
              <form action={excluirCategoria}>
                <input type="hidden" name="categoriaId" value={categoria.id} />
                <Button type="submit" variant="destructive" size="sm">
                  <Trash2 aria-hidden /> Excluir categoria
                </Button>
              </form>
            )}
          </div>

          <ul data-grupo className="mt-3 grid gap-3">
            {categoria.enquetes.map((e) => (
              <li key={e.id}>
                <Card>
                  <CardContent className="flex flex-col gap-3">
                    <div>
                      <p className="font-medium">{e.titulo}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          {e.tipo === "unica" ? (
                            <CircleDot className="size-3.5" aria-hidden />
                          ) : (
                            <ListChecks className="size-3.5" aria-hidden />
                          )}
                          {e.tipo === "unica" ? "Escolha única" : "Escolha múltipla"}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="size-3.5" aria-hidden />
                          {e.votantes} {e.votantes === 1 ? "membro votou" : "membros votaram"}
                        </span>
                      </p>
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {e.opcoes.map((o) => (
                          <li
                            key={o.id}
                            className="rounded-full border bg-muted/40 px-3 py-1 text-sm"
                          >
                            {o.texto}
                            {o.exclusiva && <span className="text-muted-foreground"> (exclusiva)</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-wrap gap-2 border-t pt-3">
                      <Link
                        href={`/admin/votacoes/votos/${e.id}`}
                        className="inline-flex h-7 items-center gap-1 rounded-lg border px-2.5 text-[0.8rem] font-medium transition-colors hover:bg-muted"
                      >
                        <Eye className="size-3.5" aria-hidden /> Ver quem votou
                      </Link>
                      {editavel && (
                        <form action={excluirEnquete}>
                          <input type="hidden" name="enqueteId" value={e.id} />
                          <Button type="submit" variant="destructive" size="sm">
                            <Trash2 aria-hidden /> Excluir pergunta
                          </Button>
                        </form>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>

          {editavel && (
            <details className="group mt-3 rounded-xl border p-4">
              <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium [&::-webkit-details-marker]:hidden">
                <span className="flex size-7 items-center justify-center rounded-md border bg-muted/50 text-[var(--vitrine-a)]">
                  <Plus className="size-4 transition-transform group-open:rotate-45" aria-hidden />
                </span>
                Adicionar pergunta em {categoria.nome}
              </summary>
              <div className="mt-4">
                <FormEnquete categoriaId={categoria.id} />
              </div>
            </details>
          )}
        </section>
      ))}

      {editavel && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Folder className="size-4 text-[var(--vitrine-a)]" aria-hidden /> Nova categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormAcao acao={adicionarCategoria} rotulo="Adicionar categoria" rotuloPendente="Adicionando…">
              <input type="hidden" name="catalogoId" value={catalogo.id} />
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nome-categoria">Nome</Label>
                <Input id="nome-categoria" name="nome" maxLength={100} className="h-10" required />
              </div>
            </FormAcao>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
