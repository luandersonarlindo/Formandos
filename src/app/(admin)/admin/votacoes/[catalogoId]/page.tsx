import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight, Plus, Trash2 } from "lucide-react";
import { notFound } from "next/navigation";
import { z } from "zod";
import {
  adicionarCategoria,
  atualizarEnquete,
  excluirCatalogo,
  excluirCategoria,
  excluirEnquete,
  mostrarEnquete,
  moverCategoria,
  moverEnquete,
  ocultarEnquete,
  renomearCatalogo,
  renomearCategoria,
} from "@/actions/catalogos";
import type { EstadoForm } from "@/actions/tipos";
import { CabecalhoPagina } from "@/components/features/cabecalho-pagina";
import { DialogoNovaPergunta } from "@/components/features/dialogo-nova-pergunta";
import { EditorOpcoes } from "@/components/features/editor-opcoes";
import { EstadoVazio } from "@/components/features/estado-vazio";
import { CampoTipo } from "@/components/features/form-enquete";
import { FormDialog } from "@/components/features/form-dialog";
import { LinkVoltar } from "@/components/features/link-voltar";
import { AcaoExcluir, MenuAcoes } from "@/components/features/menu-acoes";
import { MenuGestao } from "@/components/features/menu-gestao";
import { RenomearInline } from "@/components/features/renomear-inline";
import { RolarParaPerguntaCriada } from "@/components/features/rolar-para-pergunta-criada";
import { ChecklistAmico } from "@/components/ilustracoes/checklist-amico";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCatalogoAdmin, type EnqueteAdmin } from "@/lib/admin";
import { formatarDataHora } from "@/lib/datas";
import { getNomeCatalogo } from "@/lib/votacoes";
import { exigirAdmin } from "@/lib/dal";

export async function generateMetadata(
  props: PageProps<"/admin/votacoes/[catalogoId]">,
): Promise<Metadata> {
  const admin = await exigirAdmin();
  const { catalogoId } = await props.params;
  if (!z.uuid().safeParse(catalogoId).success) return {};
  const nome = await getNomeCatalogo(catalogoId, admin.turmaId);
  if (!nome) return {};
  return { title: `Gerenciar ${nome}` };
}

// Ocultar e mostrar (catálogo padrão) não devolvem estado; o menu "⋯" precisa
// de um texto para o toast.
async function ocultar(_: EstadoForm, dados: FormData): Promise<EstadoForm> {
  "use server";
  await ocultarEnquete(dados);
  return { ok: "Pergunta oculta para a sua turma." };
}
async function mostrar(_: EstadoForm, dados: FormData): Promise<EstadoForm> {
  "use server";
  await mostrarEnquete(dados);
  return { ok: "Pergunta visível para a sua turma." };
}

// Estado da pergunta numa palavra (P-13): decidida diz qual foi a escolha.
function EstadoPergunta({ e }: { e: EnqueteAdmin }) {
  if (e.decisao.length > 0) {
    return <Badge className="max-w-full whitespace-normal">Decidida: {e.decisao.join(", ")}</Badge>;
  }
  if (e.oculta) return <Badge variant="secondary">Oculta para sua turma</Badge>;
  if (e.regra.prazo && !e.prazoAberto) return <Badge variant="outline">Prazo encerrado</Badge>;
  return <Badge variant="destaque">Aberta</Badge>;
}

