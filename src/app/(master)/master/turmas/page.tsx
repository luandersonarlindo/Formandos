import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, School, Search, TriangleAlert, Users } from "lucide-react";
import { EstadoVazio } from "@/components/features/estado-vazio";
import { Paginacao } from "@/components/features/paginacao";
import { AprendizadoAmico } from "@/components/ilustracoes/aprendizado-amico";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { lerBusca } from "@/lib/busca";
import { exigirMaster } from "@/lib/dal";
import { lerPagina } from "@/lib/paginacao";
import { listarTurmas } from "@/lib/plataforma";

export const metadata: Metadata = { title: "Turmas" };

const data = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "America/Sao_Paulo" });

export default async function TurmasMasterPage({ searchParams }: PageProps<"/master/turmas">) {
  await exigirMaster();
  const { busca: buscaParametro, pagina: paginaParametro } = await searchParams;
  const busca = lerBusca(buscaParametro);
  const { itens: turmas, total, pagina, totalPaginas } = await listarTurmas(
    lerPagina(paginaParametro),
    { busca },
  );

  return (
    <div className="mx-auto w-full max-w-4xl 2xl:max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Turmas</h1>
      <p className="mt-2 text-muted-foreground">
        {total} {total === 1 ? "turma" : "turmas"} na plataforma.
      </p>

      <form action="/master/turmas" role="search" className="mt-6 flex gap-2">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            name="busca"
            defaultValue={busca}
            maxLength={100}
            placeholder="Buscar por nome da turma"
            aria-label="Buscar turma por nome"
            autoComplete="off"
            className="h-10 pl-9"
          />
        </div>
        <Button type="submit" size="lg">
          Buscar
        </Button>
        {busca && (
          <Link href="/master/turmas" className={buttonVariants({ variant: "outline", size: "lg" })}>
            Limpar
          </Link>
        )}
      </form>
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
        <ul data-grupo className="mt-6 grid gap-4 md:grid-cols-2">
          {turmas.map((t) => (
            <li key={t.id}>
              <Link href={`/master/turmas/${t.id}`} className="block">
                <Card className="vitrine-cartao h-full">
                  <CardContent className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/50 text-[var(--vitrine-a)]">
                        <School className="size-5" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium wrap-break-word">{t.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          Criada em {data.format(t.criadaEm)}
                          {t.criador ? ` por ${t.criador}` : ""}
                        </p>
                      </div>
                      <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        <Users aria-hidden /> {t.membros} {t.membros === 1 ? "membro" : "membros"}
                      </Badge>
                      <Badge variant={t.admins === 0 ? "destructive" : "outline"}>
                        {t.admins === 0 && <TriangleAlert aria-hidden />}
                        {t.admins} {t.admins === 1 ? "admin" : "admins"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Paginacao
        pagina={pagina}
        totalPaginas={totalPaginas}
        caminho="/master/turmas"
        parametros={{ busca: busca || undefined }}
      />
    </div>
  );
}
