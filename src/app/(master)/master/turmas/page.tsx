import type { Metadata } from "next";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { CabecalhoPagina } from "@/components/features/cabecalho-pagina";
import { CampoBusca } from "@/components/features/campo-busca";
import { EstadoVazio } from "@/components/features/estado-vazio";
import { Paginacao } from "@/components/features/paginacao";
import { AprendizadoAmico } from "@/components/ilustracoes/aprendizado-amico";
import { Badge } from "@/components/ui/badge";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { lerBusca } from "@/lib/busca";
import { exigirMaster } from "@/lib/dal";
import { lerPagina } from "@/lib/paginacao";
import { listarTurmas } from "@/lib/plataforma";

export const metadata: Metadata = { title: "Turmas" };

const data = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "America/Sao_Paulo" });

// Lista de turmas do master. Uma coluna (a grade de duas colunas lia em Z e
// atrapalhava o D-pad), uma linha por turma, sem ícone decorativo. O único
// destaque é "Sem admin", que é o sinal que pede atenção do master.
export default async function TurmasMasterPage({ searchParams }: PageProps<"/master/turmas">) {
  await exigirMaster();
  const { busca: buscaParametro, pagina: paginaParametro } = await searchParams;
  const busca = lerBusca(buscaParametro);
  const { itens: turmas, total, pagina, totalPaginas } = await listarTurmas(lerPagina(paginaParametro), { busca });

  return (
    <div className="mx-auto w-full max-w-4xl 2xl:max-w-6xl">
      <CabecalhoPagina titulo="Turmas" descricao={`${total} ${total === 1 ? "turma" : "turmas"} na plataforma.`} />

      <CampoBusca
        className="mt-6"
        acao="/master/turmas"
        valor={busca}
        placeholder="Buscar por nome da turma"
        rotulo="Buscar turma por nome"
      />
      {busca && (
        <p role="status" className="mt-3 text-sm text-muted-foreground">
          {total} {total === 1 ? "turma encontrada" : "turmas encontradas"} para “{busca}”.
        </p>
      )}

      {turmas.length === 0 ? (
        <EstadoVazio
          className="mt-6"
          ilustracao={<AprendizadoAmico />}
          titulo={busca ? "Nenhuma turma encontrada" : "Nenhuma turma criada ainda"}
          descricao={busca ? "Confira o nome e tente de novo." : undefined}
        />
      ) : (
        <ul data-grupo className="mt-4 divide-y rounded-lg border">
          {turmas.map((t) => (
            <li key={t.id}>
              <Item asChild className="rounded-none pointer-coarse:min-h-11">
                <Link href={`/master/turmas/${t.id}`}>
                  <ItemContent className="min-w-0 basis-56">
                    <ItemTitle className="line-clamp-none wrap-break-word">{t.nome}</ItemTitle>
                    <ItemDescription>
                      Criada em {data.format(t.criadaEm)}
                      {t.criador ? ` por ${t.criador}` : ""} · {t.membros} {t.membros === 1 ? "membro" : "membros"}
                      {t.admins > 0 && ` · ${t.admins} ${t.admins === 1 ? "admin" : "admins"}`}
                    </ItemDescription>
                  </ItemContent>
                  {t.admins === 0 && (
                    <ItemActions>
                      <Badge variant="destructive">
                        <TriangleAlert aria-hidden /> Sem admin
                      </Badge>
                    </ItemActions>
                  )}
                </Link>
              </Item>
            </li>
          ))}
        </ul>
      )}
      <Paginacao pagina={pagina} totalPaginas={totalPaginas} caminho="/master/turmas" parametros={{ busca: busca || undefined }} />
    </div>
  );
}
