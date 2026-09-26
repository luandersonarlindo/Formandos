"use client";

import { useActionState } from "react";
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
  children,
}: FormAcaoProps) {
  const [estado, formAcao, pendente] = useActionState(acao, inicial);

  return (
    <form action={formAcao} className={cn("grid gap-3", className)}>
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
