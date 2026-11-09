"use client";

import { CalendarClock, CircleCheck, ExternalLink, Gavel, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatarDataHora } from "@/lib/datas";
import { formatarReal } from "@/lib/orcamento";
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
  const { id, titulo, tipo, opcoes, decisao, encerrada, prazo, quorumPct, votantes, membros } =
    enquete;
  const decidida = decisao.length > 0;
  const fechada = decidida || encerrada;
  const respondida = selecionadas.length > 0;
  const temRegra = Boolean(prazo || quorumPct);

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
            ) : encerrada ? (
              <Badge variant="secondary" className="shrink-0">
                <Lock aria-hidden /> Encerrada
              </Badge>
            ) : (
              respondida && (
                <Badge variant="secondary" role="status" className="shrink-0 text-emerald-700 dark:text-emerald-400">
                  <CircleCheck aria-hidden /> Respondida
                </Badge>
              )
            )}
          </div>
          <CardDescription>
            {decidida
              ? "A comissão já decidiu esta pergunta, então a votação está encerrada."
              : encerrada
                ? "O prazo terminou. Agora a comissão fixa a decisão."
                : tipo === "unica"
                  ? "Escolha uma opção."
                  : "Você pode escolher várias opções."}
          </CardDescription>
          {decidida && enquete.justificativa && (
            <p className="mt-1 text-sm text-pretty">
              Motivo da comissão: “{enquete.justificativa}”
            </p>
          )}
          {/* Regra combinada e participação (ADR-0003): a turma vê antes de
              votar quando fecha, quanto precisa e quantos já votaram. */}
          {temRegra && !decidida && (
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {prazo && (
                <span className="inline-flex items-center gap-1">
                  <CalendarClock className="size-3.5" aria-hidden />
                  {encerrada ? "fechou em " : "fecha em "}
                  {formatarDataHora.format(new Date(prazo))}
                </span>
              )}
              {quorumPct && <span>precisa de {quorumPct}% da turma votando</span>}
            </p>
          )}
          <div className="mt-2 flex items-center gap-2">
            <Progress
              className="h-1.5 flex-1"
              value={membros === 0 ? 0 : (votantes / membros) * 100}
              aria-label={`${votantes} de ${membros} votaram nesta pergunta`}
            />
            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
              {votantes} de {membros} votaram
            </span>
          </div>
        </CardHeader>
        <CardContent className="mt-4 flex flex-col gap-2">
          {opcoes.map((o) => (
            <label
              key={o.id}
              className={
                fechada
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
                disabled={fechada}
                className="size-4 accent-[var(--vitrine-a)]"
              />
              <span className="flex min-w-0 flex-col">
                <span>{o.texto}</span>
                {(o.valorPessoa != null || o.link) && (
                  <span className="flex flex-wrap items-center gap-x-2 text-xs font-normal text-muted-foreground">
                    {o.valorPessoa != null && (
                      <span className="tabular-nums">
                        {formatarReal.format(o.valorPessoa)} por pessoa
                      </span>
                    )}
                    {o.link && (
                      <a
                        href={o.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 underline underline-offset-2 hover:text-foreground"
                        onClick={(e) => e.stopPropagation()}
                      >
                        ver detalhes <ExternalLink className="size-3" aria-hidden />
                        <span className="sr-only">(abre em outra aba)</span>
                      </a>
                    )}
                  </span>
                )}
              </span>
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