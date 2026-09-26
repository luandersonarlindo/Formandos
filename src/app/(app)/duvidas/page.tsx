import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck, MessageSquareReply, MessagesSquare, Star } from "lucide-react";
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

const FILTROS = [
  { valor: "todas", rotulo: "Todas" },
  { valor: "abertas", rotulo: "Sem resposta" },
  { valor: "respondidas", rotulo: "Respondidas" },
] as const;

export default async function DuvidasPage({ searchParams }: PageProps<"/duvidas">) {
  const membro = await exigirMembro();
  const { filtro: parametro } = await searchParams;
  const filtro = FILTROS.find((f) => f.valor === parametro)?.valor ?? "todas";
  const duvidas = await listarDuvidas(membro);
  const contagem = (v: string) =>
    v === "todas"
      ? duvidas.length
      : duvidas.filter((d) => d.respondida === (v === "respondidas")).length;
  const visiveis =
    filtro === "todas"
      ? duvidas
      : duvidas.filter((d) => d.respondida === (filtro === "respondidas"));

  return (
    <div className="mx-auto w-full max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Dúvidas</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground text-pretty">
        Envie perguntas sobre o evento e vote nas dúvidas dos colegas. As mais
        votadas aparecem primeiro, e a comissão responde oficialmente.
      </p>

      <Card className="mt-6">
        <CardContent>
          <FormNovaDuvida />
        </CardContent>
      </Card>

      <nav
        aria-label="Filtrar dúvidas"
        className="mt-8 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {FILTROS.map((f) => {
          const ativo = f.valor === filtro;
          return (
            <Link
              key={f.valor}
              href={f.valor === "todas" ? "/duvidas" : `/duvidas?filtro=${f.valor}`}
              aria-current={ativo ? "true" : undefined}
              className={
                ativo
                  ? "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--vitrine-a)]/40 bg-[color-mix(in_oklch,var(--vitrine-a)_10%,transparent)] px-3 py-1 text-sm font-medium"
                  : "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              }
            >
              {f.rotulo}
              <span className="text-xs tabular-nums text-muted-foreground">{contagem(f.valor)}</span>
            </Link>
          );
        })}
      </nav>

      {visiveis.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-2 rounded-xl border border-dashed p-10 text-center">
          <MessagesSquare className="size-8 text-muted-foreground" aria-hidden />
          <p className="font-medium">
            {duvidas.length === 0 ? "Nenhuma dúvida ainda" : "Nenhuma dúvida neste filtro"}
          </p>
          <p className="text-sm text-muted-foreground">
            {duvidas.length === 0
              ? "Seja a primeira pessoa a perguntar."
              : "Escolha outro filtro para ver as demais."}
          </p>
        </div>
      ) : (
        <ul data-grupo className="mt-4 grid gap-3">
          {visiveis.map((d) => (
            <li key={d.id}>
              <Card
                className={
                  d.destaque
                    ? "border border-[var(--vitrine-a)]/30 bg-[color-mix(in_oklch,var(--vitrine-a)_4%,var(--card))]"
                    : undefined
                }
              >
                <CardContent className="flex gap-4">
                  <BotaoUpvote duvidaId={d.id} votos={d.votos} votei={d.votei} />
                  <div className="min-w-0 flex-1">
                    {(d.destaque || d.respondida) && (
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        {d.destaque && (
                          <Badge>
                            <Star aria-hidden /> Em destaque
                          </Badge>
                        )}
                        {d.respondida && (
                          <Badge variant="secondary" className="text-emerald-700 dark:text-emerald-400">
                            <CircleCheck aria-hidden /> Respondida
                          </Badge>
                        )}
                      </div>
                    )}
                    <p className="wrap-break-word whitespace-pre-wrap">{d.conteudo}</p>
                    <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <span
                        aria-hidden
                        className="flex size-5 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--vitrine-a),var(--vitrine-b))] text-[10px] font-semibold text-white"
                      >
                        {(d.autor.trim()[0] ?? "?").toUpperCase()}
                      </span>
                      {d.autor} · {formatarData.format(d.criadaEm)}
                    </p>
                    {d.resposta && (
                      <div className="mt-3 rounded-lg border-l-2 border-[var(--vitrine-a)] bg-muted/60 p-3 text-sm">
                        <p className="flex items-center gap-1.5 font-medium">
                          <MessageSquareReply className="size-4 text-[var(--vitrine-a)]" aria-hidden />
                          Resposta da comissão
                        </p>
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
      )}
    </div>
  );
}
