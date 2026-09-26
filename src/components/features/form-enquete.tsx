"use client";

import { useActionState, useState } from "react";
import { adicionarEnquete } from "@/actions/catalogos";
import type { EstadoForm } from "@/actions/tipos";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const inicial: EstadoForm = {};

export function FormEnquete({ categoriaId }: { categoriaId: string }) {
  const [estado, acao, pendente] = useActionState(adicionarEnquete, inicial);
  const [tipo, setTipo] = useState<"unica" | "multipla">("unica");
  // Se houve erro, o servidor devolve o que foi digitado.
  const v = estado.valores;
  const id = `enq-${categoriaId}`;

  return (
    <form action={acao} className="grid gap-3">
      <input type="hidden" name="categoriaId" value={categoriaId} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${id}-titulo`}>Pergunta</Label>
        <Input id={`${id}-titulo`} name="titulo" defaultValue={v?.titulo} maxLength={500} required />
      </div>
      <fieldset className="flex flex-wrap gap-4 text-sm">
        <legend className="mb-1.5 text-sm font-medium">Tipo</legend>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="tipo"
            value="unica"
            checked={tipo === "unica"}
            onChange={() => setTipo("unica")}
            className="accent-[var(--vitrine-a)]"
          />
          Escolha única
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="tipo"
            value="multipla"
            checked={tipo === "multipla"}
            onChange={() => setTipo("multipla")}
            className="accent-[var(--vitrine-a)]"
          />
          Escolha múltipla
        </label>
      </fieldset>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${id}-opcoes`}>Opções (uma por linha, de 2 a 12)</Label>
        <Textarea id={`${id}-opcoes`} name="opcoes" defaultValue={v?.opcoes} rows={5} required />
      </div>
      {tipo === "multipla" ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${id}-exclusiva`}>
            Opção exclusiva (opcional, ex.: &quot;Sem preferência&quot;)
          </Label>
          <Input id={`${id}-exclusiva`} name="exclusiva" defaultValue={v?.exclusiva} maxLength={255} />
          <p className="text-xs text-muted-foreground">
            Quem marca essa opção não pode marcar as outras.
          </p>
        </div>
      ) : (
        <input type="hidden" name="exclusiva" value="" />
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm" disabled={pendente}>
          {pendente && <LoaderCircle className="animate-spin" aria-hidden />}
          {pendente ? "Adicionando…" : "Adicionar pergunta"}
        </Button>
        <p
          role="status"
          className={estado.erro ? "text-sm text-destructive" : "text-sm text-muted-foreground"}
        >
          {estado.erro ?? estado.ok}
        </p>
      </div>
    </form>
  );
}
