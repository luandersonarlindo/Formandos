"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

// Copia um texto para a área de transferência. `montarTexto` roda só no clique,
// para poder usar window.location (o endereço do site) sem quebrar o SSR.
export function BotaoCopiar({
  texto,
  montarTexto,
  rotulo,
  rotuloCopiado = "Copiado!",
  variante = "default",
}: {
  texto?: string;
  montarTexto?: () => string;
  rotulo: string;
  rotuloCopiado?: string;
  variante?: "default" | "outline";
}) {
  const [estado, setEstado] = useState<"parado" | "copiado" | "erro">("parado");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(montarTexto ? montarTexto() : (texto ?? ""));
      setEstado("copiado");
    } catch {
      setEstado("erro");
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setEstado("parado"), 2500);
  }

  return (
    <>
      <Button type="button" variant={variante} onClick={copiar}>
        {estado === "copiado" ? <Check aria-hidden /> : <Copy aria-hidden />}
        {estado === "copiado" ? rotuloCopiado : rotulo}
      </Button>
      <span role="status" className="sr-only">
        {estado === "copiado" ? rotuloCopiado : estado === "erro" ? "Não foi possível copiar." : ""}
      </span>
      {estado === "erro" && (
        <span className="text-sm text-destructive" aria-hidden>
          Não foi possível copiar. Selecione o texto e copie à mão.
        </span>
      )}
    </>
  );
}
