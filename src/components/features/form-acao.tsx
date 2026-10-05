"use client";

import { useActionState, useEffect, useRef } from "react";
import type { EstadoForm } from "@/actions/tipos";
import { Check, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FormAcaoProps = {
  acao: (estado: EstadoForm, formData: FormData) => Promise<EstadoForm>;
  rotulo: string;
  rotuloPendente?: string;
  variante?: "default" | "destructive";
  className?: string;
  /** Chamado depois que a ação volta sem erro. Usado para fechar diálogos. */
  onSucesso?: () => void;
  children: React.ReactNode;
};

const inicial: EstadoForm = {};

// Formulário genérico ligado a uma Server Action, com mensagem de sucesso ou
// erro. Os campos (Input, Textarea…) entram como `children`.
export function FormAcao({
  acao,
  rotulo,
  rotuloPendente = "Salvando…",
  variante = "default",
  className,
  onSucesso,
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
    if (estado.ok) sucesso.current?.();
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
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm" variant={variante} disabled={pendente}>
          {pendente && <LoaderCircle className="animate-spin" aria-hidden />}
          {pendente ? rotuloPendente : rotulo}
        </Button>
        <p
          role="status"
          className={
            estado.erro
              ? "text-sm text-destructive"
              : "flex items-center gap-1.5 text-sm text-muted-foreground"
          }
        >
          {!estado.erro && estado.ok && <Check className="size-4 text-emerald-600" aria-hidden />}
          {estado.erro ?? estado.ok}
        </p>
      </div>
    </form>
  );
}
