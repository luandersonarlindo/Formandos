import type { Metadata } from "next";
import { CalendarDays, CircleCheck, Settings2, Trash2, UserRound } from "lucide-react";
import { atualizarStatusTarefa, atualizarTarefa, excluirTarefa } from "@/actions/tarefas";
import { CabecalhoPagina } from "@/components/features/cabecalho-pagina";
import { EstadoVazio } from "@/components/features/estado-vazio";
import { FiltrosPilula } from "@/components/features/filtros-pilula";
import { FormDialog } from "@/components/features/form-dialog";
import { FormNovaTarefa } from "@/components/features/form-nova-tarefa";
import { AcaoDialogo, AcaoExcluir, AcaoSeparador, MenuAcoes } from "@/components/features/menu-acoes";
import { Paginacao } from "@/components/features/paginacao";
import { ChecklistAmico } from "@/components/ilustracoes/checklist-amico";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { exigirMembro } from "@/lib/dal";
import { formatarPrazo, hojeIso } from "@/lib/datas";
import { lerPagina } from "@/lib/paginacao";
import { listarMembros, listarTarefas, ROTULO_STATUS, STATUS_TAREFA, type StatusTarefa } from "@/lib/tarefas";

export const metadata: Metadata = { title: "Tarefas" };

// Um sinal só por estado: o Badge. Antes eram faixa colorida, ícone e badge
// dizendo a mesma coisa.
const VARIANTE_STATUS: Record<StatusTarefa, "outline" | "secondary"> = {
  pendente: "outline",
  em_andamento: "secondary",
  concluida: "outline",
};

function OpcoesStatus() {
  return STATUS_TAREFA.map((s) => (
    <option key={s} value={s}>
      {ROTULO_STATUS[s]}
    </option>
  ));
}

