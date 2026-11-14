"use client";

import { useEffect, useState } from "react";
import { fraseDaContagem, partesDaContagem } from "@/lib/contagem";

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

  const { dias, horas, minutos } = partesDaContagem(falta);
  const partes = [
    { valor: dias, rotulo: "dias" },
    { valor: horas, rotulo: "horas" },
    { valor: minutos, rotulo: "min" },
  ];

  return (
    <>
      {/* Uma frase só para o leitor de tela; as caixas ficam fora da leitura.
          Sem região viva: a contagem muda a cada minuto e não deve falar
          sozinha (ADR-0015). */}
      <p className="sr-only">{fraseDaContagem(falta)}</p>
      <div className="grid max-w-xs grid-cols-3 gap-2 sm:gap-3" aria-hidden>
        {partes.map(({ valor, rotulo }) => (
          <div key={rotulo} className="rounded-xl border bg-background/80 px-2 py-2.5 text-center">
            <p className="vitrine-texto-gradiente text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
              {String(valor).padStart(2, "0")}
            </p>
            <p className="text-xs text-muted-foreground">{rotulo}</p>
          </div>
        ))}
      </div>
    </>
  );
}
