"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { salvarVotos } from "@/actions/votos";
import type { EstadoForm } from "@/actions/tipos";
import { Save } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EnqueteCard } from "@/components/features/enquete-card";
import type {
  CatalogoVotacao,
  EnqueteVotacao,
} from "@/lib/votacoes";

const inicial: EstadoForm = {};

function EnqueteDoCatalogo(
  catalogo: CatalogoVotacao,
  enqueteId: string,
): EnqueteVotacao | undefined {
  for (const categoria of catalogo.categorias) {
    const encontrada = categoria.enquetes.find((e) => e.id === enqueteId);
    if (encontrada) return encontrada;
  }
  return undefined;
}

// O catálogo inteiro de perguntas é um único formulário: a pessoa marca o que
// quiser, respondida ou não, e um botão "Salvar tudo" no rodapé grava tudo de
// uma vez. Enquete que ficou sem marcação simplesmente não entra no save.
export function FormVotacaoCatalogo({
  catalogo,
  somenteLeitura = false,
}: {
  catalogo: CatalogoVotacao;
  // Observador (ADR-0012): vê as perguntas e os totais, mas não vota. É só a
  // parte visível; quem recusa o voto é a action (exigirFormandoEditavel).
  somenteLeitura?: boolean;
}) {
  const [selecionadas, setSelecionadas] = useState<Record<string, string[]>>(
    () => {
      const inicial: Record<string, string[]> = {};
      for (const categoria of catalogo.categorias) {
        for (const enquete of categoria.enquetes) {
          inicial[enquete.id] = enquete.selecionadas;
        }
      }
      return inicial;
    },
  );
  const [estado, setEstado] = useState<EstadoForm>(inicial);
  const [pendente, setPendente] = useState(false);
  // Última seleção confirmada pelo servidor. Serve para avisar "alterações não
  // salvas": sem isso, depois de votar a pessoa não sabe se o que está na tela
  // já foi gravado, clica de novo e gera retry em cima de retry no pico.
  const [salvas, setSalvas] = useState<Record<string, string[]>>(() => {
    const inicial: Record<string, string[]> = {};
    for (const categoria of catalogo.categorias) {
      for (const enquete of categoria.enquetes) {
        inicial[enquete.id] = enquete.selecionadas;
      }
    }
    return inicial;
  });

  const enquetes = catalogo.categorias.flatMap((c) => c.enquetes);
  const respondidas = enquetes.filter((e) => selecionadas[e.id]?.length > 0).length;
  const sujo = enquetes.some(
    (e) => JSON.stringify(selecionadas[e.id] ?? []) !== JSON.stringify(salvas[e.id] ?? []),
  );
  const router = useRouter();
  // Para onde a pessoa queria ir quando clicou num link com votos não salvos.
  const [destino, setDestino] = useState<string | null>(null);

  // Aviso ao sair com votos não salvos (D-11). Fechar ou recarregar a aba cai
  // no beforeunload, que só o navegador pode perguntar. Os links internos
  // (menu, voltar, abas) são interceptados na fase de captura, antes do <Link>
  // do Next, e abrem um AlertDialog nosso: com foco preso e "Continuar aqui"
  // como saída segura, o que o confirm() nativo não garante no D-pad da TV.
  // As âncoras da própria página (#cat-…) passam direto.
  useEffect(() => {
    if (!sujo || somenteLeitura) return;
    function antesDeSair(evento: BeforeUnloadEvent) {
      evento.preventDefault();
      evento.returnValue = "";
    }
    function aoClicar(evento: MouseEvent) {
      if (evento.defaultPrevented || evento.button !== 0) return;
      if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return;
      const link = (evento.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      if (link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      evento.preventDefault();
      evento.stopPropagation();
      setDestino(url.pathname + url.search + url.hash);
    }
    window.addEventListener("beforeunload", antesDeSair);
    document.addEventListener("click", aoClicar, true);
    return () => {
      window.removeEventListener("beforeunload", antesDeSair);
      document.removeEventListener("click", aoClicar, true);
    };
  }, [sujo, somenteLeitura]);

  // Sucesso vira toast (D-06); o erro fica no rodapé, junto do botão.
  useEffect(() => {
    if (estado.ok) toast.success(estado.ok);
  }, [estado]);

  // Sem action de formulário: o React 19 reseta o <form> depois da server
  // action e o checkbox controlado volta para a seleção antiga. Aqui o envio é
  // interceptado, a action roda na mão e o estado da tela não é tocado.
  async function aoEnviar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendente) return;
    setPendente(true);
    const tentativa = selecionadas;
    const resposta = await salvarVotos(estado, new FormData(event.currentTarget));
    // Só marca como salvo o que foi enviado: se a pessoa mexeu em algo durante
    // o save, aquilo segue como "não salvo" em vez de sumir do aviso.
    if (resposta.ok) setSalvas(tentativa);
    setEstado(resposta);
    setPendente(false);
  }

  function alternar(enqueteId: string, opcaoId: string) {
    if (pendente) return;
    const enquete = EnqueteDoCatalogo(catalogo, enqueteId);
    if (!enquete || enquete.decisao.length > 0 || enquete.encerrada) return;
    const exclusiva =
      enquete.opcoes.find((o) => o.id === opcaoId)?.exclusiva ?? false;
    setSelecionadas((atual) => {
      const atuais = atual[enqueteId] ?? [];
      if (enquete.tipo === "unica") return { ...atual, [enqueteId]: [opcaoId] };
      if (atuais.includes(opcaoId)) {
        return { ...atual, [enqueteId]: atuais.filter((x) => x !== opcaoId) };
      }
      // Marcar uma opção exclusiva desmarca as outras, e vice-versa.
      if (exclusiva) return { ...atual, [enqueteId]: [opcaoId] };
      const exclusivas = new Set(
        enquete.opcoes.filter((o) => o.exclusiva).map((o) => o.id),
      );
      return {
        ...atual,
        [enqueteId]: [...atuais.filter((x) => !exclusivas.has(x)), opcaoId],
      };
    });
  }

  return (
    <form onSubmit={aoEnviar} aria-busy={pendente}>
      <input type="hidden" name="catalogoId" value={catalogo.id} />
      {catalogo.categorias.map((categoria) => (
        <section
          key={categoria.id}
          id={`cat-${categoria.id}`}
          className="mt-8 scroll-mt-16"
        >
          <h2 className="text-lg font-semibold">{categoria.nome}</h2>
          {/* Trava a edição durante o save: mexer no meio do envio gera
              seleção divergente do que foi gravado e retry confuso. */}
          <div data-grupo className={pendente ? "pointer-events-none mt-3 grid gap-4 opacity-70" : "mt-3 grid gap-4"} aria-disabled={pendente}>
            {categoria.enquetes.map((enquete) => (
              <EnqueteCard
                key={enquete.id}
                enquete={enquete}
                selecionadas={selecionadas[enquete.id] ?? []}
                aoAlternar={alternar}
                somenteLeitura={somenteLeitura}
              />
            ))}
          </div>
        </section>
      ))}

      {/* Rodapé fixo: o único lugar com o progresso do catálogo. O
          role="status" anuncia o número e o "não salvas" (ADR-0015). */}
      {enquetes.length > 0 && !somenteLeitura && (
        <div className="sticky bottom-3 z-20 mt-6">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 rounded-xl border bg-background/95 p-3 shadow-sm backdrop-blur sm:p-4">
            <div className="flex min-w-0 flex-col gap-0.5">
              <p role="status" className="text-sm font-medium">
                {respondidas} de {enquetes.length} respondidas
                {!pendente && !estado.erro && sujo && (
                  <span className="text-warning"> · alterações não salvas</span>
                )}
              </p>
              {estado.erro && (
                <p role="alert" className="text-sm text-destructive">
                  {estado.erro}
                </p>
              )}
            </div>
            <Button type="submit" disabled={pendente}>
              {pendente ? <Spinner /> : <Save aria-hidden />}
              {pendente ? "Salvando…" : "Salvar tudo"}
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={destino !== null} onOpenChange={(aberto) => !aberto && setDestino(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sair sem salvar os votos?</AlertDialogTitle>
            <AlertDialogDescription>
              Você marcou respostas que ainda não foram salvas. Se sair agora, elas se perdem. Para guardar, use
              “Salvar tudo” no fim da página.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar aqui</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                const ir = destino;
                setDestino(null);
                if (ir) router.push(ir);
              }}
            >
              Sair sem salvar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}