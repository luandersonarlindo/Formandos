import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { CabecalhoPagina } from "@/components/features/cabecalho-pagina";
import { EstadoVazio } from "@/components/features/estado-vazio";
import { SwitchCatalogoPadrao } from "@/components/features/switch-catalogo-padrao";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { contarCatalogosPadrao, listarCatalogosAdmin } from "@/lib/admin";
import { exigirAdmin } from "@/lib/dal";

export const metadata: Metadata = { title: "Catálogos de enquetes" };

// Lista de catálogos da comissão: uma linha por catálogo, com quantas
// perguntas já têm decisão (P-13). O uso do catálogo padrão é um Switch numa
// linha só, no lugar do card com diálogo.
export default async function VotacoesAdminPage() {
  const admin = await exigirAdmin();
  const [catalogos, padroes] = await Promise.all([
    listarCatalogosAdmin(admin.turmaId),
    contarCatalogosPadrao(),
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl 2xl:max-w-6xl">
      <CabecalhoPagina
        titulo="Catálogos de enquetes"
        descricao="Cada catálogo junta as perguntas que a turma vota. Abra um para montar as perguntas e decidir."
        acao={
          <Button asChild>
            <Link href="/admin/votacoes/nova">
              <Plus aria-hidden /> Novo catálogo
            </Link>
          </Button>
        }
      />

      {padroes > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl border px-4 py-3">
          <div className="min-w-0 flex-1 basis-64">
            <p className="font-medium">Catálogo padrão na turma</p>
            <p className="text-sm text-muted-foreground text-pretty">
              Perguntas prontas da plataforma, iguais para todas as turmas. Desligar não apaga votos: eles voltam se
              você ligar de novo.
            </p>
          </div>
          <SwitchCatalogoPadrao ligado={admin.usarCatalogoPadrao} />
        </div>
      )}

      {catalogos.length === 0 ? (
        <EstadoVazio
          className="mt-4"
          titulo="Nenhum catálogo ainda"
          descricao="Crie um catálogo a partir de um modelo pronto ou do zero."
        />
      ) : (
      <ul data-grupo className="mt-4 divide-y rounded-xl border">
        {catalogos.map((c) => (
          <li key={c.id}>
            <Link
              href={`/admin/votacoes/${c.id}`}
              className="flex items-center gap-3 px-4 py-3 transition-colors outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
            >
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-medium">
                  <span className="wrap-break-word">{c.nome}</span>
                  <Badge variant={c.padrao ? "secondary" : "outline"}>{c.padrao ? "Padrão" : "Personalizado"}</Badge>
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  {c.enquetes} {c.enquetes === 1 ? "pergunta" : "perguntas"}
                  {c.enquetes > 0 && (
                    <Badge variant={c.decididas === c.enquetes ? "default" : "outline"}>
                      {c.decididas} de {c.enquetes} {c.enquetes === 1 ? "decidida" : "decididas"}
                    </Badge>
                  )}
                </p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
      )}
    </div>
  );
}
