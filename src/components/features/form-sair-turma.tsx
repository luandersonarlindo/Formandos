"use client";

import { useActionState } from "react";
import { sairDaTurma } from "@/actions/turmas";
import type { EstadoForm } from "@/actions/tipos";
import { Button } from "@/components/ui/button";

const inicial: EstadoForm = {};

export function FormSairTurma() {
  const [estado, acao, pendente] = useActionState(sairDaTurma, inicial);
  return (
    <form action={acao} className="flex flex-col items-start gap-2">
      <Button type="submit" variant="outline" disabled={pendente}>
        {pendente ? "Saindo…" : "Sair da turma"}
      </Button>
      {estado.erro && (
        <p role="alert" className="text-sm text-destructive">
          {estado.erro}
        </p>
      )}
    </form>
  );
}
