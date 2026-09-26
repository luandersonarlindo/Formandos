"use client";

import { useActionState } from "react";
import { enviarDuvida } from "@/actions/duvidas";
import type { EstadoForm } from "@/actions/tipos";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const inicial: EstadoForm = {};

export function FormNovaDuvida() {
  const [estado, acao, pendente] = useActionState(enviarDuvida, inicial);

  return (
    <form action={acao} className="flex flex-col gap-2">
      <Label htmlFor="conteudo">Envie a sua dúvida</Label>
      <Textarea
        id="conteudo"
        name="conteudo"
        maxLength={500}
        rows={3}
        placeholder="Ex.: Qual é o prazo final para enviar as fotos do telão?"
        defaultValue={estado.valor}
        required
      />
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pendente}>
          {pendente ? "Enviando…" : "Enviar dúvida"}
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
