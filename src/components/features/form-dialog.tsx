"use client";

import * as React from "react";
import type { EstadoForm } from "@/actions/tipos";
import { FormAcao } from "@/components/features/form-acao";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
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
  variante?: "default" | "outline" | "destructive" | "ghost" | "secondary";
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
  /** Modo controlado, sem botão próprio: quem abre é outro elemento (ex.: um
   *  item do menu "⋯", ver MenuAcoes). */
  aberto?: boolean;
  onAbertoChange?: (aberto: boolean) => void;
  semGatilho?: boolean;
  /** Classe extra no botão que abre o diálogo. */
  className?: string;
};

// Qualquer edição ou ação que precisa de um formulário, aberta em diálogo, em
// vez de <details> solto na página. O tempo todo a lista não se move, a
// largura é a do diálogo e o foco volta para a lista ao fechar. O rodapé tem
// "Cancelar" e o submit à direita; o sucesso fecha o diálogo e vira toast
// (FormAcao). Formulários longos: uma coluna no celular e os opcionais em
// "Mais detalhes" (decisão D-04 do plano de UX: Dialog sempre, sem Drawer).
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
  aberto: abertoFora,
  onAbertoChange,
  semGatilho = false,
  className,
}: FormDialogProps) {
  const [abertoAqui, setAbertoAqui] = React.useState(false);
  const aberto = abertoFora ?? abertoAqui;
  const setAberto = (valor: boolean) => {
    setAbertoAqui(valor);
    onAbertoChange?.(valor);
  };

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      {!semGatilho && (
        <DialogTrigger asChild>
          <Button type="button" variant={variante} size={tamanho} className={cn("shrink-0", className)}>
            {icone}
            {rotulo}
          </Button>
        </DialogTrigger>
      )}
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
          rodapeDireita
          acoesExtras={
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
          }
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