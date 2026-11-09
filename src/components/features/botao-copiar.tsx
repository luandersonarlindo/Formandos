"use client";

import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCopiar } from "@/hooks/use-copiar";

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
  const { estado, copiar: copiarTexto } = useCopiar();

  function copiar() {
    copiarTexto(montarTexto ? montarTexto() : (texto ?? ""));
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
