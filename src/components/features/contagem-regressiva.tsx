"use client";

import { useEffect, useState } from "react";
import { partesDaContagem } from "@/lib/contagem";

function parte(valor: number, singular: string, plural: string) {
  return `${valor} ${valor === 1 ? singular : plural}`;
}

// Contagem discreta, na linha da data do evento: "faltam 40 dias". A data já
// está escrita ao lado, então a contagem é só um lembrete e não precisa das
// três caixas grandes de antes (plano de UX, D-03).
//
// Só calcula depois de montar, para o HTML do servidor e o do navegador não
// divergirem (o "agora" é diferente nos dois). Sem região viva: muda a cada
// minuto e não deve falar sozinha (ADR-0015).
export function ContagemRegressiva({ dataIso }: { dataIso: string }) {
  const [agora, setAgora] = useState<number | null>(null);

  useEffect(() => {
    setAgora(Date.now());
    const intervalo = setInterval(() => setAgora(Date.now()), 30_000);
    return () => clearInterval(intervalo);
  }, []);

  if (agora === null) return null;

  const falta = new Date(dataIso).getTime() - agora;
  if (falta <= 0) return <span data-contagem>o evento já começou ou já passou</span>;

  const { dias, horas, minutos } = partesDaContagem(falta);
  const texto =
    dias > 0
      ? parte(dias, "dia", "dias")
      : horas > 0
        ? parte(horas, "hora", "horas")
        : parte(minutos, "minuto", "minutos");
  return (
    <span data-contagem className="tabular-nums">
      {texto.startsWith("1 ") ? "falta" : "faltam"} {texto}
    </span>
  );
}
