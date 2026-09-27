"use client";

import { useState } from "react";
import { responderPresenca } from "@/actions/presenca";
import { FormAcao } from "@/components/features/form-acao";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MAX_ACOMPANHANTES,
  ROTULO_PRESENCA,
  STATUS_PRESENCA,
  type StatusPresenca,
} from "@/lib/presenca-regras";

// Campos controlados: o React limpa formulários depois da ação, e assim a
// resposta salva continua na tela.
export function FormPresenca({
  inicial,
}: {
  inicial: { status: StatusPresenca | null; acompanhantes: number; observacao: string };
}) {
  const [status, setStatus] = useState<StatusPresenca | null>(inicial.status);
  const [acompanhantes, setAcompanhantes] = useState(String(inicial.acompanhantes));
  const [observacao, setObservacao] = useState(inicial.observacao);

  return (
    <FormAcao acao={responderPresenca} rotulo="Salvar resposta" rotuloPendente="Salvando…">
      <fieldset className="grid gap-2 sm:grid-cols-3">
        <legend className="sr-only">Você vai ao evento?</legend>
        {STATUS_PRESENCA.map((s) => (
          <label
            key={s}
            className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted has-checked:border-[var(--vitrine-a)] has-checked:bg-[color-mix(in_oklch,var(--vitrine-a)_8%,transparent)] has-checked:font-medium pointer-coarse:py-3"
          >
            <input
              type="radio"
              name="status"
              value={s}
              checked={status === s}
              onChange={() => setStatus(s)}
              required
              className="size-4 accent-[var(--vitrine-a)]"
            />
            {ROTULO_PRESENCA[s]}
          </label>
        ))}
      </fieldset>
      {status === "vou" && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="acompanhantes">Quantos acompanhantes você leva?</Label>
          <Input
            id="acompanhantes"
            name="acompanhantes"
            type="number"
            inputMode="numeric"
            min={0}
            max={MAX_ACOMPANHANTES}
            value={acompanhantes}
            onChange={(e) => setAcompanhantes(e.target.value)}
            className="h-10 w-full sm:w-32"
          />
          <p className="text-xs text-muted-foreground">De 0 a {MAX_ACOMPANHANTES}, sem contar você.</p>
        </div>
      )}
      {status !== null && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="observacao">Observação (opcional)</Label>
          <Input
            id="observacao"
            name="observacao"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            maxLength={255}
            placeholder="Ex.: minha mãe e meu irmão; uma pessoa vegetariana"
            className="h-10"
          />
        </div>
      )}
    </FormAcao>
  );
}
