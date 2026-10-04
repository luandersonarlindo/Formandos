"use client";

import { useActionState, useEffect, useState } from "react";
import { LoaderCircle, MessageCircleQuestion, Send } from "lucide-react";
import { enviarDuvida } from "@/actions/duvidas";
import type { EstadoForm } from "@/actions/tipos";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const inicial: EstadoForm = {};

export function FormNovaDuvida() {
  const [estado, acao, pendente] = useActionState(enviarDuvida, inicial);
  // Campo controlado, e não com `defaultValue`: quando o envio dá certo o React
  // esvazia o campo sozinho, e limpeza programática não dispara `onChange`. Com
  // `defaultValue`, o contador ficava mostrando o tamanho do texto anterior.
  const [texto, setTexto] = useState("");

  // O servidor devolve `valor` quando rejeita o envio, para a pessoa não perder
  // o que escreveu. Quando aceita, não devolve nada e o campo é zerado.
  useEffect(() => {
    setTexto(estado.valor ?? "");
  }, [estado]);

  return (
    <form action={acao} className="flex flex-col gap-2">
      <Label htmlFor="texto-duvida" className="gap-2">
        <span className="flex size-7 items-center justify-center rounded-md border bg-muted/50 text-[var(--vitrine-a)]">
          <MessageCircleQuestion className="size-4" aria-hidden />
        </span>
        Envie a sua dúvida
      </Label>
      <Textarea
        id="texto-duvida"
        name="conteudo"
        maxLength={500}
        rows={3}
        placeholder="Ex.: Qual é o prazo final para enviar as fotos do telão?"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
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
          {texto.length}/500
        </span>
      </div>
    </form>
  );
}
