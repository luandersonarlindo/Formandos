"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { PRAZOS_EXCLUSAO, PRAZO_PADRAO, dataExclusao, type PrazoExclusao } from "@/lib/fim-da-turma-regras";

// Escolha do prazo de exclusão (ADR-0009), no diálogo de arquivar e no de
// mudar a data. Mostra a data que vai valer, contada a partir de hoje.
export function CampoPrazoExclusao({ hoje }: { hoje: string }) {
  const [dias, setDias] = React.useState<PrazoExclusao>(PRAZO_PADRAO);
  const data = dataExclusao(hoje, dias).split("-").reverse().join("/");

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="dias" className="block leading-normal">
        Excluir tudo daqui a
      </Label>
      <NativeSelect
        id="dias"
        name="dias"
        value={dias}
        onChange={(e) => setDias(Number(e.target.value) as PrazoExclusao)}
        className="w-full sm:w-48"
      >
        {PRAZOS_EXCLUSAO.map((p) => (
          <option key={p} value={p}>
            {p} dias
          </option>
        ))}
      </NativeSelect>
      <p className="text-sm text-pretty" aria-live="polite">
        A turma será excluída em <strong className="font-medium">{data}</strong>. Os membros recebem
        um email agora e outro 7 dias antes.
      </p>
    </div>
  );
}
