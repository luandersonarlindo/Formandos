import type { Metadata } from "next";
import Link from "next/link";
import { GraficoEnquete } from "@/components/features/grafico-enquete";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { exigirMembro } from "@/lib/dal";
import { getRelatorio } from "@/lib/relatorio";
import { listarCatalogos } from "@/lib/votacoes";
import { cn } from "@/lib/utils";

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

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">
        Relatório das votações
      </h1>
      <p className="mt-2 text-muted-foreground">
        Preferências da turma em cada enquete, da opção mais votada para a
        menos votada. Só aparecem totais: o relatório não mostra quem votou.
      </p>

      {catalogos.length > 1 && (
        <nav aria-label="Catálogos" className="mt-6 flex flex-wrap gap-2">
          {catalogos.map((c) => (
            <Link
              key={c.id}
              href={`/votacoes/relatorio?catalogo=${c.id}`}
              aria-current={c.id === escolhido?.id ? "page" : undefined}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-sm transition-colors hover:bg-muted",
                c.id === escolhido?.id && "bg-muted font-medium",
              )}
            >
              {c.nome}
            </Link>
          ))}
        </nav>
      )}

      {!relatorio && (
        <p className="mt-8 text-muted-foreground">Nenhum catálogo disponível.</p>
      )}

      {relatorio?.categorias.map((categoria) => (
        <section key={categoria.id} className="mt-8">
          <h2 className="text-lg font-semibold">{categoria.nome}</h2>
          <div className="mt-3 grid gap-4">
            {categoria.enquetes.map((enquete) => (
              <Card key={enquete.id}>
                <CardHeader>
                  <CardTitle>{enquete.titulo}</CardTitle>
                  <CardDescription>
                    {enquete.votantes} de {relatorio.totalMembros}{" "}
                    {relatorio.totalMembros === 1 ? "membro" : "membros"}{" "}
                    responderam ·{" "}
                    {enquete.tipo === "unica"
                      ? "escolha única"
                      : "escolha múltipla (os percentuais somam mais de 100%)"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {enquete.votantes === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Ninguém votou ainda.
                    </p>
                  ) : (
                    <GraficoEnquete opcoes={enquete.opcoes} />
                  )}
                  <details className="mt-3 text-sm">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      Ver como tabela
                    </summary>
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
                  </details>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
