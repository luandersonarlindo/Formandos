"use client";

import { CampoValor } from "@/components/features/campo-valor";
import { useState } from "react";
import { valorInicial } from "@/lib/mascara-valor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import {
  ROTULO_ORCAMENTO,
  STATUS_ORCAMENTO,
  type StatusOrcamento,
} from "@/lib/orcamento";

// Campos de status e valor orçado, usados na edição do fornecedor. O valor é
// controlado: o React limpa formulários depois da ação, e assim o valor salvo
// continua na tela.
export function CamposOrcamento({
  fornecedorId,
  status,
  valorOrcado,
}: {
  fornecedorId: string;
  status: StatusOrcamento;
  valorOrcado: number | null;
}) {
  const [valor, setValor] = useState(valorInicial(valorOrcado));

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
        <CampoValor
          id={`valor-${fornecedorId}`}
          name="valorOrcado"
          placeholder="1.500,00"
          value={valor}
          onValueChange={setValor}
          maxLength={20}
        />
      </div>
    </>
  );
}