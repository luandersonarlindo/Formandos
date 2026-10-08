import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  CircleCheck,
  CircleDashed,
  Clock,
  Plus,
  Settings2,
  TriangleAlert,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import {
  atualizarStatusTarefa,
  atualizarTarefa,
  excluirTarefa,
} from "@/actions/tarefas";
import { ConfirmarExclusao } from "@/components/features/confirmar-exclusao";
import { EstadoVazio } from "@/components/features/estado-vazio";
import { FormDialog } from "@/components/features/form-dialog";
import { FormNovaTarefa } from "@/components/features/form-nova-tarefa";
import { PainelRecolhivel } from "@/components/features/painel-recolhivel";
import { ChecklistAmico } from "@/components/ilustracoes/checklist-amico";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Progress } from "@/components/ui/progress";
import { exigirMembro } from "@/lib/dal";
import { formatarPrazo, hojeIso } from "@/lib/datas";
import {
  listarMembros,
  listarTarefas,
  ROTULO_STATUS,
  STATUS_TAREFA,
  type StatusTarefa,
} from "@/lib/tarefas";

export const metadata: Metadata = { title: "Tarefas" };

const ESTILO_STATUS: Record<
  StatusTarefa,
  { icone: LucideIcon; faixa: string; badge: string }
> = {
  pendente: {
    icone: CircleDashed,
    faixa: "before:bg-border",
    badge: "",
  },
  em_andamento: {
    icone: Clock,
    faixa: "before:bg-[var(--vitrine-a)]",
    badge: "border-[var(--vitrine-a)]/40 text-[var(--vitrine-a)]",
  },
  concluida: {
    icone: CircleCheck,
    faixa: "before:bg-emerald-500",
    badge: "border-emerald-500/40 text-emerald-700 dark:text-emerald-400",
  },
};

const FILTROS = [
  { valor: "todas", rotulo: "Todas" },
  ...STATUS_TAREFA.map((s) => ({ valor: s, rotulo: ROTULO_STATUS[s] })),
] as const;

function OpcoesStatus() {
  return STATUS_TAREFA.map((s) => (
    <option key={s} value={s}>
      {ROTULO_STATUS[s]}
    </option>
  ));
}

const resumoAberto =
  "flex cursor-pointer list-none items-center gap-2 text-sm font-medium [&::-webkit-details-marker]:hidden";

