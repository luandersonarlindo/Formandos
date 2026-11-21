import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AcessibilidadeLocal } from "@/components/features/acessibilidade-local";
import { CalendarDays, Clock, Info, MapPin, Navigation, Shirt, TriangleAlert } from "lucide-react";
import { formatarDataHora, formatarDiaCurto, formatarHora } from "@/lib/datas";
import { linkComoChegar } from "@/lib/evento";
import { getEventoPublico } from "@/lib/evento-publico";
import { Button } from "@/components/ui/button";

// Página pública do evento (ADR-0008): para a família, os convidados e os
// fornecedores, sem login. Só o que iria num convite impresso. Fora do
// matcher do proxy.ts, então não pede sessão. Não aparece em busca.

export async function generateMetadata(props: PageProps<"/evento/[token]">): Promise<Metadata> {
  const { token } = await props.params;
  const evento = await getEventoPublico(token);
  return {
    title: evento ? `Formatura ${evento.turma}` : "Evento",
    robots: { index: false, follow: false },
    referrer: "no-referrer",
  };
}

export default async function EventoPublicoPage(props: PageProps<"/evento/[token]">) {
  const { token } = await props.params;
  const e = await getEventoPublico(token);
  if (!e) notFound();
  const comoChegar = linkComoChegar({ linkMapa: e.linkMapa, endereco: e.endereco, local: e.local });

  return (
    <main id="conteudo" tabIndex={-1} className="mx-auto w-full max-w-2xl px-4 py-8 outline-none">
      <p className="text-sm text-muted-foreground">Formatura</p>
      <h1 className="text-3xl font-semibold tracking-tight text-balance">{e.turma}</h1>

      {e.encerrado && (
        <p className="mt-4 rounded-lg border bg-muted/50 px-3 py-2 text-sm">Evento encerrado.</p>
      )}

      {e.ultimaMudanca && !e.encerrado && (
        <div
          role="status"
          className="mt-4 flex gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
          <div>
            <p className="font-medium">Mudou em {formatarDataHora.format(e.ultimaMudanca.quando)}</p>
            <ul className="mt-0.5">
              {e.ultimaMudanca.mudancas.map((m) => (
                <li key={m.rotulo}>
                  {m.rotulo[0].toUpperCase() + m.rotulo.slice(1)}: era <s>{m.antes}</s>, agora é{" "}
                  <strong>{m.depois}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Ordem de quem abre no celular, a caminho da festa: quando, onde e o
          botão do mapa logo abaixo. Ícones em cinza: a página é um convite, não
          uma vitrine (DESIGN.md). Tudo no servidor, sem JS de cliente. */}
      <dl className="mt-6 grid gap-4 text-[15px]">
        <div className="flex gap-3">
          <CalendarDays className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
          <div>
            <dt className="text-xs text-muted-foreground">Quando</dt>
            <dd className="font-medium">
              {e.inicio ? formatarDataHora.format(e.inicio) : "Data a definir"}
              {e.fim && ` até ${formatarHora.format(e.fim)}`}
            </dd>
          </div>
        </div>
        <div className="flex gap-3">
          <MapPin className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
          <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">Onde</dt>
            <dd className="font-medium wrap-break-word">{e.local || "Local a definir"}</dd>
            {e.endereco && <dd className="text-sm text-muted-foreground wrap-break-word">{e.endereco}</dd>}
            {e.entrada && (
              <dd className="text-sm wrap-break-word">
                <span className="text-muted-foreground">Entrada:</span> {e.entrada}
              </dd>
            )}
          </div>
        </div>
      </dl>

      {comoChegar && (
        <Button asChild variant="outline" className="mt-4 w-full sm:w-auto pointer-coarse:min-h-11">
          <a href={comoChegar} target="_blank" rel="noopener noreferrer">
            <Navigation aria-hidden /> Como chegar
            <span className="sr-only">(abre o mapa em outra aba)</span>
          </a>
        </Button>
      )}

      {(e.traje || e.observacoesLocal) && (
        <dl className="mt-6 grid gap-4 text-[15px]">
          {e.traje && (
            <div className="flex gap-3">
              <Shirt className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
              <div>
                <dt className="text-xs text-muted-foreground">Traje</dt>
                <dd className="font-medium">{e.traje}</dd>
              </div>
            </div>
          )}
          {e.observacoesLocal && (
            <div className="flex gap-3">
              <Info className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">Bom saber</dt>
                <dd className="whitespace-pre-wrap wrap-break-word">{e.observacoesLocal}</dd>
              </div>
            </div>
          )}
        </dl>
      )}

      {/* ADR-0024: sempre em texto; sem resposta, "não informada". */}
      <div className="mt-5">
        <AcessibilidadeLocal a={e.acessibilidade} />
      </div>

      {e.descricao && <p className="mt-6 whitespace-pre-wrap text-muted-foreground text-pretty">{e.descricao}</p>}

      {e.programacao.length > 0 && (
        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Clock className="size-5 text-muted-foreground" aria-hidden /> Programação
          </h2>
          <ol className="mt-3 ml-1.5 border-l">
            {e.programacao.map((item) => (
              <li key={item.id} className="relative pb-5 pl-6 last:pb-0">
                <span aria-hidden className="absolute top-1.5 -left-[5px] size-2.5 rounded-full bg-foreground" />
                <p className="text-sm font-semibold">
                  {formatarHora.format(item.horario)}{" "}
                  <span className="font-normal text-muted-foreground">· {formatarDiaCurto.format(item.horario)}</span>
                </p>
                <p className="font-medium">{item.titulo}</p>
                {item.descricao && <p className="text-sm text-muted-foreground">{item.descricao}</p>}
              </li>
            ))}
          </ol>
          <p className="mt-2 text-xs text-muted-foreground">Horários de Brasília.</p>
        </section>
      )}

      <p className="mt-10 border-t pt-4 text-xs text-muted-foreground">
        {e.atualizadoEm ? `Atualizado em ${formatarDataHora.format(e.atualizadoEm)}. ` : ""}
        Página da comissão de formatura, feita no Formandos.
      </p>
    </main>
  );
}
