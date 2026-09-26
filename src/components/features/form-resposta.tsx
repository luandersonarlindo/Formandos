"use client";

import { useActionState } from "react";
import { responderDuvida } from "@/actions/admin";
import type { EstadoForm } from "@/actions/tipos";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const inicial: EstadoForm = {};

export function FormResposta({
  duvidaId,
  resposta,
}: {
  duvidaId: string;
  resposta: string | null;
}) {
  const [estado, acao, pendente] = useActionState(responderDuvida, inicial);

  return (
    <form action={acao} className="flex flex-col gap-2">
      <input type="hidden" name="duvidaId" value={duvidaId} />
      <Label htmlFor={`resposta-${duvidaId}`}>Resposta oficial</Label>
      <Textarea
        id={`resposta-${duvidaId}`}
        name="resposta"
        maxLength={1000}
        rows={3}
        defaultValue={resposta ?? ""}
        placeholder="Deixe em branco para remover a resposta."
      />
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={pendente}>
          {pendente ? "Salvando…" : "Salvar resposta"}
        </Button>
        <p
          role="status"
          className={
            estado.erro
              ? "text-sm text-destructive"
              : "text-sm text-muted-foreground"
          }
        >
          {estado.erro ?? estado.ok}
        </p>
      </div>
    </form>
  );
}
