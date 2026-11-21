"use client";

import { useActionState, useEffect, useRef } from "react";
import type { EstadoForm } from "@/actions/tipos";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type FormAcaoProps = {
  acao: (estado: EstadoForm, formData: FormData) => Promise<EstadoForm>;
  rotulo: string;
  rotuloPendente?: string;
  variante?: "default" | "destructive" | "outline";
  className?: string;
  /** Chamado depois que a ação volta sem erro. Usado para fechar diálogos. */
  onSucesso?: () => void;
  /** Botões antes do submit, na mesma linha (ex.: "Cancelar" do diálogo). */
  acoesExtras?: React.ReactNode;
  /** Alinha os botões à direita, como no rodapé de um diálogo. */
  rodapeDireita?: boolean;
  children: React.ReactNode;
};

const inicial: EstadoForm = {};

// Formulário genérico ligado a uma Server Action. Os campos (Input, Textarea…)
// entram como `children`. O sucesso aparece num toast (o Sonner anuncia com
// aria-live, sem roubar o foco); o erro fica junto do botão, visível enquanto a
// pessoa corrige.
export function FormAcao({
  acao,
  rotulo,
  rotuloPendente = "Salvando…",
  variante = "default",
  className,
  onSucesso,
  acoesExtras,
  rodapeDireita = false,
  children,
}: FormAcaoProps) {
  const [estado, formAcao, pendente] = useActionState(acao, inicial);
  const formulario = useRef<HTMLFormElement>(null);
  const enviados = useRef<[string, string][]>([]);
  const sucesso = useRef(onSucesso);
  sucesso.current = onSucesso;

  // O React 19 limpa os campos depois de toda ação. Com erro de validação isso
  // apagaria o que a pessoa digitou, então os textos enviados são devolvidos.
  useEffect(() => {
    if (!estado.erro || !formulario.current) return;
    for (const [nome, valor] of enviados.current) {
      const campo = formulario.current.elements.namedItem(nome);
      if (
        (campo instanceof HTMLInputElement || campo instanceof HTMLTextAreaElement) &&
        !["password", "checkbox", "radio", "file", "hidden"].includes(campo.type)
      ) {
        campo.value = valor;
      }
    }
  }, [estado]);

  useEffect(() => {
    if (!estado.ok) return;
    toast.success(estado.ok);
    sucesso.current?.();
  }, [estado]);

  return (
    <form
      ref={formulario}
      action={formAcao}
      onSubmit={(e) => {
        enviados.current = [...new FormData(e.currentTarget)].filter(
          (par): par is [string, string] => typeof par[1] === "string",
        );
      }}
      className={cn("grid gap-3", className)}
    >
      {children}
      {estado.erro && (
        <p role="alert" className="text-sm text-destructive">
          {estado.erro}
        </p>
      )}
      <div
        className={cn(
          "flex flex-wrap gap-2",
          rodapeDireita ? "flex-col-reverse sm:flex-row sm:items-center sm:justify-end" : "items-center",
        )}
      >
        {acoesExtras}
        <Button type="submit" size={rodapeDireita ? "default" : "sm"} variant={variante} disabled={pendente}>
          {pendente && <Spinner />}
          {pendente ? rotuloPendente : rotulo}
        </Button>
      </div>
    </form>
  );
}
