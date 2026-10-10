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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  /** Verbo do título, para ações que não são exclusão: "Sair", "Remover". */
  verb?: string;
  /** Exige digitar um texto (email, nome da turma) antes de poder excluir. */
  confirmacao?: {
    /** Rótulo do campo, orientando o que digitar. Pode ter <strong>. */
    rotulo: React.ReactNode;
    /** Texto esperado; botão só libera quando coincide. */
    esperado: string;
  };
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
  verb = "Excluir",
  confirmacao,
  className,
}: ConfirmarExclusaoProps) {
  const [aberto, setAberto] = useState(false);
  const [digitado, setDigitado] = useState("");
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
  const confere =
    !confirmacao ||
    digitado.trim().toLowerCase() === confirmacao.esperado.trim().toLowerCase();

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
            <DialogTitle>
              {verb} {alvo}?
            </DialogTitle>
            <DialogDescription>
              {nome ? (
                <>
                  <span className="font-medium text-foreground wrap-break-word">{nome}</span>
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
            <form action={formAcao} className="flex flex-col gap-2 sm:items-end">
              {Object.entries(campos).map(([nomeCampo, valor]) => (
                <input key={nomeCampo} type="hidden" name={nomeCampo} value={valor} />
              ))}
              {confirmacao && (
                <div className="flex flex-col gap-1.5">
                  <Label className="block leading-normal wrap-break-word">{confirmacao.rotulo}</Label>
                  <Input
                    name="confirmacao"
                    autoComplete="off"
                    className="h-10 w-full sm:w-72"
                    value={digitado}
                    onChange={(e) => setDigitado(e.target.value)}
                    required
                  />
                </div>
              )}
              <Button type="submit" variant="destructive" disabled={pendente || !confere}>
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