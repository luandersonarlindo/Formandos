import type { Metadata } from "next";
import { ChevronRight, Trophy } from "lucide-react";
import { AbasRota } from "@/components/features/abas-rota";
import { CabecalhoPagina } from "@/components/features/cabecalho-pagina";
import { EstadoVazio } from "@/components/features/estado-vazio";
import { FiltrosPilula } from "@/components/features/filtros-pilula";
import { GraficoEnqueteLazy } from "@/components/features/grafico-enquete-lazy";
import { PainelRecolhivel } from "@/components/features/painel-recolhivel";
import { ChecklistAmico } from "@/components/ilustracoes/checklist-amico";
import { exigirMembro } from "@/lib/dal";
import { getRelatorio } from "@/lib/relatorio";
import { cn } from "@/lib/utils";
import { listarCatalogos } from "@/lib/votacoes";

export const metadata: Metadata = { title: "Resultados das votações" };

// Aba "Resultados" de Votações (P-01). A URL /votacoes/relatorio continua,
// porque há links guardados e emails apontando para ela. Só totais: nada aqui
// diz quem votou em quê.
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
    <div className="mx-auto w-full max-w-3xl">
      <CabecalhoPagina
        titulo="Votações"
        descricao="Preferências da turma em cada pergunta, da opção mais votada para a menos votada. Só aparecem totais."
      />
      <AbasRota
        className="mt-4"
        rotulo="Votações"
        abas={[
          { rotulo: "Votar", href: "/votacoes", ativa: false },
          { rotulo: "Resultados", href: "/votacoes/relatorio", ativa: true },
        ]}
      />

      {catalogos.length > 1 && (
        <FiltrosPilula
          className="mt-4"
          rotulo="Catálogos"
          filtros={catalogos.map((c) => ({
            rotulo: c.nome,
            href: `/votacoes/relatorio?catalogo=${c.id}`,
            ativo: c.id === escolhido?.id,
          }))}
        />
      )}

      {!relatorio && (
        <EstadoVazio className="mt-8" ilustracao={<ChecklistAmico />} titulo="Nenhum catálogo disponível." />
      )}

      {relatorio && (
        <p className="mt-4 text-sm text-muted-foreground tabular-nums">
          {comVotos} de {enquetes.length} {enquetes.length === 1 ? "pergunta já tem" : "perguntas já têm"} votos ·{" "}
          {relatorio.totalMembros} {relatorio.totalMembros === 1 ? "membro" : "membros"} na turma
        </p>
      )}

      {/* top-14, e nao top-0: o cabecalho do painel (app-shell.tsx) e sticky em
          top-0 e tem a mesma altura. Com top-0 as duas barras grudavam no mesmo
          lugar e, tendo o mesmo z-index, a de baixo cobria o cabecalho. Com até
          duas categorias a página é curta e a barra só ocuparia tela. */}
      {relatorio && relatorio.categorias.length > 2 && (
        <nav
          aria-label="Categorias"
          className={cn(
            "sticky top-14 z-10 mt-4 flex gap-2 overflow-x-auto border-b bg-background/85 py-2 backdrop-blur",
            semRolagem,
          )}
        >
          {relatorio.categorias.map((c) => (
            <a
              key={c.id}
              href={`#cat-${c.id}`}
              className="inline-flex h-8 shrink-0 items-center rounded-full border px-3 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted hover:text-foreground pointer-coarse:h-11 pointer-coarse:px-4"
            >
              {c.nome}
            </a>
          ))}
        </nav>
      )}

      {relatorio?.categorias.map((categoria) => (
        <section key={categoria.id} id={`cat-${categoria.id}`} className="mt-8 scroll-mt-16">
          <h2 className="text-lg font-semibold">{categoria.nome}</h2>
          <div data-grupo className="mt-3 divide-y rounded-xl border">
            {categoria.enquetes.map((enquete) => {
              const [primeira, segunda] = enquete.opcoes;
              const lider = enquete.votantes > 0 && primeira?.votos > 0 ? primeira : null;
              const empate = lider && segunda && segunda.votos === lider.votos;
              return (
                <article key={enquete.id} className="flex flex-col gap-2 p-4">
                  <h3 className="font-medium">{enquete.titulo}</h3>
                  <p className="text-sm text-muted-foreground">
                    {enquete.votantes} de {relatorio.totalMembros} responderam ·{" "}
                    {enquete.tipo === "unica"
                      ? "escolha única"
                      : "escolha múltipla (os percentuais somam mais de 100%)"}
                  </p>
                  {lider && (
                    <p className="flex items-start gap-2 text-sm">
                      <Trophy className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                      <span>
                        {empate ? "Empate no topo: " : "Mais votada: "}
                        <strong className="font-medium">
                          {empate ? `${lider.texto} e ${segunda.texto}` : lider.texto}
                        </strong>{" "}
                        <span className="text-muted-foreground">({Math.round(lider.percentual)}%)</span>
                      </span>
                    </p>
                  )}
                  {enquete.votantes === 0 ? (
                    <p className="text-sm text-muted-foreground">Ninguém votou ainda.</p>
                  ) : (
                    <GraficoEnqueteLazy opcoes={enquete.opcoes} />
                  )}
                  <PainelRecolhivel className="group text-sm">
                    <summary className="flex cursor-pointer list-none items-center gap-1.5 text-muted-foreground hover:text-foreground pointer-coarse:min-h-11 [&::-webkit-details-marker]:hidden">
                      <ChevronRight className="size-4 transition-transform group-open:rotate-90" aria-hidden />
                      Ver como tabela
                      <span className="sr-only">: {enquete.titulo}</span>
                    </summary>
                    <div className="overflow-x-auto">
                      <table className="mt-2 w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b text-muted-foreground">
                            <th scope="col" className="py-1 pr-2 font-medium">Opção</th>
                            <th scope="col" className="px-2 py-1 text-right font-medium">Votos</th>
                            <th scope="col" className="py-1 pl-2 text-right font-medium">% de quem respondeu</th>
                          </tr>
                        </thead>
                        <tbody>
                          {enquete.opcoes.map((o) => (
                            <tr key={o.id} className="border-b last:border-0">
                              <td className="py-1 pr-2">{o.texto}</td>
                              <td className="px-2 py-1 text-right tabular-nums">{o.votos}</td>
                              <td className="py-1 pl-2 text-right tabular-nums">{Math.round(o.percentual)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </PainelRecolhivel>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
