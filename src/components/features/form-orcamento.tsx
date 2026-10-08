"use client";

import { useState } from "react";
import { Wallet } from "lucide-react";
import { atualizarOrcamento } from "@/actions/terceiros";
import { FormDialog } from "@/components/features/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { ROTULO_ORCAMENTO, STATUS_ORCAMENTO, type StatusOrcamento } from "@/lib/orcamento";

// Campos controlados: o React limpa formulários depois da ação, e assim o
// valor salvo continua na tela.
export function FormOrcamento({
  fornecedorId,
  status,
  valorOrcado,
}: {
  fornecedorId: string;
  status: StatusOrcamento;
  valorOrcado: number | null;
}) {
  return (
    <FormDialog
      rotulo="Salvar orçamento"
      icone={<Wallet aria-hidden />}
      titulo="Orçamento do fornecedor"
      descricao="Status do orçamento e valor. Só administradores veem valores."
      acao={atualizarOrcamento}
      campos={{ id: fornecedorId }}
      rotuloSubmit="Salvar"
      rotuloPendente="Salvando…"
    >
      <CamposOrcamento status={status} valorOrcado={valorOrcado} fornecedorId={fornecedorId} />
    </FormDialog>
  );
}

function CamposOrcamento({
  fornecedorId,
  status,
  valorOrcado,
}: {
  fornecedorId: string;
  status: StatusOrcamento;
  valorOrcado: number | null;
}) {
  const [valor, setValor] = useState(valorOrcado?.toFixed(2).replace(".", ",") ?? "");

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`status-${fornecedorId}`}>Status</Label>
        <NativeSelect id={`status-${fornecedorId}`} name="status" defaultValue={status}>
          {STATUS_ORCAMENTO.map((s) => (
            <option key={s} value={s}>
              {ROTULO_ORCAMENTO[s]}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`valor-${fornecedorId}`}>Valor orçado</Label>
        <Input
          id={`valor-${fornecedorId}`}
          name="valorOrcado"
          inputMode="decimal"
          placeholder="Ex.: 1500,00"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          maxLength={20}
          className="h-10"
        />
      </div>
    </>
  );
}