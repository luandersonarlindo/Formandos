"use client";

import { useEffect, useState } from "react";

// Só calcula depois de montar, para o HTML do servidor e o do navegador
// não divergirem (o "agora" é diferente nos dois).
export function ContagemRegressiva({ dataIso }: { dataIso: string }) {
  const [agora, setAgora] = useState<number | null>(null);

  useEffect(() => {
    setAgora(Date.now());
    // Sem segundos no visor, atualizar a cada minuto já é suficiente.
    const intervalo = setInterval(() => setAgora(Date.now()), 30_000);
    return () => clearInterval(intervalo);
  }, []);

  if (agora === null) {
    return <div className="h-[4.5rem]" aria-hidden />;
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
  ];

  return (
    <div className="grid max-w-xs grid-cols-3 gap-2 sm:gap-3">
      {partes.map(({ valor, rotulo }) => (
        <div key={rotulo} className="rounded-xl border bg-background/80 px-2 py-2.5 text-center">
          <p className="vitrine-texto-gradiente text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
            {String(valor).padStart(2, "0")}
          </p>
          <p className="text-xs text-muted-foreground">{rotulo}</p>
        </div>
      ))}
    </div>
  );
}
