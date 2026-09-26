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

export default async function EventoPage() {
  const admin = await exigirAdmin();
  const [evento, programacao] = await Promise.all([
    getEventoAdmin(admin.turmaId),
    listarProgramacao(admin),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Evento</h1>
      <p className="mt-2 text-muted-foreground">
        Estes dados aparecem no dashboard de todos os membros. Os horários são
        os de Brasília.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Dados do evento</CardTitle>
        </CardHeader>
        <CardContent>
          <FormAcao acao={salvarEvento} rotulo="Salvar">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nome">Nome da turma</Label>
              <Input id="nome" name="nome" defaultValue={evento.nome} maxLength={100} required />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="dataEvento">Data e hora da festa</Label>
                <Input id="dataEvento" name="dataEvento" type="datetime-local" defaultValue={evento.dataLocal} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="localEvento">Local</Label>
                <Input id="localEvento" name="localEvento" defaultValue={evento.local} maxLength={255} />
              </div>
            </div>
          </FormAcao>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Programação da festa</CardTitle>
          <CardDescription>
            {programacao.length === 0
              ? "Nenhum item ainda."
              : `${programacao.length} ${programacao.length === 1 ? "item" : "itens"}, em ordem de horário.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {programacao.length > 0 && (
            <ol className="divide-y rounded-lg border">
              {programacao.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <div className="w-28 shrink-0 text-sm">
                    <p className="font-medium">{formatarHora.format(item.horario)}</p>
                    <p className="text-muted-foreground">{formatarDiaCurto.format(item.horario)}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.titulo}</p>
                    {item.descricao && (
                      <p className="wrap-break-word text-sm text-muted-foreground">{item.descricao}</p>
                    )}
                  </div>
                  <form action={removerItemProgramacao}>
                    <input type="hidden" name="id" value={item.id} />
                    <Button type="submit" variant="destructive" size="sm">
                      Remover
                    </Button>
                  </form>
                </li>
              ))}
            </ol>
          )}

          <div>
            <h3 className="mb-3 text-sm font-medium">Adicionar item</h3>
            <FormAcao acao={adicionarItemProgramacao} rotulo="Adicionar" rotuloPendente="Adicionando…">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="horario">Data e hora</Label>
                  <Input id="horario" name="horario" type="datetime-local" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="titulo">Título</Label>
                  <Input id="titulo" name="titulo" maxLength={255} placeholder="Ex.: Entrada da turma" required />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="descricao">Descrição (opcional)</Label>
                <Textarea id="descricao" name="descricao" rows={2} maxLength={500} />
              </div>
            </FormAcao>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
