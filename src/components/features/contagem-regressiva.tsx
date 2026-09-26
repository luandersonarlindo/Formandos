"use client";

import { useEffect, useState } from "react";

// Só calcula depois de montar, para o HTML do servidor e o do navegador
// não divergirem (o "agora" é diferente nos dois).
export function ContagemRegressiva({ dataIso }: { dataIso: string }) {
  const [agora, setAgora] = useState<number | null>(null);

  useEffect(() => {
    setAgora(Date.now());
    const intervalo = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(intervalo);
  }, []);

  if (agora === null) {
    return <p className="text-3xl font-semibold tracking-tight">&nbsp;</p>;
  }

  const falta = new Date(dataIso).getTime() - agora;
  if (falta <= 0) {
    return (
      <p className="text-xl font-semibold tracking-tight">
        O evento já começou ou já passou.
      </p>
    );
  }

  const segundos = Math.floor(falta / 1000);
  const partes = [
    { valor: Math.floor(segundos / 86400), rotulo: "dias" },
    { valor: Math.floor((segundos % 86400) / 3600), rotulo: "horas" },
    { valor: Math.floor((segundos % 3600) / 60), rotulo: "min" },
    { valor: segundos % 60, rotulo: "seg" },
  ];

  return (
    <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
      {partes.map(({ valor, rotulo }) => (
        <span key={rotulo}>
          <span className="text-4xl font-semibold tracking-tight">{valor}</span>{" "}
          <span className="text-sm text-muted-foreground">{rotulo}</span>
        </span>
      ))}
    </p>
  );
}
