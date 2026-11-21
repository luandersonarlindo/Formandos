import type { Metadata } from "next";
import { Pencil, Trash2 } from "lucide-react";
import { atualizarAviso, excluirAviso } from "@/actions/avisos";
import { CabecalhoPagina } from "@/components/features/cabecalho-pagina";
import { EstadoVazio } from "@/components/features/estado-vazio";
import { FormNovoAviso } from "@/components/features/form-novo-aviso";
import { MandarParaGrupo } from "@/components/features/mandar-para-grupo";
import { AcaoDialogo, AcaoExcluir, AcaoSeparador, MenuAcoes } from "@/components/features/menu-acoes";
import { Paginacao } from "@/components/features/paginacao";
import { ColaboracaoAmico } from "@/components/ilustracoes/colaboracao-amico";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { listarAvisos } from "@/lib/avisos";
import { exigirMembro } from "@/lib/dal";
import { lerPagina } from "@/lib/paginacao";

export const metadata: Metadata = { title: "Avisos" };

const formatarData = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });

// Recados da comissão. A lista vem primeiro para todo mundo; o admin ganha o
// "Novo aviso" no cabeçalho e, em cada recado, "Mandar para o grupo" (a ação
// que ele mais usa) mais o "⋯" com Editar e Remover (D-05).
export default async function AvisosPage({ searchParams }: PageProps<"/avisos">) {
  const membro = await exigirMembro();
  const { pagina: paginaParametro } = await searchParams;
  const ehAdmin = membro.papel === "admin";
  const { itens, total, pagina, totalPaginas } = await listarAvisos(membro, {
    pagina: lerPagina(paginaParametro),
  });

  return (
    <div className="mx-auto w-full max-w-3xl">
      <CabecalhoPagina
        titulo="Avisos"
        descricao="Recados da comissão sobre a organização do evento."
        acao={ehAdmin ? <FormNovoAviso /> : undefined}
      />

      {total === 0 ? (
        <EstadoVazio
          className="mt-6"
          descricao={ehAdmin ? "Publique o primeiro recado em “Novo aviso”." : "A comissão ainda não publicou nenhum recado."}
          ilustracao={<ColaboracaoAmico />}
          titulo="Nenhum aviso ainda"
        />
      ) : (
        <ul data-grupo className="mt-6 divide-y rounded-xl border">
          {itens.map((a) => (
            <li key={a.id} className="flex flex-col gap-1.5 p-4">
              <div className="flex items-start gap-2">
                <p className="min-w-0 flex-1 font-medium wrap-break-word">{a.titulo}</p>
                {ehAdmin && (
                  <MenuAcoes nome={a.titulo} className="-mt-1 -mr-1">
                    <AcaoDialogo
                      rotulo="Editar aviso"
                      icone={<Pencil aria-hidden />}
                      titulo="Editar aviso"
                      descricao="Título e recado para a turma."
                      acao={atualizarAviso}
                      campos={{ id: a.id }}
                    >
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`titulo-${a.id}`}>Título</Label>
                        <Input id={`titulo-${a.id}`} name="titulo" defaultValue={a.titulo} maxLength={200} required />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`conteudo-${a.id}`}>Recado</Label>
                        <Textarea id={`conteudo-${a.id}`} name="conteudo" defaultValue={a.conteudo} maxLength={2000} rows={4} required />
                      </div>
                    </AcaoDialogo>
                    <AcaoSeparador />
                    <AcaoExcluir
                      acao={excluirAviso}
                      campos={{ id: a.id }}
                      alvo="o aviso"
                      nome={a.titulo}
                      rotulo="Remover"
                      descricao={`Remover o aviso ${a.titulo}`}
                      icone={<Trash2 aria-hidden />}
                      sucesso="Aviso removido."
                    />
                  </MenuAcoes>
                )}
              </div>
              <p className="wrap-break-word whitespace-pre-wrap text-sm text-muted-foreground">{a.conteudo}</p>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  {a.autor} · {formatarData.format(a.criadoEm)}
                </p>
                {ehAdmin && (
                  <MandarParaGrupo conteudo={{ tipo: "aviso", dados: { titulo: a.titulo, conteudo: a.conteudo } }} />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <Paginacao pagina={pagina} totalPaginas={totalPaginas} caminho="/avisos" />
    </div>
  );
}
