import type { Metadata } from "next";
import { Info } from "lucide-react";
import { notFound } from "next/navigation";
import { z } from "zod";
import { excluirTurma } from "@/actions/master";
import { AcoesMembroMaster } from "@/components/features/acoes-membro-master";
import { AvatarUsuario } from "@/components/features/avatar-usuario";
import { CabecalhoPagina } from "@/components/features/cabecalho-pagina";
import { CampoBusca } from "@/components/features/campo-busca";
import { ConfirmarExclusao } from "@/components/features/confirmar-exclusao";
import { EstadoVazio } from "@/components/features/estado-vazio";
import { LinkVoltar } from "@/components/features/link-voltar";
import { Paginacao } from "@/components/features/paginacao";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { lerBusca } from "@/lib/busca";
import { exigirMaster } from "@/lib/dal";
import { calcularPaginas, deslocamento, lerPagina, limitarPagina } from "@/lib/paginacao";
import { POR_PAGINA_MASTER, getTurma } from "@/lib/plataforma";
import { ROTULO_PAPEL } from "@/lib/papeis";

export const metadata: Metadata = { title: "Turma" };

// Uma turma vista pelo master: membros (papel e remoção) e a exclusão da turma.
// Cada membro tem um "⋯" com trocar papel e remover (P-16 do plano de UX); o
// único admin não tem menu, e o motivo aparece junto da linha dele.
export default async function TurmaMasterPage(props: PageProps<"/master/turmas/[turmaId]">) {
  const master = await exigirMaster();
  const { turmaId } = await props.params;
  const { busca: buscaParametro, pagina: paginaParametro } = await props.searchParams;
  if (!z.uuid().safeParse(turmaId).success) notFound();
  const busca = lerBusca(buscaParametro);
  const turma = await getTurma(turmaId, { busca });
  if (!turma) notFound();
  const totalAdmins = turma.totalAdmins;
  // getTurma devolve todos os membros (é a mesma leitura de sempre); a página
  // corta em pedaços do tamanho das outras listas do master.
  const totalPaginas = calcularPaginas(turma.membros.length, POR_PAGINA_MASTER);
  const pagina = limitarPagina(lerPagina(paginaParametro), totalPaginas);
  const inicio = deslocamento(pagina, POR_PAGINA_MASTER);
  const membros = turma.membros.slice(inicio, inicio + POR_PAGINA_MASTER);
  const caminho = `/master/turmas/${turma.id}`;

  return (
    <div className="mx-auto w-full max-w-4xl 2xl:max-w-6xl">
      <CabecalhoPagina
        antes={<LinkVoltar href="/master/turmas">Todas as turmas</LinkVoltar>}
        titulo={turma.nome}
        descricao={
          <>
            Código de convite{" "}
            <span className="rounded-md border bg-muted/50 px-2 py-0.5 font-mono text-sm tracking-widest text-foreground">
              {turma.codigo}
            </span>
            {turma.criador && <> · criada por {turma.criador}</>}
          </>
        }
      />

      <section aria-labelledby="titulo-membros" className="mt-8 flex flex-col gap-3">
        <h2 id="titulo-membros" className="text-lg font-semibold">
          Membros <span className="font-normal text-muted-foreground tabular-nums">({turma.totalMembros})</span>
        </h2>
        <CampoBusca
          acao={caminho}
          valor={busca}
          placeholder="Buscar por nome ou email"
          rotulo="Buscar membro por nome ou email"
        />
        {busca && (
          <p role="status" className="text-sm text-muted-foreground">
            {turma.membros.length} {turma.membros.length === 1 ? "membro encontrado" : "membros encontrados"} para “
            {busca}”.
          </p>
        )}
        {turma.membros.length === 0 ? (
          <EstadoVazio
            titulo={busca ? "Nenhum membro encontrado" : "Turma sem membros"}
            descricao={busca ? "Confira o nome ou o email e tente de novo." : undefined}
          />
        ) : (
          <ul data-grupo className="divide-y rounded-lg border">
            {membros.map((m) => {
              const ultimoAdmin = m.papel === "admin" && totalAdmins === 1;
              return (
                <li key={m.id} data-membro={m.name}>
                  <Item className="rounded-none">
                    <ItemMedia>
                      <AvatarUsuario nome={m.name} imagem={m.image} className="size-10" />
                    </ItemMedia>
                    <ItemContent className="min-w-0 basis-48">
                      <ItemTitle className="max-w-full">
                        <span className="truncate">{m.name}</span>
                        {m.id === master.id && <span className="font-normal text-muted-foreground">(você)</span>}
                      </ItemTitle>
                      <ItemDescription className="truncate">{m.email}</ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <Badge variant={m.papel === "admin" ? "default" : "secondary"}>{ROTULO_PAPEL[m.papel]}</Badge>
                      {!ultimoAdmin && (
                        <AcoesMembroMaster
                          turmaId={turma.id}
                          usuarioId={m.id}
                          nome={m.name}
                          admin={m.papel === "admin"}
                        />
                      )}
                    </ItemActions>
                  </Item>
                  {ultimoAdmin && (
                    <Alert role="note" className="mx-3 mb-3 w-auto border-dashed bg-transparent">
                      <Info aria-hidden />
                      <AlertDescription>
                        Único administrador: não pode ser rebaixado nem removido. Promova outro membro antes, ou
                        exclua a turma.
                      </AlertDescription>
                    </Alert>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <Paginacao
          className="mt-3"
          pagina={pagina}
          totalPaginas={totalPaginas}
          caminho={caminho}
          parametros={{ busca: busca || undefined }}
        />
      </section>

      {/* Zona de perigo: uma linha aqui; o que some junto está no diálogo. */}
      <section
        aria-labelledby="titulo-perigo"
        className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-destructive/50 p-4"
      >
        <div className="min-w-0 flex-1 basis-60">
          <h2 id="titulo-perigo" className="font-semibold text-destructive">Excluir turma</h2>
          <p className="text-sm text-muted-foreground">Apaga a turma e tudo o que é dela. Não dá para desfazer.</p>
        </div>
        <ConfirmarExclusao
          acao={excluirTurma}
          campos={{ turmaId: turma.id }}
          alvo="a turma"
          nome={turma.nome}
          aviso="Apaga a turma e tudo o que é dela: membros, catálogos, votos, dúvidas, tarefas e fornecedores. Não dá para desfazer. As contas dos usuários continuam existindo."
          rotulo="Excluir turma"
          descricao="Excluir a turma"
          sucesso="Turma excluída."
          confirmacao={{
            rotulo: (
              <>
                Digite o nome da turma (<strong>{turma.nome}</strong>) para confirmar
              </>
            ),
            esperado: turma.nome,
          }}
        />
      </section>
    </div>
  );
}
