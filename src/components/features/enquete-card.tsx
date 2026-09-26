"use client";

import { useActionState, useState } from "react";
import { votar } from "@/actions/votos";
import type { EstadoForm } from "@/actions/tipos";
import { Check, CircleCheck, LoaderCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  const respondida = Boolean(estado.ok) || enquete.selecionadas.length > 0;

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
            <div className="flex items-start justify-between gap-3">
              <CardTitle id={`enquete-${id}`} className="text-base">
                {titulo}
              </CardTitle>
              {respondida && (
                <Badge variant="secondary" className="shrink-0 text-emerald-700 dark:text-emerald-400">
                  <CircleCheck aria-hidden /> Respondida
                </Badge>
              )}
            </div>
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
                className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted has-checked:border-[var(--vitrine-a)] has-checked:bg-[color-mix(in_oklch,var(--vitrine-a)_8%,transparent)] has-checked:font-medium"
              >
                <input
                  type={tipo === "unica" ? "radio" : "checkbox"}
                  name="opcaoId"
                  value={o.id}
                  checked={selecionadas.includes(o.id)}
                  onChange={() => alternar(o.id)}
                  className="size-4 accent-[var(--vitrine-a)]"
                />
                {o.texto}
              </label>
            ))}
          </CardContent>
        </fieldset>
        <CardFooter className="mt-4 flex items-center gap-3 border-t-0 bg-transparent px-(--card-spacing) pt-0 pb-(--card-spacing)">
          <Button type="submit" disabled={pendente || selecionadas.length === 0}>
            {pendente ? <LoaderCircle className="animate-spin" aria-hidden /> : <Check aria-hidden />}
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
