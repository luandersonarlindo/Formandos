import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { CircleCheck, MessageSquareReply, Pencil, RotateCcw, Star, StarOff, Trash2 } from "lucide-react";
import { alternarDestaque, alternarRespondida, apagarDuvida, responderDuvida } from "@/actions/admin";
import { editarDuvida, excluirDuvida } from "@/actions/duvidas";
import { BotaoUpvote } from "@/components/features/botao-upvote";
import { CabecalhoPagina } from "@/components/features/cabecalho-pagina";
import { EstadoVazio } from "@/components/features/estado-vazio";
import { FiltrosPilula } from "@/components/features/filtros-pilula";
import { FormDialog } from "@/components/features/form-dialog";
import { FormNovaDuvida } from "@/components/features/form-nova-duvida";
import { AcaoDialogo, AcaoExcluir, AcaoForm, AcaoSeparador, MenuAcoes } from "@/components/features/menu-acoes";
import { Paginacao } from "@/components/features/paginacao";
import { PerguntasAmico } from "@/components/ilustracoes/perguntas-amico";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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

const trecho = (texto: string) => (texto.length > 60 ? `${texto.slice(0, 60).trimEnd()}…` : texto);

// Dúvidas: a caixa de perguntar no topo e a lista logo depois, com as mais
// apoiadas primeiro. O admin vê a mesma tela; "Responder" fica visível (é o
// que ele mais faz) e o resto vai para o "⋯" (D-05). Destacar e marcar como
// respondida são reversíveis, então rodam num clique, com toast (P-10).
export default async function DuvidasPage({ searchParams }: PageProps<"/duvidas">) {
  const membro = await exigirMembro();
  const ehAdmin = membro.papel === "admin";
  const observador = membro.papel === "observador";
  const { filtro: parametro, pagina: paginaParametro } = await searchParams;
  const filtro = FILTROS.find((f) => f.valor === parametro)?.valor ?? "todas";
  const { itens: visiveis, pagina, totalPaginas, contagens } = await listarDuvidas(membro, {
    moderacao: ehAdmin,
    filtro,
    pagina: lerPagina(paginaParametro),
  });

  return (
    <div className="mx-auto w-full max-w-3xl">
      <CabecalhoPagina
        titulo="Dúvidas"
        descricao="Pergunte e apoie as dúvidas dos colegas. As mais apoiadas aparecem primeiro, e a comissão responde."
      />

      {observador ? (
        <p role="status" className="mt-6 rounded-xl border bg-muted/50 p-3 text-sm text-muted-foreground">
          Você acompanha esta turma como observador: vê as dúvidas e as respostas, mas não envia nem apoia.
        </p>
      ) : (
        <div className="mt-6 rounded-xl border p-4">
          <FormNovaDuvida />
        </div>
      )}

      <FiltrosPilula
        className="mt-8"
        rotulo="Filtrar dúvidas"
        filtros={FILTROS.map((f) => ({
          rotulo: f.rotulo,
          href: f.valor === "todas" ? "/duvidas" : `/duvidas?filtro=${f.valor}`,
          ativo: f.valor === filtro,
          contagem: contagens[f.valor],
        }))}
      />

      {visiveis.length === 0 ? (
        <EstadoVazio
          className="mt-4"
          descricao={
            contagens.todas === 0 ? "Seja a primeira pessoa a perguntar." : "Escolha outro filtro para ver as demais."
          }
          ilustracao={<PerguntasAmico />}
          titulo={contagens.todas === 0 ? "Nenhuma dúvida ainda" : "Nenhuma dúvida neste filtro"}
        />
      ) : (
        <ul data-grupo className="mt-4 divide-y rounded-xl border">
          {visiveis.map((d) => {
            const minha = !observador && d.autorId === membro.usuarioId;
            const temMenu = ehAdmin || minha;
            return (
              <li key={d.id} data-duvida={d.id} className={cn("flex gap-4 p-4 first:rounded-t-[calc(var(--radius-xl)-1px)] last:rounded-b-[calc(var(--radius-xl)-1px)]", d.destaque && "bg-destaque-suave")}>
                <BotaoUpvote
                  duvidaId={d.id}
                  duvida={d.conteudo}
                  votos={d.votos}
                  votei={d.votei}
                  somenteLeitura={observador}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      {(d.destaque || d.respondida || ehAdmin) && (
                        <div className="mb-1.5 flex flex-wrap items-center gap-2">
                          {d.destaque && (
                            <Badge>
                              <Star aria-hidden /> Em destaque
                            </Badge>
                          )}
                          {d.respondida ? (
                            <Badge variant="success">
                              <CircleCheck aria-hidden /> Respondida
                            </Badge>
                          ) : (
                            ehAdmin && <Badge variant="outline">Aberta</Badge>
                          )}
                        </div>
                      )}
                      <p className="wrap-break-word whitespace-pre-wrap">{d.conteudo}</p>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {d.autor} · {formatarData.format(d.criadaEm)}
                      </p>
                    </div>
                    {temMenu && (
                      <MenuAcoes nome={trecho(d.conteudo)} className="-mt-1 -mr-1">
                        {minha && (
                          <AcaoDialogo
                            rotulo="Editar dúvida"
                            icone={<Pencil aria-hidden />}
                            titulo="Editar dúvida"
                            descricao="A resposta já dada pela comissão não muda."
                            acao={editarDuvida}
                            campos={{ duvidaId: d.id }}
                          >
                            <Textarea
                              name="conteudo"
                              aria-label="Conteúdo da dúvida"
                              defaultValue={d.conteudo}
                              maxLength={500}
                              rows={3}
                              required
                            />
                          </AcaoDialogo>
                        )}
                        {ehAdmin && (
                          <AcaoForm
                            acao={alternarDestaque}
                            campos={{ duvidaId: d.id, valor: d.destaque ? "nao" : "sim" }}
                            desfazer={{ duvidaId: d.id, valor: d.destaque ? "sim" : "nao" }}
                            icone={d.destaque ? <StarOff aria-hidden /> : <Star aria-hidden />}
                          >
                            {d.destaque ? "Tirar destaque" : "Destacar"}
                          </AcaoForm>
                        )}
                        {ehAdmin && (
                          <AcaoForm
                            acao={alternarRespondida}
                            campos={{ duvidaId: d.id, valor: d.respondida ? "nao" : "sim" }}
                            desfazer={{ duvidaId: d.id, valor: d.respondida ? "sim" : "nao" }}
                            icone={d.respondida ? <RotateCcw aria-hidden /> : <CircleCheck aria-hidden />}
                          >
                            {d.respondida ? "Reabrir" : "Marcar como respondida"}
                          </AcaoForm>
                        )}
                        <AcaoSeparador />
                        {ehAdmin ? (
                          <AcaoExcluir
                            acao={apagarDuvida}
                            campos={{ duvidaId: d.id }}
                            alvo="a dúvida"
                            nome={d.autor}
                            aviso="A dúvida e os votos que ela recebeu somem para todos."
                            rotulo="Apagar"
                            descricao={`Apagar a dúvida de ${d.autor}`}
                            icone={<Trash2 aria-hidden />}
                            sucesso="Dúvida apagada."
                          />
                        ) : (
                          <AcaoExcluir
                            acao={excluirDuvida}
                            campos={{ duvidaId: d.id }}
                            alvo="a dúvida"
                            nome={d.conteudo}
                            aviso="A dúvida e os votos que ela recebeu somem para todos."
                            rotulo="Excluir dúvida"
                            descricao="Excluir dúvida"
                            icone={<Trash2 aria-hidden />}
                            sucesso="Dúvida excluída."
                          />
                        )}
                      </MenuAcoes>
                    )}
                  </div>
                  {d.resposta && (
                    <div className="mt-3 rounded-lg border-l-2 border-primary bg-muted/60 p-3 text-sm">
                      <p className="flex items-center gap-1.5 font-medium">
                        <MessageSquareReply className="size-4" aria-hidden />
                        Resposta da comissão
                      </p>
                      <p className="mt-1 wrap-break-word whitespace-pre-wrap">{d.resposta}</p>
                    </div>
                  )}
                  {ehAdmin && (
                    <div className="mt-3">
                      <FormDialog
                        rotulo={d.resposta ? "Editar resposta" : "Responder"}
                        icone={<MessageSquareReply aria-hidden />}
                        titulo="Resposta oficial"
                        descricao="Deixe em branco para remover a resposta."
                        acao={responderDuvida}
                        campos={{ duvidaId: d.id }}
                        rotuloSubmit="Salvar resposta"
                        rotuloPendente="Salvando…"
                      >
                        <Label htmlFor={`resposta-${d.id}`} className="sr-only">
                          Resposta oficial
                        </Label>
                        <Textarea
                          id={`resposta-${d.id}`}
                          name="resposta"
                          maxLength={1000}
                          rows={4}
                          defaultValue={d.resposta ?? ""}
                          placeholder="Deixe em branco para remover a resposta."
                        />
                      </FormDialog>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
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
