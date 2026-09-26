import type { Metadata } from "next";
import { BotaoUpvote } from "@/components/features/botao-upvote";
import { FormNovaDuvida } from "@/components/features/form-nova-duvida";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { exigirMembro } from "@/lib/dal";
import { listarDuvidas } from "@/lib/duvidas";

export const metadata: Metadata = { title: "Dúvidas" };

const formatarData = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

export default async function DuvidasPage() {
  const membro = await exigirMembro();
  const duvidas = await listarDuvidas(membro);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Dúvidas</h1>
      <p className="mt-2 text-muted-foreground">
        Envie perguntas sobre o evento e vote nas dúvidas dos colegas. As mais
        votadas aparecem primeiro, e a comissão responde oficialmente.
      </p>

      <Card className="mt-6">
        <CardContent>
          <FormNovaDuvida />
        </CardContent>
      </Card>

      <h2 className="mt-8 text-lg font-semibold">
        {duvidas.length === 0
          ? "Nenhuma dúvida ainda"
          : `${duvidas.length} ${duvidas.length === 1 ? "dúvida" : "dúvidas"}`}
      </h2>

      <ul data-grupo className="mt-3 grid gap-3">
        {duvidas.map((d) => (
          <li key={d.id}>
            <Card>
              <CardContent className="flex gap-4">
                <BotaoUpvote duvidaId={d.id} votos={d.votos} votei={d.votei} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {d.destaque && <Badge>Em destaque</Badge>}
                    {d.respondida && <Badge variant="secondary">Respondida</Badge>}
                  </div>
                  <p className="mt-1 wrap-break-word whitespace-pre-wrap">
                    {d.conteudo}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {d.autor} · {formatarData.format(d.criadaEm)}
                  </p>
                  {d.resposta && (
                    <div className="mt-3 rounded-lg bg-muted p-3 text-sm">
                      <p className="font-medium">Resposta da comissão</p>
                      <p className="mt-1 wrap-break-word whitespace-pre-wrap">
                        {d.resposta}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
