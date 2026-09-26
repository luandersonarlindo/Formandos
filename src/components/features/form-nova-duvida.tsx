"use client";

import { useActionState, useState } from "react";
import { LoaderCircle, MessageCircleQuestion, Send } from "lucide-react";
import { enviarDuvida } from "@/actions/duvidas";
import type { EstadoForm } from "@/actions/tipos";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const inicial: EstadoForm = {};

export function FormNovaDuvida() {
  const [estado, acao, pendente] = useActionState(enviarDuvida, inicial);
  const [tamanho, setTamanho] = useState(estado.valor?.length ?? 0);

  return (
    <form action={acao} className="flex flex-col gap-2">
      <Label htmlFor="conteudo" className="gap-2">
        <span className="flex size-7 items-center justify-center rounded-md border bg-muted/50 text-[var(--vitrine-a)]">
          <MessageCircleQuestion className="size-4" aria-hidden />
        </span>
        Envie a sua dúvida
      </Label>
      <Textarea
        id="conteudo"
        name="conteudo"
        maxLength={500}
        rows={3}
        placeholder="Ex.: Qual é o prazo final para enviar as fotos do telão?"
        defaultValue={estado.valor}
        onChange={(e) => setTamanho(e.target.value.length)}
        required
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pendente}>
          {pendente ? <LoaderCircle className="animate-spin" aria-hidden /> : <Send aria-hidden />}
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
        <span className="ml-auto text-xs text-muted-foreground tabular-nums" aria-hidden>
          {tamanho}/500
        </span>
      </div>
    </form>
  );
}
