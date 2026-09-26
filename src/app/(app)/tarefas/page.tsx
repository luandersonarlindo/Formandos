import type { Metadata } from "next";
import {
  atualizarStatusTarefa,
  atualizarTarefa,
  excluirTarefa,
} from "@/actions/tarefas";
import { FormNovaTarefa } from "@/components/features/form-nova-tarefa";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
} from "@/lib/tarefas";

export const metadata: Metadata = { title: "Tarefas" };

function OpcoesStatus() {
  return STATUS_TAREFA.map((s) => (
    <option key={s} value={s}>
      {ROTULO_STATUS[s]}
    </option>
  ));
}

export default async function TarefasPage() {
  const membro = await exigirMembro();
  const ehAdmin = membro.papel === "admin";
  const [tarefas, membros] = await Promise.all([
    listarTarefas(membro),
    ehAdmin ? listarMembros(membro) : Promise.resolve([]),
  ]);
  const concluidas = tarefas.filter((t) => t.status === "concluida").length;
  const hoje = hojeIso();

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Tarefas</h1>
      <p className="mt-2 text-muted-foreground">
        Acompanhe o que falta para a festa acontecer.
        {!ehAdmin &&
          " Se uma tarefa for sua, você pode atualizar o andamento dela."}
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardDescription>Progresso geral</CardDescription>
          <CardTitle className="text-2xl">
            {concluidas}{" "}
            <span className="text-base font-normal text-muted-foreground">
              de {tarefas.length} concluídas
            </span>
          </CardTitle>
          <Progress
            className="mt-2"
            value={tarefas.length === 0 ? 0 : (concluidas / tarefas.length) * 100}
            aria-label="Progresso das tarefas"
          />
        </CardHeader>
      </Card>

      {ehAdmin && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Nova tarefa</CardTitle>
          </CardHeader>
          <CardContent>
            <FormNovaTarefa membros={membros} />
          </CardContent>
        </Card>
      )}

      <h2 className="mt-8 text-lg font-semibold">
        {tarefas.length === 0 ? "Nenhuma tarefa ainda" : "Lista de tarefas"}
      </h2>

      <ul className="mt-3 grid gap-3">
        {tarefas.map((t) => {
          const atrasada = !!t.prazo && t.status !== "concluida" && t.prazo < hoje;
          const ehResponsavel = t.responsavelId === membro.usuarioId;
          return (
            <li key={t.id}>
              <Card>
                <CardContent className="flex flex-col gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={t.status === "concluida" ? "secondary" : "outline"}
                      >
                        {ROTULO_STATUS[t.status]}
                      </Badge>
                      {atrasada && <Badge variant="destructive">Atrasada</Badge>}
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
                    <p className="mt-1 text-xs text-muted-foreground">
                      Responsável: {t.responsavel ?? "ninguém ainda"}
                      {t.prazo && ` · Prazo: ${formatarPrazo(t.prazo)}`}
                    </p>
                  </div>

                  {ehAdmin ? (
                    <div className="flex flex-col gap-2 border-t pt-3">
                      <form
                        action={atualizarTarefa}
                        className="flex flex-wrap items-end gap-2"
                      >
                        <input type="hidden" name="tarefaId" value={t.id} />
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
                        <Button type="submit" variant="outline" size="sm">
                          Salvar
                        </Button>
                      </form>
                      <form action={excluirTarefa}>
                        <input type="hidden" name="tarefaId" value={t.id} />
                        <Button type="submit" variant="destructive" size="sm">
                          Excluir tarefa
                        </Button>
                      </form>
                    </div>
                  ) : (
                    ehResponsavel && (
                      <form
                        action={atualizarStatusTarefa}
                        className="flex items-end gap-2 border-t pt-3"
                      >
                        <input type="hidden" name="tarefaId" value={t.id} />
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
                        <Button type="submit" variant="outline" size="sm">
                          Atualizar
                        </Button>
                      </form>
                    )
                  )}
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
