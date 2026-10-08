import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ArrowLeft, CircleCheck, Gavel, Pencil, Pin, RotateCcw, Trophy } from "lucide-react";
import { fixarDecisao, reabrirVotacao } from "@/actions/decisoes";
import { AvatarUsuario } from "@/components/features/avatar-usuario";
import { FormDialog } from "@/components/features/form-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getVotosEnquete, type Votante } from "@/lib/admin";
import { exigirAdmin } from "@/lib/dal";

function Pessoa({ v }: { v: Votante }) {
  return (
    <li className="flex items-center gap-2 rounded-full border bg-muted/30 py-1 pr-3 pl-1">
      <AvatarUsuario nome={v.nome} imagem={v.imagem} className="size-6 text-[11px]" />
      <span className="truncate text-sm">{v.nome}</span>
    </li>
  );
}

export default async function VotosEnquetePage(
  props: PageProps<"/admin/votacoes/votos/[enqueteId]">,
) {
  const admin = await exigirAdmin();
  const { enqueteId } = await props.params;
  if (!z.uuid().safeParse(enqueteId).success) notFound();
  const dados = await getVotosEnquete(enqueteId, admin.turmaId);
  if (!dados) notFound();

  const votantes = new Set(dados.opcoes.flatMap((o) => o.votantes.map((v) => v.id)));
  const totalMembros = votantes.size + dados.naoVotaram.length;
  const maisVotos = Math.max(0, ...dados.opcoes.map((o) => o.votantes.length));
  const decidida = dados.decisao.length > 0;
  // Sem decisão, já marca a mais votada (ou as empatadas) como sugestão.
  const sugeridas = decidida
    ? dados.decisao
    : dados.opcoes.filter((o) => maisVotos > 0 && o.votantes.length === maisVotos).map((o) => o.id);

  return (
    <div className="mx-auto w-full max-w-4xl 2xl:max-w-6xl">
      <Link
        href={`/admin/votacoes/${dados.catalogoId}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden /> Voltar ao catálogo
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-balance md:text-3xl">{dados.titulo}</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground text-pretty">
        {dados.tipo === "unica" ? "Escolha única" : "Escolha múltipla"}. Só os
        administradores da turma veem quem votou em cada opção.
      </p>

      <Card className="vitrine-fundo-hero mt-6">
        <CardHeader>
          <CardDescription>Participação nesta pergunta</CardDescription>
          <CardTitle className="text-2xl tabular-nums">
            <span data-contar={votantes.size}>{votantes.size}</span>{" "}
            <span className="text-base font-normal text-muted-foreground">
              de {totalMembros} {totalMembros === 1 ? "membro votou" : "membros votaram"}
            </span>
          </CardTitle>
          <Progress
            className="mt-2 h-2"
            value={totalMembros === 0 ? 0 : (votantes.size / totalMembros) * 100}
            aria-label="Participação nesta pergunta"
          />
        </CardHeader>
      </Card>

      <Card className="mt-4 border border-[var(--vitrine-a)]/30">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Gavel className="size-4 text-[var(--vitrine-a)]" aria-hidden /> Decisão da turma
            </CardTitle>
            {decidida && <Badge>Votação encerrada</Badge>}
          </div>
          <CardDescription className="text-pretty">
            {decidida
              ? "Esta escolha aparece no dashboard de todos e ninguém mais consegue votar. Para votar de novo, reabra a votação."
              : "Fixe a opção escolhida pela comissão. Ela vai para o dashboard de todos e a votação desta pergunta é encerrada."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <FormDialog
            rotulo={decidida ? "Trocar decisão" : "Fixar decisão"}
            icone={decidida ? <Pencil aria-hidden /> : <Pin aria-hidden />}
            titulo={decidida ? "Trocar a decisão" : "Fixar decisão"}
            descricao="A opção escolhida vai para o dashboard de todos e a votação desta pergunta é encerrada."
            acao={fixarDecisao}
            campos={{ enqueteId }}
            rotuloSubmit={decidida ? "Trocar decisão" : "Fixar decisão"}
            rotuloPendente="Salvando…"
          >
            <fieldset className="grid gap-2">
              <legend className="sr-only">Opção escolhida</legend>
              {dados.opcoes.map((o) => (
                <label
                  key={o.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted has-checked:border-[var(--vitrine-a)] has-checked:bg-[color-mix(in_oklch,var(--vitrine-a)_8%,transparent)] has-checked:font-medium"
                >
                  <input
                    type={dados.tipo === "unica" ? "radio" : "checkbox"}
                    name="opcaoId"
                    value={o.id}
                    defaultChecked={sugeridas.includes(o.id)}
                    required={dados.tipo === "unica"}
                    className="size-4 accent-[var(--vitrine-a)]"
                  />
                  {o.texto}
                  {!decidida && sugeridas.includes(o.id) && (
                    <span className="ml-auto text-xs text-muted-foreground">Mais votada</span>
                  )}
                </label>
              ))}
            </fieldset>
          </FormDialog>
          {decidida && (
            <FormDialog
              rotulo="Reabrir votação"
              icone={<RotateCcw aria-hidden />}
              titulo="Reabrir votação"
              descricao="Todos voltam a poder votar. As decisões fixadas no dashboard continuam lá até você trocá-las."
              acao={reabrirVotacao}
              campos={{ enqueteId }}
              rotuloSubmit="Reabrir votação"
              rotuloPendente="Salvando…"
            />
          )}
        </CardContent>
      </Card>

      <div data-grupo className="mt-6 grid gap-4">
        {dados.opcoes.map((o) => {
          const lider = maisVotos > 0 && o.votantes.length === maisVotos;
          return (
            <Card key={o.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-base">{o.texto}</CardTitle>
                  <Badge variant="secondary">
                    {o.votantes.length} {o.votantes.length === 1 ? "voto" : "votos"}
                  </Badge>
                  {lider && (
                    <Badge variant="outline" className="text-[var(--vitrine-a)]">
                      <Trophy aria-hidden /> Mais votada
                    </Badge>
                  )}
                </div>
                <Progress
                  className="mt-2"
                  value={votantes.size === 0 ? 0 : (o.votantes.length / votantes.size) * 100}
                  aria-label={`Votos em ${o.texto}`}
                />
              </CardHeader>
              <CardContent>
                {o.votantes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Ninguém votou nesta opção.</p>
                ) : (
                  <ul className="flex flex-wrap gap-2">
                    {o.votantes.map((v) => (
                      <Pessoa key={v.id} v={v} />
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          );
        })}

        <Card className="border border-dashed bg-transparent ring-0">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base">Ainda não votaram</CardTitle>
              <Badge variant="outline">{dados.naoVotaram.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {dados.naoVotaram.length === 0 ? (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CircleCheck className="size-4 text-emerald-600" aria-hidden /> Todos os membros já votaram.
              </p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {dados.naoVotaram.map((v) => (
                  <Pessoa key={v.id} v={v} />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