// O catálogo fica só com a estrutura (D-07 do plano de UX): categorias,
// perguntas, ordem e opções. Tudo do ciclo de uma pergunta (regra, avisar a
// turma, mandar para o grupo, fixar a decisão) mora na página dela, "Resultado
// e decisão". Cada pergunta é uma linha com uma ação visível e o "⋯": eram até
// nove botões por pergunta.
export default async function CatalogoAdminPage(
  props: PageProps<"/admin/votacoes/[catalogoId]">,
) {
  const admin = await exigirAdmin();
  const { catalogoId } = await props.params;
  if (!z.uuid().safeParse(catalogoId).success) notFound();
  const catalogo = await getCatalogoAdmin(catalogoId, admin.turmaId);
  if (!catalogo) notFound();
  const editavel = !catalogo.padrao;

  const perguntas = catalogo.categorias.flatMap((c) => c.enquetes);
  const decididas = perguntas.filter((e) => e.decisao.length > 0).length;
  const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

  const novaCategoria = (rotulo: string, variante: "default" | "outline") => (
    <FormDialog
      rotulo={rotulo}
      icone={<Plus aria-hidden />}
      variante={variante}
      tamanho="default"
      titulo="Nova categoria"
      descricao="Agrupa perguntas parecidas, como “Festa” ou “Fotos”."
      acao={adicionarCategoria}
      campos={{ catalogoId: catalogo.id }}
      rotuloSubmit="Adicionar categoria"
      rotuloPendente="Adicionando…"
      dialogClassName="sm:max-w-md"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nome-categoria">Nome</Label>
        <Input id="nome-categoria" name="nome" maxLength={100} className="h-10" required />
      </div>
    </FormDialog>
  );

  return (
    <div className="mx-auto w-full max-w-4xl 2xl:max-w-6xl">
      {/* Fica montado o tempo todo, sem renderizar nada: escuta o evento de
          "pergunta criada" e rola até ela. */}
      <RolarParaPerguntaCriada />
      <CabecalhoPagina
        antes={<LinkVoltar href="/admin/votacoes">Todos os catálogos</LinkVoltar>}
        titulo={
          editavel ? (
            <RenomearInline
              valor={catalogo.nome}
              acao={renomearCatalogo}
              campos={{ catalogoId: catalogo.id }}
              rotuloBotao="Renomear o catálogo"
              rotuloCampo="Nome novo do catálogo"
            />
          ) : (
            catalogo.nome
          )
        }
        descricao={
          <>
            {plural(catalogo.categorias.length, "categoria", "categorias")} ·{" "}
            {plural(perguntas.length, "pergunta", "perguntas")} · {decididas} de {perguntas.length}{" "}
            {perguntas.length === 1 ? "decidida" : "decididas"}.
            {!editavel && " O catálogo padrão vale para todas as turmas e não pode ser editado."}
          </>
        }
        acao={
          editavel ? (
            <>
              {novaCategoria("Nova categoria", "default")}
              <MenuAcoes nome={catalogo.nome}>
                <AcaoExcluir
                  acao={excluirCatalogo}
                  campos={{ catalogoId: catalogo.id }}
                  alvo="o catálogo"
                  nome={catalogo.nome}
                  aviso="Apaga também todas as perguntas e os votos deste catálogo."
                  rotulo="Excluir catálogo"
                  icone={<Trash2 aria-hidden />}
                />
              </MenuAcoes>
            </>
          ) : undefined
        }
      />

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
              className="inline-flex h-8 shrink-0 items-center rounded-full border px-3 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted hover:text-foreground pointer-coarse:h-11"
            >
              {c.nome}
            </a>
          ))}
        </nav>
      )}

      {catalogo.categorias.length === 0 && (
        <EstadoVazio
          className="mt-8"
          descricao={editavel ? "Comece por uma categoria; depois, as perguntas dela." : undefined}
          ilustracao={<ChecklistAmico />}
          titulo="Nenhuma categoria ainda"
          acao={editavel ? novaCategoria("Criar a primeira categoria", "default") : undefined}
        />
      )}

      {catalogo.categorias.map((categoria, ci) => (
        <section key={categoria.id} id={`cat-${categoria.id}`} className="mt-8 scroll-mt-16">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {editavel ? (
              <h2 className="min-w-0 text-lg font-semibold">
                <RenomearInline
                  valor={categoria.nome}
                  acao={renomearCategoria}
                  campos={{ categoriaId: categoria.id }}
                  rotuloBotao={`Renomear a categoria ${categoria.nome}`}
                  rotuloCampo={`Nome novo da categoria ${categoria.nome}`}
                />
              </h2>
            ) : (
              <h2 className="text-lg font-semibold">{categoria.nome}</h2>
            )}
            {/* "Adicionar pergunta" continua à vista: é a criação mais usada.
                Ordem e exclusão da categoria vão para o "⋯". */}
            {editavel && (
              <div className="flex items-center gap-1">
                <DialogoNovaPergunta
                  categoria={{ id: categoria.id, nome: categoria.nome }}
                  categorias={catalogo.categorias.map((c) => ({ id: c.id, nome: c.nome }))}
                />
                <MenuGestao
                  nome={categoria.nome}
                  mover={{
                    acao: moverCategoria,
                    tipo: "categoria",
                    id: categoria.id,
                    podeSubir: ci > 0,
                    podeDescer: ci < catalogo.categorias.length - 1,
                  }}
                  excluir={{
                    acao: excluirCategoria,
                    campos: { categoriaId: categoria.id },
                    alvo: "a categoria",
                    nome: categoria.nome,
                    aviso: "Apaga também as perguntas e os votos desta categoria.",
                    rotulo: "Excluir categoria",
                    icone: <Trash2 aria-hidden />,
                  }}
                />
              </div>
            )}
          </div>

          {categoria.enquetes.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground">
              Nenhuma pergunta nesta categoria.
            </p>
          ) : (
            <ul data-grupo className="mt-3 divide-y rounded-xl border">
              {categoria.enquetes.map((e, ei) => (
                /* tabIndex -1: o item recebe foco por script quando é a pergunta
                   recém-criada, mas continua fora da ordem de tabulação. */
                <li key={e.id} id={`enq-${e.id}`} tabIndex={-1} className="scroll-mt-24 outline-none focus-visible:bg-muted/40">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
                    <div className="min-w-0 flex-1 basis-60">
                      <p className="font-medium wrap-break-word">{e.titulo}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <EstadoPergunta e={e} />
                        <span>{e.tipo === "unica" ? "Escolha única" : "Escolha múltipla"}</span>
                        <span>
                          {e.votantes} de {catalogo.membros} {e.votantes === 1 ? "votou" : "votaram"}
                        </span>
                        {e.regra.prazo && e.prazoAberto && <span>fecha em {formatarDataHora.format(e.regra.prazo)}</span>}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground wrap-break-word">
                        {e.opcoes.map((o) => o.texto).join(" · ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/votacoes/votos/${e.id}`}>
                          Resultado e decisão <ChevronRight aria-hidden />
                        </Link>
                      </Button>
                      <MenuGestao
                        nome={e.titulo}
                        editar={
                          editavel
                            ? {
                                rotulo: "Editar pergunta",
                                titulo: "Editar pergunta",
                                descricao: "Pergunta, tipo (mudável enquanto ninguém votou) e opções.",
                                acao: atualizarEnquete,
                                campos: { enqueteId: e.id },
                                rotuloSubmit: "Salvar",
                                dialogClassName: "sm:max-w-xl",
                                conteudo: (
                                  <>
                                    <div className="flex flex-col gap-1.5">
                                      <Label htmlFor={`titulo-${e.id}`}>Pergunta</Label>
                                      <Input
                                        id={`titulo-${e.id}`}
                                        name="titulo"
                                        defaultValue={e.titulo}
                                        maxLength={500}
                                        className="h-10"
                                        required
                                      />
                                    </div>
                                    {e.votantes > 0 ? (
                                      <p className="text-sm text-muted-foreground">
                                        {e.tipo === "unica" ? "Escolha única" : "Escolha múltipla"} (já tem voto,
                                        não dá para mudar)
                                        <input type="hidden" name="tipo" value={e.tipo} />
                                      </p>
                                    ) : (
                                      <CampoTipo valor={e.tipo} id={`tipo-${e.id}`} />
                                    )}
                                    <fieldset className="flex flex-col gap-2">
                                      <legend className="mb-1.5 p-0 text-sm font-medium">Opções</legend>
                                      <EditorOpcoes modo="editar" tipo={e.tipo} opcoesIniciais={e.opcoes} />
                                    </fieldset>
                                  </>
                                ),
                              }
                            : undefined
                        }
                        previa={{
                          titulo: e.titulo,
                          tipo: e.tipo,
                          opcoes: e.opcoes,
                          categoria: categoria.nome,
                          posicao: ei + 1,
                          total: categoria.enquetes.length,
                        }}
                        mover={
                          editavel
                            ? {
                                acao: moverEnquete,
                                tipo: "pergunta",
                                id: e.id,
                                podeSubir: ei > 0,
                                podeDescer: ei < categoria.enquetes.length - 1,
                              }
                            : undefined
                        }
                        simples={
                          editavel
                            ? []
                            : [
                                {
                                  rotulo: e.oculta ? "Mostrar pra minha turma" : "Ocultar da minha turma",
                                  acao: e.oculta ? mostrar : ocultar,
                                  campos: { enqueteId: e.id, catalogoId: catalogo.id },
                                },
                              ]
                        }
                        excluir={
                          editavel
                            ? {
                                acao: excluirEnquete,
                                campos: { enqueteId: e.id },
                                alvo: "a pergunta",
                                nome: e.titulo,
                                aviso: "Apaga também as opções e os votos desta pergunta.",
                                rotulo: "Excluir pergunta",
                                icone: <Trash2 aria-hidden />,
                              }
                            : undefined
                        }
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
