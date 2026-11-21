import type { Metadata } from "next";
import { Eye } from "lucide-react";
import { notFound } from "next/navigation";
import { z } from "zod";
import { FormVotacaoCatalogo } from "@/components/features/form-votacao-catalogo";
import { EstadoVazio } from "@/components/features/estado-vazio";
import { LinkVoltar } from "@/components/features/link-voltar";
import { ChecklistAmico } from "@/components/ilustracoes/checklist-amico";
import { exigirMembro } from "@/lib/dal";
import { AVISO_VISIBILIDADE_VOTO } from "@/lib/empresa";
import { getCatalogoParaVotar, getNomeCatalogo } from "@/lib/votacoes";

export async function generateMetadata(
  props: PageProps<"/votacoes/[catalogoId]">,
): Promise<Metadata> {
  const membro = await exigirMembro();
  const { catalogoId } = await props.params;
  if (!z.uuid().safeParse(catalogoId).success) return {};
  const nome = await getNomeCatalogo(catalogoId, membro.turmaId);
  if (!nome) return {};
  return { title: nome };
}

export default async function CatalogoPage(
  props: PageProps<"/votacoes/[catalogoId]">,
) {
  const membro = await exigirMembro();
  const { catalogoId } = await props.params;
  if (!z.uuid().safeParse(catalogoId).success) notFound();

  const catalogo = await getCatalogoParaVotar(catalogoId, membro);
  const observador = membro.papel === "observador";
  if (!catalogo) notFound();

  const enquetes = catalogo.categorias.flatMap((c) => c.enquetes);

  return (
    <div className="mx-auto w-full max-w-3xl 2xl:max-w-5xl">
      <LinkVoltar href="/votacoes">Votações</LinkVoltar>
      {/* Sem o bloco de progresso: o número fica só no rodapé fixo do
          formulário, que acompanha a pessoa enquanto ela vota. */}
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-balance md:text-3xl">{catalogo.nome}</h1>

      {observador ? (
        <p role="status" className="mt-3 flex items-start gap-2 rounded-xl border bg-muted/50 p-3 text-sm">
          <Eye className="mt-0.5 size-4 shrink-0" aria-hidden />
          Você acompanha esta turma como observador e não vota. As perguntas e a
          participação aparecem abaixo.
        </p>
      ) : (
        // Aqui, onde a pessoa vota, e não só na lista (ADR-0001).
        <p className="mt-2 flex max-w-2xl items-start gap-2 text-sm text-muted-foreground text-pretty">
          <Eye className="mt-0.5 size-4 shrink-0" aria-hidden />
          {AVISO_VISIBILIDADE_VOTO}
        </p>
      )}

      {/* top-14, e nao top-0: o cabecalho do painel (app-shell.tsx) e
          sticky em top-0 e tem a mesma altura. Com top-0 as duas barras
          grudavam no mesmo lugar e, tendo o mesmo z-index, a de baixo
          cobria o cabecalho. Com até duas categorias a página é curta e a
          barra fixa só ocuparia tela. */}
      {catalogo.categorias.length > 2 && (
        <nav
          aria-label="Categorias"
          className="sticky top-14 z-10 mt-4 flex gap-2 overflow-x-auto border-b [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-background/85 py-2 backdrop-blur"
        >
          {catalogo.categorias.map((c) => (
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

      <FormVotacaoCatalogo catalogo={catalogo} somenteLeitura={observador} />

      {enquetes.length === 0 && (
        <EstadoVazio
          className="mt-8"
          ilustracao={<ChecklistAmico />}
          titulo="Este catálogo ainda não tem perguntas."
          descricao="A comissão ainda não cadastrou perguntas aqui. Volte em instantes ou confira os outros catálogos."
        />
      )}
    </div>
  );
}