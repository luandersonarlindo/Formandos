import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, MapPin, Plus, Trash2, Users } from "lucide-react";
import {
  adicionarItemProgramacao,
  removerItemProgramacao,
  salvarEvento,
} from "@/actions/evento";
import { FormAcao } from "@/components/features/form-acao";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getEventoAdmin } from "@/lib/admin";
import { exigirAdmin } from "@/lib/dal";
import { listarProgramacao } from "@/lib/dashboard";
import { formatarDiaCurto, formatarHora } from "@/lib/datas";

export const metadata: Metadata = { title: "Evento" };

export default async function EventoPage() {
  const admin = await exigirAdmin();
  const [evento, programacao] = await Promise.all([
    getEventoAdmin(admin.turmaId),
    listarProgramacao(admin),
  ]);

  const rotulo = "flex items-center gap-1.5";

  return (
    <div className="mx-auto w-full max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Evento</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground text-pretty">
        Estes dados aparecem no dashboard de todos os membros. Os horários são
        os de Brasília.{" "}
        <Link href="/dashboard" className="whitespace-nowrap underline underline-offset-4 hover:text-foreground">
          Ver como aparece
        </Link>
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Dados do evento</CardTitle>
          <CardDescription>Nome da turma, data da festa e local.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormAcao acao={salvarEvento} rotulo="Salvar">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nome" className={rotulo}>
                <Users className="size-4 text-[var(--vitrine-a)]" aria-hidden /> Nome da turma
              </Label>
              <Input id="nome" name="nome" defaultValue={evento.nome} maxLength={100} className="h-10" required />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="dataEvento" className={rotulo}>
                  <CalendarDays className="size-4 text-[var(--vitrine-a)]" aria-hidden /> Data e hora da festa
                </Label>
                <Input id="dataEvento" name="dataEvento" type="datetime-local" defaultValue={evento.dataLocal} className="h-10" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="localEvento" className={rotulo}>
                  <MapPin className="size-4 text-[var(--vitrine-a)]" aria-hidden /> Local
                </Label>
                <Input id="localEvento" name="localEvento" defaultValue={evento.local} maxLength={255} className="h-10" />
              </div>
            </div>
          </FormAcao>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">Programação da festa</CardTitle>
          <CardDescription>
            {programacao.length === 0
              ? "Nenhum item ainda."
              : `${programacao.length} ${programacao.length === 1 ? "item" : "itens"}, em ordem de horário.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {programacao.length > 0 && (
            <ol data-grupo className="ml-1.5 border-l">
              {programacao.map((item) => (
                <li key={item.id} className="relative flex flex-wrap items-start gap-3 pb-6 pl-6 last:pb-0">
                  <span
                    aria-hidden
                    className="absolute top-1.5 -left-[5px] size-2.5 rounded-full bg-[var(--vitrine-a)] ring-4 ring-card"
                  />
                  <div className="min-w-0 flex-1 basis-48">
                    <p className="text-sm font-semibold text-[var(--vitrine-a)]">
                      {formatarHora.format(item.horario)}{" "}
                      <span className="font-normal text-muted-foreground">
                        · {formatarDiaCurto.format(item.horario)}
                      </span>
                    </p>
                    <p className="mt-0.5 font-medium">{item.titulo}</p>
                    {item.descricao && (
                      <p className="wrap-break-word text-sm text-muted-foreground">{item.descricao}</p>
                    )}
                  </div>
                  <form action={removerItemProgramacao}>
                    <input type="hidden" name="id" value={item.id} />
                    <Button type="submit" variant="destructive" size="sm">
                      <Trash2 aria-hidden /> Remover
                    </Button>
                  </form>
                </li>
              ))}
            </ol>
          )}

          <details open={programacao.length === 0} className="group rounded-xl border p-4">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium [&::-webkit-details-marker]:hidden">
              <span className="flex size-7 items-center justify-center rounded-md border bg-muted/50 text-[var(--vitrine-a)]">
                <Plus className="size-4 transition-transform group-open:rotate-45" aria-hidden />
              </span>
              Adicionar item
            </summary>
            <div className="mt-4">
              <FormAcao acao={adicionarItemProgramacao} rotulo="Adicionar" rotuloPendente="Adicionando…">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="horario">Data e hora</Label>
                    <Input id="horario" name="horario" type="datetime-local" className="h-10" required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="titulo">Título</Label>
                    <Input id="titulo" name="titulo" maxLength={255} placeholder="Ex.: Entrada da turma" className="h-10" required />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="descricao">Descrição (opcional)</Label>
                  <Textarea id="descricao" name="descricao" rows={2} maxLength={500} />
                </div>
              </FormAcao>
            </div>
          </details>
        </CardContent>
      </Card>
    </div>
  );
}
