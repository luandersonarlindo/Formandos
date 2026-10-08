"use client";

import * as React from "react";
import type { EstadoForm } from "@/actions/tipos";
import { FormAcao } from "@/components/features/form-acao";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type FormDialogProps = {
  /** Texto do botão que abre o diálogo. */
  rotulo: string;
  /** Ícone antes do texto do botão. */
  icone?: React.ReactNode;
  variante?: "default" | "outline" | "destructive";
  tamanho?: "default" | "sm" | "lg";
  titulo: string;
  descricao?: string;
  acao: (estado: EstadoForm, formData: FormData) => Promise<EstadoForm>;
  /** Campos ocultos que a ação espera. */
  campos?: Record<string, string>;
  rotuloSubmit?: string;
  rotuloPendente?: string;
  /** Largura extra para formulários grandes (ex.: salvarEvento, atualizarEnquete). */
  dialogClassName?: string;
  /** Campos do formulário (Input, Textarea, Select…). Entram como children. */
  children?: React.ReactNode;
};

// Qualquer edição ou ação que precisa de um formulário, aberta em diálogo, em
// vez de <details> solto na página. O tempo todo a lista não se move, a
// largura é a do diálogo e o foco volta para a lista ao fechar.
export function FormDialog({
  rotulo,
  icone,
  variante = "outline",
  tamanho = "sm",
  titulo,
  descricao,
  acao,
  campos,
  rotuloSubmit = "Salvar",
  rotuloPendente = "Salvando…",
  dialogClassName,
  children,
}: FormDialogProps) {
  const [aberto, setAberto] = React.useState(false);

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button type="button" variant={variante} size={tamanho} className={cn("shrink-0")}>
          {icone}
          {rotulo}
        </Button>
      </DialogTrigger>
      <DialogContent className={dialogClassName}>
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          {descricao && <DialogDescription>{descricao}</DialogDescription>}
        </DialogHeader>
        <FormAcao
          acao={acao}
          rotulo={rotuloSubmit}
          rotuloPendente={rotuloPendente}
          onSucesso={() => setAberto(false)}
        >
          {Object.entries(campos ?? {}).map(([nome, valor]) => (
            <input key={nome} type="hidden" name={nome} value={valor} />
          ))}
          {children}
        </FormAcao>
      </DialogContent>
    </Dialog>
  );
}