// O que falta para a festa. Todo mundo vê a mesma lista; quem é responsável
// por uma tarefa atualiza o andamento dela, e o admin cria pelo cabeçalho e
// edita ou exclui pelo "⋯" de cada linha.
export default async function TarefasPage({ searchParams }: PageProps<"/tarefas">) {
  const membro = await exigirMembro();
  const { status, pagina: paginaParametro } = await searchParams;
  const filtro = STATUS_TAREFA.find((s) => s === status) ?? "todas";
  const ehAdmin = membro.papel === "admin";
  const [{ itens: visiveis, pagina, totalPaginas, totais }, membros] = await Promise.all([
    listarTarefas(membro, {
      status: filtro === "todas" ? undefined : filtro,
      pagina: lerPagina(paginaParametro),
    }),
    ehAdmin ? listarMembros(membro) : Promise.resolve([]),
  ]);
  const geral = totais.pendente + totais.em_andamento + totais.concluida;
  const concluidas = totais.concluida;
  const hoje = hojeIso();

  return (
    <div className="mx-auto w-full max-w-3xl">
      <CabecalhoPagina
        titulo="Tarefas"
        descricao={
          ehAdmin
            ? "O que falta para a festa acontecer."
            : "O que falta para a festa acontecer. Se uma tarefa for sua, atualize o andamento dela."
        }
        acao={ehAdmin ? <FormNovaTarefa membros={membros} /> : undefined}
      />

      {geral > 0 && (
        <div className="mt-6 flex items-center gap-3 text-sm">
          <span className="shrink-0 tabular-nums">
            <span data-contar={concluidas} className="font-medium">
              {concluidas}
            </span>{" "}
            de {geral} concluídas
          </span>
          {/* O texto ao lado já diz o número: a barra fica fora da leitura. */}
          <Progress className="h-2 max-w-60" value={(concluidas / geral) * 100} aria-hidden />
        </div>
      )}

      <FiltrosPilula
        className="mt-4"
        rotulo="Filtrar por status"
        filtros={[
          { rotulo: "Todas", href: "/tarefas", ativo: filtro === "todas", contagem: geral },
          ...STATUS_TAREFA.map((s) => ({
            rotulo: ROTULO_STATUS[s],
            href: `/tarefas?status=${s}`,
            ativo: filtro === s,
            contagem: totais[s],
          })),
        ]}
      />

      {visiveis.length === 0 ? (
        <EstadoVazio
          className="mt-4"
          descricao={
            geral === 0
              ? ehAdmin
                ? "Crie a primeira em “Nova tarefa”."
                : "A comissão ainda não cadastrou tarefas."
              : "Escolha outro status para ver as demais."
          }
          ilustracao={<ChecklistAmico />}
          titulo={geral === 0 ? "Nenhuma tarefa ainda" : "Nenhuma tarefa neste filtro"}
        />
      ) : (
        <ul data-grupo className="mt-4 divide-y rounded-xl border">
          {visiveis.map((t) => {
            const atrasada = !!t.prazo && t.status !== "concluida" && t.prazo < hoje;
            const ehResponsavel = t.responsavelId === membro.usuarioId;
            const concluida = t.status === "concluida";
            return (
              <li key={t.id} className="flex items-start gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={
                        concluida
                          ? "font-medium wrap-break-word text-muted-foreground line-through"
                          : "font-medium wrap-break-word"
                      }
                    >
                      {t.titulo}
                    </p>
                    <Badge variant={VARIANTE_STATUS[t.status]} className={concluida ? "text-muted-foreground" : undefined}>
                      {concluida && <CircleCheck aria-hidden />}
                      {ROTULO_STATUS[t.status]}
                    </Badge>
                    {atrasada && <Badge variant="warning">Atrasada</Badge>}
                  </div>
                  {t.descricao && (
                    <p className="mt-1 wrap-break-word whitespace-pre-wrap text-sm text-muted-foreground">{t.descricao}</p>
                  )}
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <UserRound className="size-3.5" aria-hidden />
                      {t.responsavel ?? "Sem responsável"}
                    </span>
                    {t.prazo && (
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="size-3.5" aria-hidden />
                        Prazo: {formatarPrazo(t.prazo)}
                      </span>
                    )}
                  </p>
                  {!ehAdmin && ehResponsavel && (
                    <div className="mt-3">
                      <FormDialog
                        rotulo="Atualizar andamento"
                        icone={<Settings2 aria-hidden />}
                        titulo="Atualizar andamento"
                        descricao={`Andamento da tarefa ${t.titulo}`}
                        acao={atualizarStatusTarefa}
                        campos={{ tarefaId: t.id }}
                        rotuloSubmit="Atualizar"
                        rotuloPendente="Atualizando…"
                      >
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor={`andamento-${t.id}`}>Andamento</Label>
                          <NativeSelect id={`andamento-${t.id}`} name="status" defaultValue={t.status}>
                            <OpcoesStatus />
                          </NativeSelect>
                        </div>
                      </FormDialog>
                    </div>
                  )}
                </div>
                {ehAdmin && (
                  <MenuAcoes nome={t.titulo} className="-mt-1 -mr-1">
                    <AcaoDialogo
                      rotulo="Editar tarefa"
                      icone={<Settings2 aria-hidden />}
                      titulo="Editar tarefa"
                      descricao="Título, descrição, status, responsável e prazo."
                      acao={atualizarTarefa}
                      campos={{ tarefaId: t.id }}
                    >
                      <div className="grid gap-3 sm:grid-cols-2 [&>*]:min-w-0">
                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                          <Label htmlFor={`titulo-${t.id}`}>Título</Label>
                          <Input id={`titulo-${t.id}`} name="titulo" defaultValue={t.titulo} maxLength={255} required />
                        </div>
                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                          <Label htmlFor={`descricao-${t.id}`}>Descrição (opcional)</Label>
                          <Textarea
                            id={`descricao-${t.id}`}
                            name="descricao"
                            defaultValue={t.descricao ?? ""}
                            rows={2}
                            maxLength={1000}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor={`status-${t.id}`}>Status</Label>
                          <NativeSelect id={`status-${t.id}`} name="status" defaultValue={t.status}>
                            <OpcoesStatus />
                          </NativeSelect>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor={`responsavel-${t.id}`}>Responsável</Label>
                          <NativeSelect
                            id={`responsavel-${t.id}`}
                            name="responsavelId"
                            defaultValue={t.responsavelId ?? ""}
                          >
                            <option value="">Ninguém</option>
                            {membros.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.nome}
                              </option>
                            ))}
                          </NativeSelect>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor={`prazo-${t.id}`}>Prazo</Label>
                          <Input id={`prazo-${t.id}`} name="prazo" type="date" defaultValue={t.prazo ?? ""} />
                        </div>
                      </div>
                    </AcaoDialogo>
                    <AcaoSeparador />
                    <AcaoExcluir
                      acao={excluirTarefa}
                      campos={{ tarefaId: t.id }}
                      alvo="a tarefa"
                      nome={t.titulo}
                      rotulo="Excluir tarefa"
                      descricao={`Excluir a tarefa ${t.titulo}`}
                      icone={<Trash2 aria-hidden />}
                      sucesso="Tarefa excluída."
                    />
                  </MenuAcoes>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <Paginacao
        pagina={pagina}
        totalPaginas={totalPaginas}
        caminho="/tarefas"
        parametros={{ status: filtro === "todas" ? undefined : filtro }}
      />
    </div>
  );
}
