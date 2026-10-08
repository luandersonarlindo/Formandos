"use client";

import { useState } from "react";
import { UserCheck } from "lucide-react";
import { responderPresenca } from "@/actions/presenca";
import { FormDialog } from "@/components/features/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ROTULO_PRESENCA,
  STATUS_PRESENCA,
  type StatusPresenca,
} from "@/lib/presenca-regras";

export function FormPresenca({
  inicial,
  limite,
}: {
  inicial: { status: StatusPresenca | null; acompanhantes: number; observacao: string };
  // Quantos acompanhantes a turma permite (escolha do administrador).
  limite: number;
}) {
  return (
    <FormDialog
      rotulo={inicial.status ? "Mudar resposta" : "Responder"}
      icone={<UserCheck aria-hidden />}
      titulo="Você vai ao evento?"
      descricao={
        inicial.status
          ? "Você pode mudar a resposta quando quiser."
          : "A comissão precisa saber quantas pessoas vêm para fechar o espaço e a comida."
      }
      acao={responderPresenca}
      rotuloSubmit="Salvar resposta"
      rotuloPendente="Salvando…"
    >
      <CamposPresenca inicial={inicial} limite={limite} />
    </FormDialog>
  );
}

// Campos controlados: o React limpa formulários depois da ação, e assim a
// resposta salva continua na tela.
function CamposPresenca({
  inicial,
  limite,
}: {
  inicial: { status: StatusPresenca | null; acompanhantes: number; observacao: string };
  limite: number;
}) {
  const [status, setStatus] = useState<StatusPresenca | null>(inicial.status);
  const [acompanhantes, setAcompanhantes] = useState(
    String(Math.min(inicial.acompanhantes, limite)),
  );
  const [observacao, setObservacao] = useState(inicial.observacao);

  return (
    <>
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
            max={limite}
            value={acompanhantes}
            onChange={(e) => setAcompanhantes(e.target.value)}
            className="h-10 w-full sm:w-32"
          />
          <p className="text-xs text-muted-foreground">
            {limite === 0
              ? "A turma não permite acompanhantes."
              : `De 0 a ${limite}, sem contar você.`}
          </p>
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
    </>
  );
}