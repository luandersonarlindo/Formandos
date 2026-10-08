import type { Metadata } from "next";
import Link from "next/link";
import {
  CircleCheck,
  CircleDot,
  MessageSquareReply,
  Pencil,
  RotateCcw,
  Star,
  StarOff,
  Trash2,
} from "lucide-react";
import {
  alternarDestaque,
  alternarRespondida,
  apagarDuvida,
  responderDuvida,
} from "@/actions/admin";
import { editarDuvida, excluirDuvida } from "@/actions/duvidas";
import { BotaoUpvote } from "@/components/features/botao-upvote";
import { ConfirmarExclusao } from "@/components/features/confirmar-exclusao";
import { EstadoVazio } from "@/components/features/estado-vazio";
import { FormDialog } from "@/components/features/form-dialog";
import { FormNovaDuvida } from "@/components/features/form-nova-duvida";
import { Paginacao } from "@/components/features/paginacao";
import { PerguntasAmico } from "@/components/ilustracoes/perguntas-amico";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { exigirMembro } from "@/lib/dal";
import { listarDuvidas } from "@/lib/duvidas";
import { lerPagina } from "@/lib/paginacao";

export const metadata: Metadata = { title: "Dúvidas" };

const formatarData = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

const FILTROS = [
  { valor: "todas", rotulo: "Todas" },
  { valor: "abertas", rotulo: "Sem resposta" },
  { valor: "respondidas", rotulo: "Respondidas" },
] as const;

