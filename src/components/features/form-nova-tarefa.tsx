"use client";

import { useActionState } from "react";
import { criarTarefa } from "@/actions/tarefas";
import type { EstadoForm } from "@/actions/tipos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";

const inicial: EstadoForm = {};

export function FormNovaTarefa({
  membros,
}: {
  membros: { id: string; nome: string }[];
}) {
  const [estado, acao, pendente] = useActionState(criarTarefa, inicial);

  return (
    <form action={acao} className="grid gap-3 md:grid-cols-2">
      <div className="flex flex-col gap-1.5 md:col-span-2">
        <Label htmlFor="titulo">Título</Label>
        <Input
          id="titulo"
          name="titulo"
          maxLength={255}
          placeholder="Ex.: Contratar o fotógrafo"
          required
        />
      </div>
      <div className="flex flex-col gap-1.5 md:col-span-2">
        <Label htmlFor="descricao">Descrição (opcional)</Label>
        <Textarea id="descricao" name="descricao" rows={2} maxLength={1000} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="responsavelId">Responsável (opcional)</Label>
        <NativeSelect id="responsavelId" name="responsavelId" defaultValue="">
          <option value="">Ninguém</option>
          {membros.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nome}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="prazo">Prazo (opcional)</Label>
        <Input id="prazo" name="prazo" type="date" />
      </div>
      <div className="flex items-center gap-3 md:col-span-2">
        <Button type="submit" disabled={pendente}>
          {pendente ? "Criando…" : "Criar tarefa"}
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
