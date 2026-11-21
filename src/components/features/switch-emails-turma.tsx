"use client";

import { useOptimistic, useTransition } from "react";
import { alternarEmailsDaTurma } from "@/actions/conta";
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

// Emails da turma (ADR-0006) como um interruptor: o estado fica à vista, em vez
// de escondido no texto de um botão que inverte. Mesma action e mesmo campo
// (`receber` = sim/nao) do formulário de antes; o valor otimista some sozinho
// quando a página volta revalidada.
export function SwitchEmailsTurma({ recebe }: { recebe: boolean }) {
  const [valor, setValor] = useOptimistic(recebe);
  const [pendente, iniciar] = useTransition();

  function trocar(novo: boolean) {
    iniciar(async () => {
      setValor(novo);
      const dados = new FormData();
      dados.set("receber", novo ? "sim" : "nao");
      await alternarEmailsDaTurma(dados);
    });
  }

  return (
    <Field orientation="horizontal" className="items-start justify-between gap-4">
      <FieldContent>
        <FieldLabel htmlFor="receber-emails">Emails da turma</FieldLabel>
        <FieldDescription>
          Decisões fixadas, mudanças na festa e prazos perto de vencer. Emails da conta (confirmação e senha)
          chegam sempre.
        </FieldDescription>
      </FieldContent>
      <Switch
        id="receber-emails"
        checked={valor}
        onCheckedChange={trocar}
        disabled={pendente}
        aria-busy={pendente}
        className="mt-0.5"
      />
    </Field>
  );
}
