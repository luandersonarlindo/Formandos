import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getVotosEnquete, type Votante } from "@/lib/admin";
import { exigirAdmin } from "@/lib/dal";

function Pessoa({ v }: { v: Votante }) {
  return (
    <li className="flex items-center gap-2">
      {v.imagem ? (
        <img src={v.imagem} alt="" referrerPolicy="no-referrer" className="size-6 rounded-full" />
      ) : (
        <span aria-hidden className="size-6 rounded-full bg-muted" />
      )}
      <span className="text-sm">{v.nome}</span>
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

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Link
        href={`/admin/votacoes/${dados.catalogoId}`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Voltar ao catálogo
      </Link>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">{dados.titulo}</h1>
      <p className="mt-2 text-muted-foreground">
        {dados.tipo === "unica" ? "Escolha única" : "Escolha múltipla"}. Só os
        administradores da turma veem quem votou em cada opção.
      </p>

      <div className="mt-6 grid gap-4">
        {dados.opcoes.map((o) => (
          <Card key={o.id}>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>{o.texto}</CardTitle>
                <Badge variant="secondary">
                  {o.votantes.length} {o.votantes.length === 1 ? "voto" : "votos"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {o.votantes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Ninguém votou nesta opção.</p>
              ) : (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {o.votantes.map((v) => (
                    <Pessoa key={v.id} v={v} />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>Ainda não votaram</CardTitle>
              <Badge variant="outline">{dados.naoVotaram.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {dados.naoVotaram.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todos os membros já votaram.</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
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
