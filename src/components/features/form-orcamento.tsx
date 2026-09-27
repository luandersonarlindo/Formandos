"use client";

import { useState } from "react";
import { atualizarOrcamento } from "@/actions/terceiros";
import { FormAcao } from "@/components/features/form-acao";
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
  const [valor, setValor] = useState(valorOrcado?.toFixed(2).replace(".", ",") ?? "");

  return (
    <FormAcao acao={atualizarOrcamento} rotulo="Salvar" rotuloPendente="Salvando…" className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <input type="hidden" name="id" value={fornecedorId} />
      <div className="flex flex-col gap-1">
        <Label htmlFor={`status-${fornecedorId}`} className="text-xs">Status</Label>
        <NativeSelect id={`status-${fornecedorId}`} name="status" defaultValue={status} className="h-9">
          {STATUS_ORCAMENTO.map((s) => (
            <option key={s} value={s}>
              {ROTULO_ORCAMENTO[s]}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor={`valor-${fornecedorId}`} className="text-xs">Valor orçado</Label>
        <Input
          id={`valor-${fornecedorId}`}
          name="valorOrcado"
          inputMode="decimal"
          placeholder="Ex.: 1500,00"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          maxLength={20}
          className="h-9"
        />
      </div>
    </FormAcao>
  );
}
