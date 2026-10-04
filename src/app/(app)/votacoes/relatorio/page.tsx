import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Trophy, Users, Vote } from "lucide-react";
import { EstadoVazio } from "@/components/features/estado-vazio";
import { GraficoEnquete } from "@/components/features/grafico-enquete";
import { ChecklistAmico } from "@/components/ilustracoes/checklist-amico";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { exigirMembro } from "@/lib/dal";
import { getRelatorio } from "@/lib/relatorio";
import { cn } from "@/lib/utils";
import { listarCatalogos } from "@/lib/votacoes";

export const metadata: Metadata = { title: "Relatório das votações" };

export default async function RelatorioPage(
  props: PageProps<"/votacoes/relatorio">,
) {
  const membro = await exigirMembro();
  const { catalogo: parametro } = await props.searchParams;
  const catalogos = await listarCatalogos(membro);
  const escolhido =
    catalogos.find((c) => c.id === parametro) ?? catalogos[0];
  const relatorio = escolhido
    ? await getRelatorio(escolhido.id, membro)
    : null;

  const enquetes = relatorio?.categorias.flatMap((c) => c.enquetes) ?? [];
  const comVotos = enquetes.filter((e) => e.votantes > 0).length;
  const semRolagem = "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

  return (
    <div className="mx-auto w-full max-w-4xl 2xl:max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
        Relatório das votações
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground text-pretty">
        Preferências da turma em cada enquete, da opção mais votada para a
        menos votada. Só aparecem totais: o relatório não mostra quem votou.
      </p>

      {catalogos.length > 1 && (
        <nav aria-label="Catálogos" className={cn("mt-6 flex gap-2 overflow-x-auto pb-1", semRolagem)}>
          {catalogos.map((c) => (
            <Link
              key={c.id}
              href={`/votacoes/relatorio?catalogo=${c.id}`}
              aria-current={c.id === escolhido?.id ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1 text-sm transition-colors",
                c.id === escolhido?.id
                  ? "border-[var(--vitrine-a)]/40 bg-[color-mix(in_oklch,var(--vitrine-a)_10%,transparent)] font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {c.nome}
            </Link>
          ))}
        </nav>
      )}

      {!relatorio && (
        <EstadoVazio className="mt-8" ilustracao={<ChecklistAmico />} titulo="Nenhum catálogo disponível." />
      )}

      {relatorio && (
        <dl data-grupo className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl border bg-card p-4">
            <dt className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="size-4 text-[var(--vitrine-a)]" aria-hidden /> Membros na turma
            </dt>
            <dd className="mt-1 text-3xl font-semibold tabular-nums">
              <span data-contar={relatorio.totalMembros}>{relatorio.totalMembros}</span>
            </dd>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <dt className="flex items-center gap-2 text-sm text-muted-foreground">
              <Vote className="size-4 text-[var(--vitrine-a)]" aria-hidden /> Enquetes com votos
            </dt>
            <dd className="mt-1 text-3xl font-semibold tabular-nums">
              <span data-contar={comVotos}>{comVotos}</span>{" "}
              <span className="text-base font-normal text-muted-foreground">de {enquetes.length}</span>
            </dd>
          </div>
        </dl>
      )}

      {/* top-14, e nao top-0: o cabecalho do painel (app-shell.tsx) e sticky em
          top-0 e tem a mesma altura. Com top-0 as duas barras grudavam no mesmo
          lugar e, tendo o mesmo z-index, a de baixo cobria o cabecalho. */}
      {relatorio && relatorio.categorias.length > 1 && (
        <nav
          aria-label="Categorias"
          className={cn(
            "sticky top-14 z-10 mt-6 flex gap-2 overflow-x-auto border-b bg-background/85 py-2 backdrop-blur",
            semRolagem,
          )}
        >
          {relatorio.categorias.map((c) => (
            <a
              key={c.id}
              href={`#cat-${c.id}`}
              className="shrink-0 rounded-full border px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {c.nome}
            </a>
          ))}
        </nav>
      )}

      {relatorio?.categorias.map((categoria) => (
        <section key={categoria.id} id={`cat-${categoria.id}`} className="mt-8 scroll-mt-16">
          <h2 className="text-lg font-semibold">{categoria.nome}</h2>
          <div data-grupo className="mt-3 grid gap-4">
            {categoria.enquetes.map((enquete) => {
              const [primeira, segunda] = enquete.opcoes;
              const lider = enquete.votantes > 0 && primeira?.votos > 0 ? primeira : null;
              const empate = lider && segunda && segunda.votos === lider.votos;
              return (
                <Card key={enquete.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{enquete.titulo}</CardTitle>
                    <CardDescription>
                      {enquete.votantes} de {relatorio.totalMembros}{" "}
                      {relatorio.totalMembros === 1 ? "membro" : "membros"}{" "}
                      responderam ·{" "}
                      {enquete.tipo === "unica"
                        ? "escolha única"
                        : "escolha múltipla (os percentuais somam mais de 100%)"}
                    </CardDescription>
                    {lider && (
                      <p className="mt-2 flex items-start gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm">
                        <Trophy className="mt-0.5 size-4 shrink-0 text-[var(--vitrine-a)]" aria-hidden />
                        <span>
                          {empate ? "Empate no topo: " : "Mais votada: "}
                          <strong className="font-medium">
                            {empate ? `${lider.texto} e ${segunda.texto}` : lider.texto}
                          </strong>{" "}
                          <span className="text-muted-foreground">
                            ({Math.round(lider.percentual)}%)
                          </span>
                        </span>
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    {enquete.votantes === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Ninguém votou ainda.
                      </p>
                    ) : (
                      <GraficoEnquete opcoes={enquete.opcoes} />
                    )}
                    <details className="group mt-3 text-sm">
                      <summary className="flex cursor-pointer list-none items-center gap-1.5 text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
                        <ChevronRight className="size-4 transition-transform group-open:rotate-90" aria-hidden />
                        Ver como tabela
                      </summary>
                      <div className="overflow-x-auto">
                      <table className="mt-2 w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b text-muted-foreground">
                            <th className="py-1 pr-2 font-medium">Opção</th>
                            <th className="px-2 py-1 text-right font-medium">
                              Votos
                            </th>
                            <th className="py-1 pl-2 text-right font-medium">
                              % de quem respondeu
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {enquete.opcoes.map((o) => (
                            <tr key={o.id} className="border-b last:border-0">
                              <td className="py-1 pr-2">{o.texto}</td>
                              <td className="px-2 py-1 text-right tabular-nums">
                                {o.votos}
                              </td>
                              <td className="py-1 pl-2 text-right tabular-nums">
                                {Math.round(o.percentual)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      </div>
                    </details>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
