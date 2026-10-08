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
  atualizarEnquete,
  excluirCatalogo,
  excluirCategoria,
  excluirEnquete,
  renomearCatalogo,
  renomearCategoria,
} from "@/actions/catalogos";
import { EstadoVazio } from "@/components/features/estado-vazio";
import { ConfirmarExclusao } from "@/components/features/confirmar-exclusao";
import { FormAcao } from "@/components/features/form-acao";
import { FormDialog } from "@/components/features/form-dialog";
import { FormEnquete } from "@/components/features/form-enquete";
import { PainelRecolhivel } from "@/components/features/painel-recolhivel";
import { ChecklistAmico } from "@/components/ilustracoes/checklist-amico";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
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
    <div className="mx-auto w-full max-w-4xl 2xl:max-w-6xl">
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
            <FormDialog
              rotulo="Renomear"
              icone={<Pencil aria-hidden />}
              titulo="Nome do catálogo"
              descricao="Vale para todos os membros desta turma."
              acao={renomearCatalogo}
              campos={{ catalogoId: catalogo.id }}
              rotuloSubmit="Renomear"
              rotuloPendente="Salvando…"
            >
              <Input
                name="nome"
                defaultValue={catalogo.nome}
                maxLength={255}
                className="h-10"
                required
                aria-label="Nome do catálogo"
              />
            </FormDialog>
            <div className="flex flex-col gap-2 rounded-lg border border-dashed border-destructive/40 p-3 md:flex-row md:items-center md:justify-between">
              <p className="text-xs text-muted-foreground">
                Apaga também todas as perguntas e os votos deste catálogo. Não dá para desfazer.
              </p>
              <ConfirmarExclusao
                acao={excluirCatalogo}
                campos={{ catalogoId: catalogo.id }}
                alvo="o catálogo"
                nome={catalogo.nome}
                aviso="Apaga também todas as perguntas e os votos deste catálogo."
                rotulo="Excluir catálogo"
                descricao={`Excluir o catálogo ${catalogo.nome}`}
                icone={<Trash2 aria-hidden />}
                className="self-start"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* top-14, e nao top-0: o cabecalho do painel (app-shell.tsx) e
          sticky em top-0 e tem a mesma altura. Com top-0 as duas barras
          grudavam no mesmo lugar e, tendo o mesmo z-index, a de baixo
          cobria o cabecalho. */}
      {catalogo.categorias.length > 1 && (
        <nav
          aria-label="Categorias"
          className="sticky top-14 z-10 mt-6 flex gap-2 overflow-x-auto border-b bg-background/85 py-2 backdrop-blur [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
        <EstadoVazio
          className="mt-8"
          descricao={editavel ? "Crie a primeira categoria no formulário abaixo." : undefined}
          ilustracao={<ChecklistAmico />}
          titulo="Nenhuma categoria ainda"
        />
      )}

      {catalogo.categorias.map((categoria) => (
        <section key={categoria.id} id={`cat-${categoria.id}`} className="mt-8 scroll-mt-16">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {editavel ? (
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold">{categoria.nome}</h2>
                <FormDialog
                  rotulo="Renomear"
                  icone={<Pencil aria-hidden />}
                  titulo="Nome da categoria"
                  descricao="Vale para todos os membros desta turma."
                  acao={renomearCategoria}
                  campos={{ categoriaId: categoria.id }}
                  rotuloSubmit="Salvar"
                  rotuloPendente="Salvando…"
                >
                  <Input
                    name="nome"
                    defaultValue={categoria.nome}
                    maxLength={100}
                    className="h-10"
                    aria-label={`Nome da categoria ${categoria.nome}`}
                    required
                  />
                </FormDialog>
              </div>
            ) : (
              <h2 className="text-lg font-semibold">{categoria.nome}</h2>
            )}
            {editavel && (
              <ConfirmarExclusao
                acao={excluirCategoria}
                campos={{ categoriaId: categoria.id }}
                alvo="a categoria"
                nome={categoria.nome}
                aviso="Apaga também as perguntas e os votos desta categoria."
                rotulo="Excluir categoria"
                descricao={`Excluir a categoria ${categoria.nome}`}
                icone={<Trash2 aria-hidden />}
              />
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
                        <ConfirmarExclusao
                          acao={excluirEnquete}
                          campos={{ enqueteId: e.id }}
                          alvo="a pergunta"
                          nome={e.titulo}
                          aviso="Apaga também as opções e os votos desta pergunta."
                          rotulo="Excluir pergunta"
                          descricao={`Excluir a pergunta ${e.titulo}`}
                          icone={<Trash2 aria-hidden />}
                        />
                      )}
                    </div>

                    {editavel && (
                      <div className="flex flex-wrap gap-2 border-t pt-3">
                        <FormDialog
                          rotulo="Editar pergunta"
                          icone={<Pencil aria-hidden />}
                          titulo="Editar pergunta"
                          descricao="Pergunta, tipo (mudável enquanto ninguém votou) e opções."
                          acao={atualizarEnquete}
                          campos={{ enqueteId: e.id }}
                          rotuloSubmit="Salvar"
                          rotuloPendente="Salvando…"
                          dialogClassName="sm:max-w-xl"
                        >
                          <div className="flex flex-col gap-1.5">
                            <Label htmlFor={`titulo-${e.id}`} className="text-xs">Pergunta</Label>
                            <Input id={`titulo-${e.id}`} name="titulo" defaultValue={e.titulo} maxLength={500} required />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label htmlFor={`tipo-${e.id}`} className="text-xs">Tipo</Label>
                            {e.votantes > 0 ? (
                              <>
                                <p className="text-sm text-muted-foreground">
                                  {e.tipo === "unica" ? "Escolha única" : "Escolha múltipla"} (já tem voto, não dá para mudar)
                                </p>
                                <input type="hidden" name="tipo" value={e.tipo} />
                              </>
                            ) : (
                              <NativeSelect id={`tipo-${e.id}`} name="tipo" defaultValue={e.tipo}>
                                <option value="unica">Escolha única</option>
                                <option value="multipla">Escolha múltipla</option>
                              </NativeSelect>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <Label className="text-xs">Opções</Label>
                            {e.opcoes.map((o) => (
                              <div key={o.id} className="flex items-center gap-2">
                                <Input name={`opcao-${o.id}`} defaultValue={o.texto} maxLength={255} className="h-9" aria-label={`Opção ${o.texto}`} required />
                                <label className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                                  <input type="radio" name="exclusivaId" value={o.id} defaultChecked={o.exclusiva} />
                                  Exclusiva
                                </label>
                                <label className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                                  <input type="checkbox" name={`remover-${o.id}`} />
                                  Remover
                                </label>
                              </div>
                            ))}
                            <div className="flex items-center gap-2">
                              <Input name="novaOpcao" placeholder="Nova opção (opcional)" maxLength={255} className="h-9" />
                              <label className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                                <input type="radio" name="exclusivaId" value="nova" />
                                Exclusiva
                              </label>
                            </div>
                            <label className="flex items-center gap-1 text-xs text-muted-foreground">
                              <input type="radio" name="exclusivaId" value="" defaultChecked={!e.opcoes.some((o) => o.exclusiva)} />
                              Nenhuma opção exclusiva
                            </label>
                            <p className="text-xs text-muted-foreground">
                              “Exclusiva” só vale em escolha múltipla: marcá-la desmarca as outras (ex.: “Nenhuma preferência”).
                              Uma opção só é removida se ainda não tiver voto.
                            </p>
                          </div>
                        </FormDialog>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
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

      {/* Um formulário só, aqui no fim, em vez de um repetido no fim de cada
          categoria. Com dez categorias eram dez cópias do mesmo formulário
          espalhadas pela página, e a pessoa tinha que rolar até a categoria
          certa para adicionar uma pergunta. A categoria agora é escolhida
          dentro do formulário. */}
      {editavel && catalogo.categorias.length > 0 && (
        <PainelRecolhivel className="group mt-4 rounded-xl border p-4">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium [&::-webkit-details-marker]:hidden">
            <span className="flex size-7 items-center justify-center rounded-md border bg-muted/50 text-[var(--vitrine-a)]">
              <Plus className="size-4 transition-transform group-open:rotate-45" aria-hidden />
            </span>
            Adicionar pergunta
          </summary>
          <div className="mt-4">
            <FormEnquete
              categorias={catalogo.categorias.map((c) => ({ id: c.id, nome: c.nome }))}
            />
          </div>
        </PainelRecolhivel>
      )}
    </div>
  );
}
