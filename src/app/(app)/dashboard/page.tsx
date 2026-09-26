import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  CircleHelp,
  ClipboardCheck,
  MapPin,
  Users,
  Vote,
  type LucideIcon,
} from "lucide-react";
import { ContagemRegressiva } from "@/components/features/contagem-regressiva";
import { FormSairTurma } from "@/components/features/form-sair-turma";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { exigirMembro } from "@/lib/dal";
import { getResumoTurma, listarProgramacao } from "@/lib/dashboard";
import {
  formatarDataHora,
  formatarDiaCurto,
  formatarHora,
} from "@/lib/datas";

export const metadata: Metadata = { title: "Dashboard" };

function Indicador({
  titulo,
  valor,
  total,
  href,
  rotulo,
  icone: Icone,
}: {
  titulo: string;
  valor: number;
  total?: number;
  href: string;
  rotulo?: string;
  icone: LucideIcon;
}) {
  return (
    <Link href={href} className="block">
      <Card className="vitrine-cartao h-full">
        <CardHeader>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="flex size-7 items-center justify-center rounded-md border bg-muted/50 text-[var(--vitrine-a)]">
              <Icone className="size-4" aria-hidden />
            </span>
            <CardDescription>{titulo}</CardDescription>
          </div>
          <CardTitle className="mt-1 text-3xl tabular-nums">
            <span data-contar={valor}>{valor}</span>
            {total !== undefined && (
              <span className="ml-1.5 text-base font-normal text-muted-foreground">de {total}</span>
            )}
          </CardTitle>
          {total !== undefined && (
            <Progress
              className="mt-2"
              value={total === 0 ? 0 : (valor / total) * 100}
              aria-label={rotulo}
            />
          )}
        </CardHeader>
      </Card>
    </Link>
  );
}

export default async function DashboardPage() {
  const membro = await exigirMembro();
  const [programacao, resumo] = await Promise.all([
    listarProgramacao(membro),
    getResumoTurma(membro),
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl 2xl:max-w-6xl">
      <section className="vitrine-fundo-hero rounded-2xl border bg-card p-5 md:p-7">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {membro.turmaNome}
          </h1>
          <Badge variant={membro.papel === "admin" ? "default" : "secondary"}>
            {membro.papel === "admin" ? "Administrador" : "Participante"}
          </Badge>
        </div>
        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="size-4" aria-hidden />
          <span data-contar={resumo.membros}>{resumo.membros}</span>{" "}
          {resumo.membros === 1 ? "membro na turma" : "membros na turma"}
        </p>

        <div className="mt-6">
          <p className="mb-2 text-sm font-medium text-muted-foreground">Contagem regressiva</p>
          {membro.dataEvento ? (
            <ContagemRegressiva dataIso={membro.dataEvento.toISOString()} />
          ) : (
            <p className="rounded-xl border border-dashed bg-background/60 p-4 text-sm text-muted-foreground">
              A data do evento ainda não foi definida pelo administrador.
            </p>
          )}
        </div>

        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-xl border bg-background/80 p-3">
            <CalendarDays className="mt-0.5 size-5 shrink-0 text-[var(--vitrine-a)]" aria-hidden />
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">Data do evento</dt>
              <dd className="text-sm font-medium">
                {membro.dataEvento
                  ? formatarDataHora.format(membro.dataEvento)
                  : "Não definida"}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border bg-background/80 p-3">
            <MapPin className="mt-0.5 size-5 shrink-0 text-[var(--vitrine-a)]" aria-hidden />
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">Local</dt>
              <dd className="text-sm font-medium wrap-break-word">
                {membro.localEvento ?? "Não definido"}
              </dd>
            </div>
          </div>
        </dl>
      </section>

      <div data-grupo className="mt-4 grid gap-4 md:grid-cols-3">
        <Indicador
          titulo="Tarefas concluídas"
          valor={resumo.tarefasConcluidas}
          total={resumo.tarefasTotal}
          href="/tarefas"
          rotulo="Progresso das tarefas"
          icone={ClipboardCheck}
        />
        <Indicador
          titulo="Enquetes respondidas por você"
          valor={resumo.enquetesRespondidas}
          total={resumo.enquetesTotal}
          href="/votacoes"
          rotulo="Seu progresso nas votações"
          icone={Vote}
        />
        <Indicador
          titulo="Dúvidas sem resposta"
          valor={resumo.duvidasAbertas}
          href="/duvidas"
          icone={CircleHelp}
        />
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">Programação da festa</CardTitle>
          <CardDescription>
            {programacao.length === 0
              ? "A programação ainda não foi divulgada pelo administrador."
              : "Horários no fuso de Brasília."}
          </CardDescription>
        </CardHeader>
        {programacao.length > 0 && (
          <CardContent>
            <ol className="mt-1 ml-1.5 border-l">
              {programacao.map((item) => (
                <li key={item.id} className="relative pb-6 pl-6 last:pb-0">
                  <span
                    aria-hidden
                    className="absolute top-1.5 -left-[5px] size-2.5 rounded-full bg-[var(--vitrine-a)] ring-4 ring-card"
                  />
                  <p className="text-sm font-semibold text-[var(--vitrine-a)]">
                    {formatarHora.format(item.horario)}{" "}
                    <span className="font-normal text-muted-foreground">
                      · {formatarDiaCurto.format(item.horario)}
                    </span>
                  </p>
                  <p className="mt-0.5 font-medium">{item.titulo}</p>
                  {item.descricao && (
                    <p className="mt-0.5 wrap-break-word text-sm text-muted-foreground">
                      {item.descricao}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </CardContent>
        )}
      </Card>

      <Card className="mt-4 border-dashed bg-transparent ring-0 border">
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-medium">Sua participação</p>
            <p className="text-sm text-muted-foreground">
              Se você for o único membro, a turma será apagada ao sair.
            </p>
          </div>
          <FormSairTurma />
        </CardContent>
      </Card>
    </div>
  );
}