export default async function TarefasPage({ searchParams }: PageProps<"/tarefas">) {
  const membro = await exigirMembro();
  const { status } = await searchParams;
  const filtro = STATUS_TAREFA.find((s) => s === status) ?? "todas";
  const ehAdmin = membro.papel === "admin";
  const [tarefas, membros] = await Promise.all([
    listarTarefas(membro),
    ehAdmin ? listarMembros(membro) : Promise.resolve([]),
  ]);
  const concluidas = tarefas.filter((t) => t.status === "concluida").length;
  const percentual = tarefas.length === 0 ? 0 : Math.round((concluidas / tarefas.length) * 100);
  const contagem = (v: string) =>
    v === "todas" ? tarefas.length : tarefas.filter((t) => t.status === v).length;
  const visiveis = filtro === "todas" ? tarefas : tarefas.filter((t) => t.status === filtro);
  const hoje = hojeIso();

  return (
    <div className="mx-auto w-full max-w-4xl 2xl:max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Tarefas</h1>
      <p className="mt-2 text-muted-foreground">
        Acompanhe o que falta para a festa acontecer.
        {!ehAdmin &&
          " Se uma tarefa for sua, você pode atualizar o andamento dela."}
      </p>

      <Card className="vitrine-fundo-hero mt-6">
        <CardHeader>
          <CardDescription>Progresso geral</CardDescription>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <CardTitle className="text-3xl tabular-nums">
              <span data-contar={concluidas}>{concluidas}</span>{" "}
              <span className="text-base font-normal text-muted-foreground">
                de {tarefas.length} concluídas
              </span>
            </CardTitle>
            <span className="vitrine-texto-gradiente text-2xl font-semibold tabular-nums">
              {percentual}%
            </span>
          </div>
          <Progress
            className="mt-2 h-2"
            value={percentual}
            aria-label="Progresso das tarefas"
          />
        </CardHeader>
      </Card>

      {ehAdmin && (
        <Card className="mt-4">
          <CardContent>
            <PainelRecolhivel abertoInicial={tarefas.length === 0} className="group">
              <summary className={resumoAberto}>
                <span className="flex size-7 items-center justify-center rounded-md border bg-muted/50 text-[var(--vitrine-a)]">
                  <Plus className="size-4 transition-transform group-open:rotate-45" aria-hidden />
                </span>
                Nova tarefa
              </summary>
              <div className="mt-4">
                <FormNovaTarefa membros={membros} />
              </div>
            </PainelRecolhivel>
          </CardContent>
        </Card>
      )}

      <nav aria-label="Filtrar por status" className="mt-8 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTROS.map((f) => {
          const ativo = f.valor === filtro;
          return (
            <Link
              key={f.valor}
              href={f.valor === "todas" ? "/tarefas" : `/tarefas?status=${f.valor}`}
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
            tarefas.length === 0
              ? ehAdmin
                ? "Crie a primeira tarefa no formulário acima."
                : "O administrador ainda não cadastrou tarefas."
              : "Escolha outro status para ver as demais."
          }
          ilustracao={<ChecklistAmico />}
          titulo={tarefas.length === 0 ? "Nenhuma tarefa ainda" : "Nenhuma tarefa neste filtro"}
        />
      ) : (
        <ul data-grupo className="mt-4 grid gap-3">
          {visiveis.map((t) => {
            const atrasada = !!t.prazo && t.status !== "concluida" && t.prazo < hoje;
            const ehResponsavel = t.responsavelId === membro.usuarioId;
            const estilo = ESTILO_STATUS[t.status];
            const Icone = estilo.icone;
            return (
              <li key={t.id}>
                <Card className={`relative before:absolute before:inset-y-0 before:left-0 before:w-1 ${estilo.faixa}`}>
                  <CardContent className="flex flex-col gap-3 pl-5">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={estilo.badge}>
                          <Icone aria-hidden /> {ROTULO_STATUS[t.status]}
                        </Badge>
                        {atrasada && (
                          <Badge variant="destructive">
                            <TriangleAlert aria-hidden /> Atrasada
                          </Badge>
                        )}
                      </div>
                      <p
                        className={
                          t.status === "concluida"
                            ? "mt-2 font-medium text-muted-foreground line-through"
                            : "mt-2 font-medium"
                        }
                      >
                        {t.titulo}
                      </p>
                      {t.descricao && (
                        <p className="mt-1 wrap-break-word whitespace-pre-wrap text-sm text-muted-foreground">
                          {t.descricao}
                        </p>
                      )}
                      <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
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
                    </div>

                    {ehAdmin ? (
                      <div className="flex flex-wrap gap-2 border-t pt-3">
                        <FormDialog
                          rotulo="Gerenciar tarefa"
                          icone={<Settings2 className="size-4" aria-hidden />}
                          titulo="Editar tarefa"
                          descricao="Título, descrição, status, responsável e prazo."
                          acao={atualizarTarefa}
                          campos={{ tarefaId: t.id }}
                          rotuloSubmit="Salvar"
                          rotuloPendente="Salvando…"
                        >
                          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                            Título
                            <Input
                              name="titulo"
                              defaultValue={t.titulo}
                              maxLength={255}
                              required
                            />
                          </label>
                          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                            Descrição
                            <Input
                              name="descricao"
                              defaultValue={t.descricao ?? ""}
                              maxLength={1000}
                            />
                          </label>
                          <div className="flex flex-wrap items-end gap-2">
                            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                              Status
                              <NativeSelect
                                name="status"
                                defaultValue={t.status}
                                className="w-40"
                              >
                                <OpcoesStatus />
                              </NativeSelect>
                            </label>
                            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                              Responsável
                              <NativeSelect
                                name="responsavelId"
                                defaultValue={t.responsavelId ?? ""}
                                className="w-44"
                              >
                                <option value="">Ninguém</option>
                                {membros.map((m) => (
                                  <option key={m.id} value={m.id}>
                                    {m.nome}
                                  </option>
                                ))}
                              </NativeSelect>
                            </label>
                            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                              Prazo
                              <Input
                                name="prazo"
                                type="date"
                                defaultValue={t.prazo ?? ""}
                                className="w-40"
                              />
                            </label>
                          </div>
                        </FormDialog>
                        <ConfirmarExclusao
                          acao={excluirTarefa}
                          campos={{ tarefaId: t.id }}
                          alvo="a tarefa"
                          nome={t.titulo}
                          rotulo="Excluir tarefa"
                          descricao={`Excluir a tarefa ${t.titulo}`}
                        />
                      </div>
                    ) : (
                      ehResponsavel && (
                        <FormDialog
                          rotulo="Atualizar andamento"
                          icone={<Settings2 className="size-4" aria-hidden />}
                          titulo="Atualizar andamento"
                          descricao={`Andamento da tarefa ${t.titulo}`}
                          acao={atualizarStatusTarefa}
                          campos={{ tarefaId: t.id }}
                          rotuloSubmit="Atualizar"
                          rotuloPendente="Atualizando…"
                        >
                          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                            Andamento
                            <NativeSelect
                              name="status"
                              defaultValue={t.status}
                              className="w-40"
                            >
                              <OpcoesStatus />
                            </NativeSelect>
                          </label>
                        </FormDialog>
                      )
                    )}
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
