import Link from "next/link";
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

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Link href="/admin/votacoes" className="text-sm text-muted-foreground hover:text-foreground">
        ← Todos os catálogos
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{catalogo.nome}</h1>
        <Badge variant={catalogo.padrao ? "secondary" : "default"}>
          {catalogo.padrao ? "Padrão (somente leitura)" : "Personalizado"}
        </Badge>
      </div>

      {editavel && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Nome do catálogo</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <FormAcao acao={renomearCatalogo} rotulo="Renomear">
              <input type="hidden" name="catalogoId" value={catalogo.id} />
              <Input name="nome" defaultValue={catalogo.nome} maxLength={255} required aria-label="Nome do catálogo" />
            </FormAcao>
            <form action={excluirCatalogo} className="border-t pt-4">
              <input type="hidden" name="catalogoId" value={catalogo.id} />
              <Button type="submit" variant="destructive" size="sm">
                Excluir catálogo
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                Apaga também todas as perguntas e os votos deste catálogo. Não dá para desfazer.
              </p>
            </form>
          </CardContent>
        </Card>
      )}

      {catalogo.categorias.length === 0 && (
        <p className="mt-8 text-muted-foreground">Nenhuma categoria ainda.</p>
      )}

      {catalogo.categorias.map((categoria) => (
        <section key={categoria.id} className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">{categoria.nome}</h2>
            {editavel && (
              <form action={excluirCategoria}>
                <input type="hidden" name="categoriaId" value={categoria.id} />
                <Button type="submit" variant="destructive" size="sm">
                  Excluir categoria
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
                      <p className="mt-1 text-xs text-muted-foreground">
                        {e.tipo === "unica" ? "Escolha única" : "Escolha múltipla"} · {e.votantes}{" "}
                        {e.votantes === 1 ? "membro votou" : "membros votaram"}
                      </p>
                      <ul className="mt-2 list-disc pl-5 text-sm">
                        {e.opcoes.map((o) => (
                          <li key={o.id}>
                            {o.texto}
                            {o.exclusiva && <span className="text-muted-foreground"> (exclusiva)</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-wrap gap-2 border-t pt-3">
                      <Link
                        href={`/admin/votacoes/votos/${e.id}`}
                        className="inline-flex h-7 items-center rounded-lg border px-2.5 text-[0.8rem] font-medium hover:bg-muted"
                      >
                        Ver quem votou
                      </Link>
                      {editavel && (
                        <form action={excluirEnquete}>
                          <input type="hidden" name="enqueteId" value={e.id} />
                          <Button type="submit" variant="destructive" size="sm">
                            Excluir pergunta
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
            <details className="mt-3 rounded-lg border p-4">
              <summary className="cursor-pointer text-sm font-medium">
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
            <CardTitle>Nova categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <FormAcao acao={adicionarCategoria} rotulo="Adicionar categoria" rotuloPendente="Adicionando…">
              <input type="hidden" name="catalogoId" value={catalogo.id} />
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nome-categoria">Nome</Label>
                <Input id="nome-categoria" name="nome" maxLength={100} required />
              </div>
            </FormAcao>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
