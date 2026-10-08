import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  CalendarClock,
  Link2,
  MapPin,
  Plus,
  Settings2,
  Shirt,
  Trash2,
  Users,
} from "lucide-react";
import { adicionarItemProgramacao, atualizarItemProgramacao, removerItemProgramacao, salvarEvento } from "@/actions/evento";
import { ConfirmarExclusao } from "@/components/features/confirmar-exclusao";
import { FormDialog } from "@/components/features/form-dialog";
import { FormAcao } from "@/components/features/form-acao";
import { PainelRecolhivel } from "@/components/features/painel-recolhivel";
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
import { formatarDiaCurto, formatarHora, paraDatetimeLocal } from "@/lib/datas";

export const metadata: Metadata = { title: "Evento" };

export default async function EventoPage() {
  const admin = await exigirAdmin();
  const [evento, programacao] = await Promise.all([
    getEventoAdmin(admin.turmaId),
    listarProgramacao(admin),
  ]);

  const rotulo = "flex items-center gap-1.5";

  return (
    <div className="mx-auto w-full max-w-4xl 2xl:max-w-6xl">
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
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings2 className="size-4.5 text-[var(--vitrine-a)]" aria-hidden /> Dados do evento
          </CardTitle>
          <CardDescription>
            Nome da turma, descrição, data, local e o que os convidados precisam saber.{" "}
            {evento.nome
              ? `Atual: ${evento.nome}.`
              : "Nada preenchido ainda."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormDialog
            rotulo="Editar dados do evento"
            icone={<Settings2 aria-hidden />}
            titulo="Dados do evento"
            descricao="Aparecem no dashboard de todos os membros, junto com o traje e as observações do local."
            acao={salvarEvento}
            rotuloSubmit="Salvar"
            rotuloPendente="Salvando…"
            dialogClassName="sm:max-w-xl"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nome" className={rotulo}>
                <Users className="size-4 text-[var(--vitrine-a)]" aria-hidden /> Nome da turma
              </Label>
              <Input id="nome" name="nome" defaultValue={evento.nome} maxLength={100} className="h-10" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Textarea
                id="descricao"
                name="descricao"
                defaultValue={evento.descricao}
                maxLength={1000}
                rows={3}
                placeholder="Ex.: A formatura da turma de Sistemas de Informação. Venha comemorar com a gente!"
              />
              <p className="text-xs text-muted-foreground">Aparece no topo do dashboard, para todos os membros.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="dataEvento" className={rotulo}>
                  <CalendarDays className="size-4 text-[var(--vitrine-a)]" aria-hidden /> Início da festa
                </Label>
                <Input id="dataEvento" name="dataEvento" type="datetime-local" defaultValue={evento.dataLocal} className="h-10" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="dataFimEvento" className={rotulo}>
                  <CalendarClock className="size-4 text-[var(--vitrine-a)]" aria-hidden /> Término (opcional)
                </Label>
                <Input id="dataFimEvento" name="dataFimEvento" type="datetime-local" defaultValue={evento.dataFimLocal} className="h-10" />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="localEvento" className={rotulo}>
                  <MapPin className="size-4 text-[var(--vitrine-a)]" aria-hidden /> Nome do local
                </Label>
                <Input id="localEvento" name="localEvento" defaultValue={evento.local} maxLength={255} placeholder="Ex.: Salão Cristal" className="h-10" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="endereco" className={rotulo}>
                  <MapPin className="size-4 text-[var(--vitrine-a)]" aria-hidden /> Endereço (opcional)
                </Label>
                <Input id="endereco" name="endereco" defaultValue={evento.endereco} maxLength={255} placeholder="Rua, número, bairro e cidade" className="h-10" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="linkMapa" className={rotulo}>
                <Link2 className="size-4 text-[var(--vitrine-a)]" aria-hidden /> Link do mapa (opcional)
              </Label>
              <Input id="linkMapa" name="linkMapa" type="url" defaultValue={evento.linkMapa} maxLength={500} placeholder="https://maps.app.goo.gl/…" className="h-10" />
              <p className="text-xs text-muted-foreground">
                Vira o botão “Como chegar”. Sem link, o botão usa o endereço (ou o nome do local) numa busca do Google Maps.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="traje" className={rotulo}>
                  <Shirt className="size-4 text-[var(--vitrine-a)]" aria-hidden /> Traje (opcional)
                </Label>
                <Input id="traje" name="traje" defaultValue={evento.traje} maxLength={100} placeholder="Ex.: Gala / Black tie" className="h-10" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="observacoesLocal">Observações do local (opcional)</Label>
                <Textarea
                  id="observacoesLocal"
                  name="observacoesLocal"
                  defaultValue={evento.observacoesLocal}
                  maxLength={500}
                  rows={2}
                  placeholder="Estacionamento, portaria, acessibilidade…"
                />
              </div>
            </div>
          </FormDialog>
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
                  <div className="flex flex-col gap-2">
                    <FormDialog
                      rotulo="Editar item"
                      icone={<Settings2 className="size-3.5" aria-hidden />}
                      titulo="Editar item da programação"
                      descricao="Horário, título e descrição do item."
                      acao={atualizarItemProgramacao}
                      campos={{ id: item.id }}
                      rotuloSubmit="Salvar"
                      rotuloPendente="Salvando…"
                    >
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="horario">Data e hora</Label>
                        <Input
                          id="horario"
                          name="horario"
                          type="datetime-local"
                          defaultValue={paraDatetimeLocal(item.horario)}
                          className="h-10"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="titulo">Título</Label>
                        <Input
                          id="titulo"
                          name="titulo"
                          defaultValue={item.titulo}
                          maxLength={255}
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="descricao">Descrição (opcional)</Label>
                        <Textarea
                          id="descricao"
                          name="descricao"
                          defaultValue={item.descricao ?? ""}
                          maxLength={500}
                          rows={2}
                        />
                      </div>
                    </FormDialog>
                    <ConfirmarExclusao
                      acao={removerItemProgramacao}
                      campos={{ id: item.id }}
                      alvo="o item"
                      nome={item.titulo}
                      rotulo="Remover"
                      descricao={`Remover ${item.titulo}`}
                      icone={<Trash2 aria-hidden />}
                    />
                  </div>
                </li>
              ))}
            </ol>
          )}

          <PainelRecolhivel abertoInicial={programacao.length === 0} className="group rounded-xl border p-4">
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
                  <Label htmlFor="descricao-item">Descrição (opcional)</Label>
                  <Textarea id="descricao-item" name="descricao" rows={2} maxLength={500} />
                </div>
              </FormAcao>
            </div>
          </PainelRecolhivel>
        </CardContent>
      </Card>
    </div>
  );
}
