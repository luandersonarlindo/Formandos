"use client";

import * as React from "react";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { mascararValor, valorInicial } from "@/lib/mascara-valor";
import { cn } from "@/lib/utils";

type CampoValorProps = Omit<React.ComponentProps<"input">, "value" | "defaultValue" | "onChange" | "type"> & {
  defaultValue?: string | number | null;
  /** Modo controlado (ex.: editor de opções): valor e aviso de mudança. */
  value?: string;
  onValueChange?: (valor: string) => void;
};

// Campo de dinheiro com "R$" fixo e a máscara pt-BR enquanto digita
// (lib/mascara-valor.ts). Envia o texto mascarado ("1.500,50"), que os
// leitores do servidor já entendem.
export function CampoValor({ defaultValue, value, onValueChange, className, ...props }: CampoValorProps) {
  const [interno, setInterno] = React.useState(() => valorInicial(defaultValue));
  const atual = value !== undefined ? value : interno;

  return (
    <InputGroup className={cn("h-10 pointer-coarse:h-11", className)}>
      <InputGroupAddon>
        <InputGroupText>R$</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput
        {...props}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        className="tabular-nums"
        value={atual}
        onChange={(e) => {
          const nativo = e.nativeEvent as InputEvent;
          const novo = mascararValor(e.target.value, nativo.data === ".");
          if (value === undefined) setInterno(novo);
          onValueChange?.(novo);
        }}
      />
    </InputGroup>
  );
}
