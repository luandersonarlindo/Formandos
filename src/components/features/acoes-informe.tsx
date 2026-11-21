"use client";

import { useActionState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { confirmarPagamento, recusarPagamento } from "@/actions/tesouraria";
import { FormDialog } from "@/components/features/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

// "Confirmar" é de um clique. Antes era um <form> sem estado: dois toques
// mandavam o pedido duas vezes e nada dizia que deu certo até a linha sumir.
// Agora o botão trava com "Confirmando…" e o sucesso vira toast.
function BotaoConfirmar({ id }: { id: string }) {
  const [vezes, acao, pendente] = useActionState(async (n: number, dados: FormData) => {
    await confirmarPagamento(dados);
    return n + 1;
  }, 0);

  useEffect(() => {
    if (vezes > 0) toast.success("Pagamento confirmado.");
  }, [vezes]);

  return (
    <form action={acao}>
      <input type="hidden" name="id" value={id} />
      <Button type="submit" size="sm" disabled={pendente}>
        {pendente ? <Spinner /> : <Check aria-hidden />}
        {pendente ? "Confirmando…" : "Confirmar"}
      </Button>
    </form>
  );
}

// Confirmar ou recusar um "Já paguei" (ADR-0005, parte 2). Só a tesouraria vê.
// São as duas únicas ações visíveis de um informe: é a decisão a tomar.
export function AcoesInforme({ id }: { id: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <BotaoConfirmar id={id} />
      <FormDialog
        rotulo="Recusar"
        icone={<X aria-hidden />}
        titulo="Recusar o informe"
        descricao="A pessoa vê o motivo em “Minha situação” e pode informar de novo."
        acao={recusarPagamento}
        campos={{ id }}
        rotuloSubmit="Recusar"
        rotuloPendente="Recusando…"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`motivo-${id}`}>Motivo</Label>
          <Input
            id={`motivo-${id}`}
            name="motivo"
            minLength={3}
            maxLength={255}
            required
            placeholder="Ex.: não achei esse Pix no extrato"
          />
        </div>
      </FormDialog>
    </div>
  );
}