export default async function DuvidasPage({ searchParams }: PageProps<"/duvidas">) {
  const membro = await exigirMembro();
  const ehAdmin = membro.papel === "admin";
  const { filtro: parametro, pagina: paginaParametro } = await searchParams;
  const filtro = FILTROS.find((f) => f.valor === parametro)?.valor ?? "todas";
  const { itens: visiveis, pagina, totalPaginas, contagens } = await listarDuvidas(membro, {
    moderacao: ehAdmin,
    filtro,
    pagina: lerPagina(paginaParametro),
  });
  const contagem = (v: keyof typeof contagens) => contagens[v];

  return (
    <div className="mx-auto w-full max-w-4xl 2xl:max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Dúvidas</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground text-pretty">
        Envie perguntas sobre o evento e vote nas dúvidas dos colegas. As mais
        votadas aparecem primeiro, e a comissão responde oficialmente.
      </p>
      {ehAdmin && (
        <p className="mt-2 max-w-2xl rounded-xl border bg-muted/50 p-3 text-sm text-muted-foreground">
          Você é administrador: responda e destaque as dúvidas direto aqui, na
          mesma lista com que a turma já interage.
        </p>
      )}

      <Card className="mt-6">
        <CardContent>
          <FormNovaDuvida />
        </CardContent>
      </Card>

      <nav
        aria-label="Filtrar dúvidas"
        className="mt-8 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {FILTROS.map((f) => {
          const ativo = f.valor === filtro;
          return (
            <Link
              key={f.valor}
              href={f.valor === "todas" ? "/duvidas" : `/duvidas?filtro=${f.valor}`}
              aria-current={ativo ? "true" : undefined}
              className={
                ativo
                  ? "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--vitrine-a)]/40 bg-[color-mix(in_oklch,var(--vitrine-a)_10%,transparent)] px-3 py-1 text-sm font-medium"
                  : "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              }
            >
              {f.rotulo}
              <span className="text-xs tabular-nums text-muted-foreground">{contagem(f.valor)}</span>
            </Link>
          );
        })}
      </nav>

      {visiveis.length === 0 ? (
        <EstadoVazio
          className="mt-4"
          descricao={
            contagens.todas === 0
              ? "Seja a primeira pessoa a perguntar."
              : "Escolha outro filtro para ver as demais."
          }
          ilustracao={<PerguntasAmico />}
          titulo={contagens.todas === 0 ? "Nenhuma dúvida ainda" : "Nenhuma dúvida neste filtro"}
        />
      ) : (
        <ul data-grupo className="mt-4 grid gap-3">
          {visiveis.map((d) => (
            <li key={d.id} data-duvida={d.id}>
              <Card
                className={
                  d.destaque
                    ? "border border-[var(--vitrine-a)]/30 bg-[color-mix(in_oklch,var(--vitrine-a)_4%,var(--card))]"
                    : undefined
                }
              >
                <CardContent className="flex gap-4">
                  <BotaoUpvote duvidaId={d.id} votos={d.votos} votei={d.votei} />
                  <div className="min-w-0 flex-1">
                    {(d.destaque || d.respondida) && (
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        {d.destaque && (
                          <Badge>
                            <Star aria-hidden /> Em destaque
                          </Badge>
                        )}
                        {d.respondida ? (
                          <Badge variant="secondary" className="text-emerald-700 dark:text-emerald-400">
                            <CircleCheck aria-hidden /> Respondida
                          </Badge>
                        ) : (
                          ehAdmin && (
                            <Badge variant="outline">
                              <CircleDot aria-hidden /> Aberta
                            </Badge>
                          )
                        )}
                      </div>
                    )}
                    <p className="wrap-break-word whitespace-pre-wrap">{d.conteudo}</p>
                    <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <span
                        aria-hidden
                        className="flex size-5 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--vitrine-a),var(--vitrine-b))] text-[10px] font-semibold text-white"
                      >
                        {(d.autor.trim()[0] ?? "?").toUpperCase()}
                      </span>
                      {d.autor} · {formatarData.format(d.criadaEm)}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {d.autorId === membro.usuarioId && (
                        <FormDialog
                          rotulo="Editar dúvida"
                          icone={<Pencil className="size-3.5" aria-hidden />}
                          titulo="Editar dúvida"
                          descricao="A resposta já dada pela comissão não muda."
                          acao={editarDuvida}
                          campos={{ duvidaId: d.id }}
                          rotuloSubmit="Salvar"
                          rotuloPendente="Salvando…"
                        >
                          <Textarea
                            name="conteudo"
                            defaultValue={d.conteudo}
                            maxLength={500}
                            rows={2}
                            required
                          />
                        </FormDialog>
                      )}
                      {!ehAdmin && d.autorId === membro.usuarioId && (
                        <ConfirmarExclusao
                          acao={excluirDuvida}
                          campos={{ duvidaId: d.id }}
                          alvo="a dúvida"
                          nome={d.conteudo}
                          aviso="A dúvida e os votos que ela recebeu somem para todos."
                          rotulo="Excluir dúvida"
                          descricao="Excluir dúvida"
                          icone={<Trash2 className="size-3.5" aria-hidden />}
                        />
                      )}
                      {ehAdmin && (
                        <>
                          <FormDialog
                            rotulo={d.resposta ? "Editar resposta" : "Responder"}
                            icone={<MessageSquareReply className="size-4" aria-hidden />}
                            titulo="Resposta oficial"
                            descricao="Deixe em branco para remover a resposta."
                            acao={responderDuvida}
                            campos={{ duvidaId: d.id }}
                            rotuloSubmit="Salvar resposta"
                            rotuloPendente="Salvando…"
                          >
                            <Textarea
                              name="resposta"
                              maxLength={1000}
                              rows={3}
                              defaultValue={d.resposta ?? ""}
                              placeholder="Deixe em branco para remover a resposta."
                            />
                          </FormDialog>
                          <FormDialog
                            rotulo={d.destaque ? "Tirar destaque" : "Destacar"}
                            icone={
                              d.destaque ? (
                                <StarOff className="size-3.5" aria-hidden />
                              ) : (
                                <Star className="size-3.5" aria-hidden />
                              )
                            }
                            titulo={d.destaque ? "Tirar destaque" : "Destacar dúvida"}
                            descricao={
                              d.destaque
                                ? "A dúvida deixa de aparecer em destaque para a turma."
                                : "A dúvida passa a aparecer em destaque para a turma."
                            }
                            acao={alternarDestaque}
                            campos={{ duvidaId: d.id }}
                            rotuloSubmit={d.destaque ? "Tirar" : "Destacar"}
                            rotuloPendente="Salvando…"
                          />
                          <FormDialog
                            rotulo={d.respondida ? "Reabrir" : "Marcar como respondida"}
                            icone={
                              d.respondida ? (
                                <RotateCcw className="size-3.5" aria-hidden />
                              ) : (
                                <CircleCheck className="size-3.5" aria-hidden />
                              )
                            }
                            titulo={
                              d.respondida ? "Reabrir dúvida" : "Marcar como respondida"
                            }
                            descricao={
                              d.respondida
                                ? "A dúvida volta a aparecer como aberta."
                                : "A dúvida passa a aparecer como respondida, com ou sem resposta oficial."
                            }
                            acao={alternarRespondida}
                            campos={{ duvidaId: d.id }}
                            rotuloSubmit={d.respondida ? "Reabrir" : "Marcar respondida"}
                            rotuloPendente="Salvando…"
                          />
                          <ConfirmarExclusao
                            acao={apagarDuvida}
                            campos={{ duvidaId: d.id }}
                            alvo="a dúvida"
                            nome={d.autor}
                            aviso="A dúvida e os votos que ela recebeu somem para todos."
                            rotulo="Apagar"
                            descricao={`Apagar a dúvida de ${d.autor}`}
                            icone={<Trash2 className="size-3.5" aria-hidden />}
                          />
                        </>
                      )}
                    </div>
                    {d.resposta && (
                      <div className="mt-3 rounded-lg border-l-2 border-[var(--vitrine-a)] bg-muted/60 p-3 text-sm">
                        <p className="flex items-center gap-1.5 font-medium">
                          <MessageSquareReply className="size-4 text-[var(--vitrine-a)]" aria-hidden />
                          Resposta da comissão
                        </p>
                        <p className="mt-1 wrap-break-word whitespace-pre-wrap">
                          {d.resposta}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
      <Paginacao
        pagina={pagina}
        totalPaginas={totalPaginas}
        caminho="/duvidas"
        parametros={{ filtro: filtro === "todas" ? undefined : filtro }}
      />
    </div>
  );
}
