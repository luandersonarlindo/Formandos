"use client";

import { CircleCheck, Gavel } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { EnqueteVotacao } from "@/lib/votacoes";

type EnqueteCardProps = {
  enquete: EnqueteVotacao;
  selecionadas: string[];
  aoAlternar: (enqueteId: string, opcaoId: string) => void;
};

export function EnqueteCard({
  enquete,
  selecionadas,
  aoAlternar,
}: EnqueteCardProps) {
  const { id, titulo, tipo, opcoes, decisao } = enquete;
  const decidida = decisao.length > 0;
  const respondida = selecionadas.length > 0;

  return (
    <Card>
      <fieldset aria-labelledby={`enquete-${id}`}>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <CardTitle id={`enquete-${id}`} className="text-base">
              {titulo}
            </CardTitle>
            {decidida ? (
              <Badge className="shrink-0">
                <Gavel aria-hidden /> Decidido
              </Badge>
            ) : (
              respondida && (
                <Badge variant="secondary" className="shrink-0 text-emerald-700 dark:text-emerald-400">
                  <CircleCheck aria-hidden /> Respondida
                </Badge>
              )
            )}
          </div>
          <CardDescription>
            {decidida
              ? "A comissão já decidiu esta pergunta, então a votação está encerrada."
              : tipo === "unica"
                ? "Escolha uma opção."
                : "Você pode escolher várias opções."}
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-4 flex flex-col gap-2">
          {opcoes.map((o) => (
            <label
              key={o.id}
              className={
                decidida
                  ? decisao.includes(o.id)
                    ? "flex items-center gap-3 rounded-lg border border-[var(--vitrine-a)] bg-[color-mix(in_oklch,var(--vitrine-a)_8%,transparent)] px-3 py-2 text-sm font-medium"
                    : "flex items-center gap-3 rounded-lg border px-3 py-2 text-sm text-muted-foreground"
                  : "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted has-checked:border-[var(--vitrine-a)] has-checked:bg-[color-mix(in_oklch,var(--vitrine-a)_8%,transparent)] has-checked:font-medium"
              }
            >
              <input
                type={tipo === "unica" ? "radio" : "checkbox"}
                name={`opcao-${id}`}
                value={o.id}
                checked={selecionadas.includes(o.id)}
                onChange={() => aoAlternar(id, o.id)}
                disabled={decidida}
                className="size-4 accent-[var(--vitrine-a)]"
              />
              {o.texto}
              {decisao.includes(o.id) && (
                <span className="ml-auto flex items-center gap-1 text-xs text-[var(--vitrine-a)]">
                  <Gavel className="size-3.5" aria-hidden /> Escolha da turma
                </span>
              )}
            </label>
          ))}
        </CardContent>
      </fieldset>
    </Card>
  );
}