"use client";

import { useActionState, useState } from "react";
import { votar } from "@/actions/votos";
import type { EstadoForm } from "@/actions/tipos";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { EnqueteVotacao } from "@/lib/votacoes";

const inicial: EstadoForm = {};

export function EnqueteCard({ enquete }: { enquete: EnqueteVotacao }) {
  const { id, titulo, tipo, opcoes } = enquete;
  const [selecionadas, setSelecionadas] = useState<string[]>(
    enquete.selecionadas,
  );
  const [estado, acao, pendente] = useActionState(votar, inicial);

  function alternar(opcaoId: string) {
    const exclusiva = opcoes.find((o) => o.id === opcaoId)?.exclusiva ?? false;
    setSelecionadas((atual) => {
      if (tipo === "unica") return [opcaoId];
      if (atual.includes(opcaoId)) return atual.filter((x) => x !== opcaoId);
      // Marcar uma opção exclusiva desmarca as outras, e vice-versa.
      if (exclusiva) return [opcaoId];
      const exclusivas = new Set(
        opcoes.filter((o) => o.exclusiva).map((o) => o.id),
      );
      return [...atual.filter((x) => !exclusivas.has(x)), opcaoId];
    });
  }

  return (
    <Card>
      <form action={acao}>
        <input type="hidden" name="enqueteId" value={id} />
        <fieldset aria-labelledby={`enquete-${id}`}>
          <CardHeader>
            <CardTitle id={`enquete-${id}`}>{titulo}</CardTitle>
            <CardDescription>
              {tipo === "unica"
                ? "Escolha uma opção."
                : "Você pode escolher várias opções."}
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-4 flex flex-col gap-2">
            {opcoes.map((o) => (
              <label
                key={o.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted has-checked:border-primary has-checked:bg-muted"
              >
                <input
                  type={tipo === "unica" ? "radio" : "checkbox"}
                  name="opcaoId"
                  value={o.id}
                  checked={selecionadas.includes(o.id)}
                  onChange={() => alternar(o.id)}
                  className="size-4 accent-primary"
                />
                {o.texto}
              </label>
            ))}
          </CardContent>
        </fieldset>
        <CardFooter className="mt-4 flex items-center gap-3">
          <Button type="submit" disabled={pendente || selecionadas.length === 0}>
            {pendente ? "Salvando…" : "Salvar voto"}
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
        </CardFooter>
      </form>
    </Card>
  );
}
