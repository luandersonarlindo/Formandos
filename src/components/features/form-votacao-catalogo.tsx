"use client";

import { useState } from "react";
import { salvarVotos } from "@/actions/votos";
import type { EstadoForm } from "@/actions/tipos";
import { Check, LoaderCircle, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
}: {
  catalogo: CatalogoVotacao;
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

  const enquetes = catalogo.categorias.flatMap((c) => c.enquetes);
  const respondidas = enquetes.filter((e) => selecionadas[e.id]?.length > 0).length;

  // Sem action de formulário: o React 19 reseta o <form> depois da server
  // action e o checkbox controlado volta para a seleção antiga. Aqui o envio é
  // interceptado, a action roda na mão e o estado da tela não é tocado.
  async function aoEnviar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendente) return;
    setPendente(true);
    const resposta = await salvarVotos(estado, new FormData(event.currentTarget));
    setEstado(resposta);
    setPendente(false);
  }

  function alternar(enqueteId: string, opcaoId: string) {
    const enquete = EnqueteDoCatalogo(catalogo, enqueteId);
    if (!enquete || enquete.decisao.length > 0) return;
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
    <form onSubmit={aoEnviar}>
      <input type="hidden" name="catalogoId" value={catalogo.id} />
      {catalogo.categorias.map((categoria) => (
        <section
          key={categoria.id}
          id={`cat-${categoria.id}`}
          className="mt-8 scroll-mt-16"
        >
          <h2 className="text-lg font-semibold">{categoria.nome}</h2>
          <div data-grupo className="mt-3 grid gap-4">
            {categoria.enquetes.map((enquete) => (
              <EnqueteCard
                key={enquete.id}
                enquete={enquete}
                selecionadas={selecionadas[enquete.id] ?? []}
                aoAlternar={alternar}
              />
            ))}
          </div>
        </section>
      ))}

      {enquetes.length > 0 && (
        <div className="sticky bottom-3 z-20 mt-6">
          <Card className="mx-auto max-w-3xl border bg-background/90 backdrop-blur">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <p className="text-sm font-medium">
                {respondidas} de {enquetes.length} respondidas
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" size="sm" disabled={pendente}>
                  {pendente ? (
                    <LoaderCircle className="animate-spin" aria-hidden />
                  ) : (
                    <Save aria-hidden />
                  )}
                  {pendente ? "Salvando…" : "Salvar tudo"}
                </Button>
                <p
                  role="status"
                  className={
                    estado.erro
                      ? "text-sm text-destructive"
                      : "flex items-center gap-1.5 text-sm text-muted-foreground"
                  }
                >
                  {!estado.erro && estado.ok && (
                    <Check className="size-4 text-emerald-600" aria-hidden />
                  )}
                  {estado.erro ?? estado.ok}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </form>
  );
}