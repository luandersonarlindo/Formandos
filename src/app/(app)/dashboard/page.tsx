import Link from "next/link";
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

function Indicador({
  titulo,
  valor,
  total,
  href,
  rotulo,
}: {
  titulo: string;
  valor: number;
  total: number;
  href: string;
  rotulo: string;
}) {
  return (
    <Link href={href} className="block">
      <Card className="h-full transition-colors hover:bg-muted/50">
        <CardHeader>
          <CardDescription>{titulo}</CardDescription>
          <CardTitle className="text-2xl">
            {valor} <span className="text-base font-normal text-muted-foreground">de {total}</span>
          </CardTitle>
          <Progress
            className="mt-2"
            value={total === 0 ? 0 : (valor / total) * 100}
            aria-label={rotulo}
          />
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
    <div className="mx-auto w-full max-w-3xl">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {membro.turmaNome}
        </h1>
        <Badge variant={membro.papel === "admin" ? "default" : "secondary"}>
          {membro.papel === "admin" ? "Administrador" : "Participante"}
        </Badge>
      </div>
      <p className="mt-2 text-muted-foreground">
        {resumo.membros} {resumo.membros === 1 ? "membro" : "membros"} na turma.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardDescription>Contagem regressiva</CardDescription>
        </CardHeader>
        <CardContent>
          {membro.dataEvento ? (
            <ContagemRegressiva dataIso={membro.dataEvento.toISOString()} />
          ) : (
            <p className="text-muted-foreground">
              A data do evento ainda não foi definida pelo administrador.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription>Data do evento</CardDescription>
            <CardTitle>
              {membro.dataEvento
                ? formatarDataHora.format(membro.dataEvento)
                : "Não definida"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Local</CardDescription>
            <CardTitle>{membro.localEvento ?? "Não definido"}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Indicador
          titulo="Tarefas concluídas"
          valor={resumo.tarefasConcluidas}
          total={resumo.tarefasTotal}
          href="/tarefas"
          rotulo="Progresso das tarefas"
        />
        <Indicador
          titulo="Enquetes respondidas por você"
          valor={resumo.enquetesRespondidas}
          total={resumo.enquetesTotal}
          href="/votacoes"
          rotulo="Seu progresso nas votações"
        />
        <Link href="/duvidas" className="block">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader>
              <CardDescription>Dúvidas sem resposta</CardDescription>
              <CardTitle className="text-2xl">{resumo.duvidasAbertas}</CardTitle>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Programação da festa</CardTitle>
          <CardDescription>
            {programacao.length === 0
              ? "A programação ainda não foi divulgada pelo administrador."
              : "Horários no fuso de Brasília."}
          </CardDescription>
        </CardHeader>
        {programacao.length > 0 && (
          <CardContent>
            <ol className="divide-y">
              {programacao.map((item) => (
                <li key={item.id} className="flex gap-4 py-3">
                  <div className="w-28 shrink-0 text-sm">
                    <p className="font-medium">
                      {formatarHora.format(item.horario)}
                    </p>
                    <p className="text-muted-foreground">
                      {formatarDiaCurto.format(item.horario)}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium">{item.titulo}</p>
                    {item.descricao && (
                      <p className="mt-0.5 wrap-break-word text-sm text-muted-foreground">
                        {item.descricao}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        )}
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Sua participação</CardTitle>
          <CardDescription>
            Se você for o único membro, a turma será apagada ao sair.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormSairTurma />
        </CardContent>
      </Card>
    </div>
  );
}
