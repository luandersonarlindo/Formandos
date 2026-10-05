"use client";

import { useActionState, useEffect, useState } from "react";
import type { EstadoForm } from "@/actions/tipos";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ConfirmarExclusaoProps = {
  acao: (formData: FormData) => Promise<EstadoForm | void>;
  /** Campos ocultos que a ação espera. */
  campos: Record<string, string>;
  /** O que está sendo apagado, para o título: "o catálogo", "a tarefa". */
  alvo: string;
  /** Nome do item, para a pessoa conferir o que vai sumir. */
  nome?: string;
  /** O que mais some junto. */
  aviso?: string;
  /** Texto do botão que abre a confirmação. */
  rotulo: string;
  /** Ícone antes do texto do botão. */
  icone?: React.ReactNode;
  /** Descrição só para leitores de tela, quando há vários botões iguais. */
  descricao?: string;
  /** Texto do botão de confirmação. */
  confirmar?: string;
  className?: string;
};

const inicial: EstadoForm = {};

// Botão de exclusão que abre um diálogo antes de apagar. As listas repetem o
// mesmo botão várias vezes, então a confirmação mostra o nome do item: sem isso
// a pessoa confirma no escuro e apaga a linha errada.
//
// O diálogo é controlado e o botão é renderizado aqui, sem DialogTrigger nem
// DialogClose. Os dois usam Slot, que exige um único elemento filho; quando o
// botão vinha de quem chamava, o servidor caía para renderização no cliente.
export function ConfirmarExclusao({
  acao,
  campos,
  alvo,
  nome,
  aviso,
  rotulo,
  icone,
  descricao,
  confirmar = "Sim, excluir",
  className,
}: ConfirmarExclusaoProps) {
  const [aberto, setAberto] = useState(false);
  const [estado, formAcao, pendente] = useActionState(
    // A maioria das ações de exclusão não devolve nada quando dá certo; as que
    // devolvem devolvem {ok} ou {erro}. Normaliza os dois jeitos para o diálogo
    // fechar só no sucesso e a mensagem aparecer quando houver.
    async (_: EstadoForm, formData: FormData): Promise<EstadoForm> => {
      const resposta = await acao(formData);
      if (resposta && typeof resposta === "object" && ("ok" in resposta || "erro" in resposta)) {
        return resposta;
      }
      return { ok: "Excluído." };
    },
    inicial,
  );

  useEffect(() => {
    if (estado.ok) setAberto(false);
  }, [estado]);

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        className={className}
        aria-label={descricao}
        onClick={() => setAberto(true)}
      >
        {icone}
        {rotulo}
      </Button>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir {alvo}?</DialogTitle>
            <DialogDescription>
              {nome ? (
                <>
                  <span className="font-medium text-foreground">{nome}</span>
                  {aviso ? `. ${aviso}` : ". Não dá para desfazer."}
                </>
              ) : (
                (aviso ?? "Não dá para desfazer.")
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" disabled={pendente} onClick={() => setAberto(false)}>
              Cancelar
            </Button>
            <form action={formAcao}>
              {Object.entries(campos).map(([nomeCampo, valor]) => (
                <input key={nomeCampo} type="hidden" name={nomeCampo} value={valor} />
              ))}
              <Button type="submit" variant="destructive" disabled={pendente}>
                {pendente ? "Excluindo…" : confirmar}
              </Button>
            </form>
            {estado.erro && (
              <p role="alert" className="w-full text-sm text-destructive">
                {estado.erro}
              </p>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}