"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

// "Salvar como PDF" (ADR-0007): abre a impressão do navegador, onde dá para
// escolher "Salvar como PDF" no computador e no celular.
export function BotaoImprimir({ rotulo = "Salvar como PDF" }: { rotulo?: string }) {
  return (
    <Button type="button" onClick={() => window.print()} className="print:hidden">
      <Printer aria-hidden /> {rotulo}
    </Button>
  );
}
