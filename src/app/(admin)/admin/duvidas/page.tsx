import type { Metadata } from "next";
import Link from "next/link";
import {
  CircleCheck,
  CircleDot,
  MessageSquareReply,
  RotateCcw,
  Star,
  StarOff,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import {
  alternarDestaque,
  alternarRespondida,
  apagarDuvida,
  responderDuvida,
} from "@/actions/admin";
import { ConfirmarExclusao } from "@/components/features/confirmar-exclusao";
import { AvatarUsuario } from "@/components/features/avatar-usuario";
import { EstadoVazio } from "@/components/features/estado-vazio";
import { FormDialog } from "@/components/features/form-dialog";
import { Paginacao } from "@/components/features/paginacao";
import { PerguntasAmico } from "@/components/ilustracoes/perguntas-amico";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { exigirAdmin } from "@/lib/dal";
import { listarDuvidas } from "@/lib/duvidas";
import { lerPagina } from "@/lib/paginacao";

export const metadata: Metadata = { title: "Moderação de dúvidas" };

const formatarData = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

const FILTROS = [
  { valor: "todas", rotulo: "Todas" },
  { valor: "abertas", rotulo: "Sem resposta" },
  { valor: "respondidas", rotulo: "Respondidas" },
] as const;

export default async function ModeracaoDuvidasPage({
  searchParams,
}: PageProps<"/admin/duvidas">) {
  const admin = await exigirAdmin();
  const { filtro: parametro, pagina: paginaParametro } = await searchParams;
  const filtro = FILTROS.find((f) => f.valor === parametro)?.valor ?? "todas";
  const { itens: visiveis, pagina, totalPaginas, contagens } = await listarDuvidas(admin, {
    moderacao: true,
    filtro,
    pagina: lerPagina(paginaParametro),
  });
  const contagem = (v: keyof typeof contagens) => contagens[v];

  return (
    <div className="mx-auto w-full max-w-4xl 2xl:max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
        Moderação de dúvidas
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground text-pretty">
        {contagens.todas === 0
          ? "Nenhuma dúvida enviada ainda."
          : `${contagem("abertas")} sem resposta de ${contagens.todas} no total. As não respondidas aparecem primeiro.`}
      </p>

      <nav
        aria-label="Filtrar dúvidas"
        className="mt-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {FILTROS.map((f) => {
          const ativo = f.valor === filtro;
          return (
            <Link
              key={f.valor}
              href={f.valor === "todas" ? "/admin/duvidas" : `/admin/duvidas?filtro=${f.valor}`}
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
              ? "Quando alguém da turma perguntar, ela aparece aqui."
              : "Escolha outro filtro para ver as demais."
          }
          ilustracao={<PerguntasAmico />}
          titulo={contagens.todas === 0 ? "Nenhuma dúvida ainda" : "Nenhuma dúvida neste filtro"}
        />
      ) : (
        <ul data-grupo className="mt-4 grid gap-4">
          {visiveis.map((d) => (
            <li key={d.id}>
              <Card
                className={
                  d.respondida
                    ? undefined
                    : "border border-[var(--vitrine-a)]/30 bg-[color-mix(in_oklch,var(--vitrine-a)_4%,var(--card))]"
                }
              >
                <CardContent className="flex flex-col gap-4">
                  <div className="flex gap-4">
                    <div
                      className="flex w-12 shrink-0 flex-col items-center gap-0.5 self-start rounded-xl border py-2 text-muted-foreground"
                      title={`${d.votos} ${d.votos === 1 ? "voto" : "votos"}`}
                    >
                      <ThumbsUp className="size-4" aria-hidden />
                      <span className="text-sm font-semibold tabular-nums text-foreground">{d.votos}</span>
                      <span className="sr-only">{d.votos === 1 ? "voto" : "votos"}</span>
                    </div>
                    <div className="min-w-0 flex-1">
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
                          <Badge variant="outline">
                            <CircleDot aria-hidden /> Aberta
                          </Badge>
                        )}
                      </div>
                      <p className="wrap-break-word whitespace-pre-wrap">{d.conteudo}</p>
                      <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <AvatarUsuario nome={d.autor} className="size-5 text-[10px]" />
                        {d.autor} · {formatarData.format(d.criadaEm)}
                      </p>
                    </div>
                  </div>

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

                  <div className="flex flex-wrap gap-2 border-t pt-4">
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
        caminho="/admin/duvidas"
        parametros={{ filtro: filtro === "todas" ? undefined : filtro }}
      />
    </div>
  );
}
