"use client";

import { useActionState } from "react";
import { LoaderCircle, Megaphone, Send } from "lucide-react";
import { criarAviso } from "@/actions/avisos";
import type { EstadoForm } from "@/actions/tipos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const inicial: EstadoForm = {};

export function FormNovoAviso() {
  const [estado, acao, pendente] = useActionState(criarAviso, inicial);

  return (
    <form action={acao} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="titulo-aviso" className="gap-2">
          <span className="flex size-7 items-center justify-center rounded-md border bg-muted/50 text-[var(--vitrine-a)]">
            <Megaphone className="size-4" aria-hidden />
          </span>
          Título
        </Label>
        <Input id="titulo-aviso" name="titulo" maxLength={200} placeholder="Ex.: Prazo do pagamento do buffet" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="conteudo-aviso">Recado</Label>
        <Textarea
          id="conteudo-aviso"
          name="conteudo"
          maxLength={2000}
          rows={3}
          placeholder="Escreva o recado para a turma."
          required
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pendente}>
          {pendente ? <LoaderCircle className="animate-spin" aria-hidden /> : <Send aria-hidden />}
          {pendente ? "Publicando…" : "Publicar aviso"}
        </Button>
        <p role="status" className={estado.erro ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>
          {estado.erro ?? estado.ok}
        </p>
      </div>
    </form>
  );
}
