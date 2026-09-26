import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ArrowLeft, CircleCheck, Trophy } from "lucide-react";
import { AvatarUsuario } from "@/components/features/avatar-usuario";
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
