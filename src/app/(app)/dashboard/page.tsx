import { FormSairTurma } from "@/components/features/form-sair-turma";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { exigirMembro } from "@/lib/dal";

const formatarData = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeStyle: "short",
});

export default async function DashboardPage() {
  const membro = await exigirMembro();

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
        Visão geral da turma, contagem regressiva e programação da festa.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Data do evento</CardTitle>
            <CardDescription>
              {membro.dataEvento
                ? formatarData.format(membro.dataEvento)
                : "Ainda não definida pelo administrador."}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Local</CardTitle>
            <CardDescription>
              {membro.localEvento ?? "Ainda não definido pelo administrador."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

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
