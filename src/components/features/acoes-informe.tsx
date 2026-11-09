import { Check, X } from "lucide-react";
import { confirmarPagamento, recusarPagamento } from "@/actions/tesouraria";
import { FormDialog } from "@/components/features/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Confirmar ou recusar um "Já paguei" (ADR-0005, parte 2). Só a tesouraria vê.
export function AcoesInforme({ id }: { id: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <form action={confirmarPagamento}>
        <input type="hidden" name="id" value={id} />
        <Button type="submit" size="sm">
          <Check aria-hidden /> Confirmar
        </Button>
      </form>
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
          <Label htmlFor={`motivo-${id}`} className="text-xs">Motivo</Label>
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
