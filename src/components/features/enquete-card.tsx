"use client";

import { CalendarClock, CircleCheck, ExternalLink, EyeOff, Gavel, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatarDataHora } from "@/lib/datas";
import { formatarReal } from "@/lib/orcamento";
import type { EnqueteVotacao } from "@/lib/votacoes";

type EnqueteCardProps = {
  enquete: EnqueteVotacao;
  selecionadas: string[];
  aoAlternar: (enqueteId: string, opcaoId: string) => void;
  // Observador (ADR-0012): vê a pergunta, mas as opções ficam travadas.
  somenteLeitura?: boolean;
};

export function EnqueteCard({
  enquete,
  selecionadas,
  aoAlternar,
  somenteLeitura = false,
}: EnqueteCardProps) {
  const { id, titulo, tipo, opcoes, decisao, encerrada, prazo, quorumPct, secreto, votantes, membros } =
    enquete;
  const decidida = decisao.length > 0;
  const fechada = decidida || encerrada;
  const respondida = selecionadas.length > 0;

  return (
    <Card>
      <fieldset aria-labelledby={`enquete-${id}`}>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <CardTitle nivel={3} id={`enquete-${id}`} className="text-base">
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
                <Badge variant="success" className="shrink-0">
                  <CircleCheck aria-hidden /> Respondida
                </Badge>
              )
            )}
          </div>
          {/* "Escolha uma opção." saiu: o botão redondo já diz isso. Só o
              que muda o jeito de votar fica escrito. */}
          {(fechada || tipo !== "unica") && (
            <CardDescription>
              {decidida
                ? "A comissão já decidiu esta pergunta, então a votação está encerrada."
                : encerrada
                  ? "O prazo terminou. Agora a comissão fixa a decisão."
                  : "Você pode escolher várias opções."}
            </CardDescription>
          )}
          {decidida && enquete.justificativa && (
            <p className="mt-1 text-sm text-pretty">
              Motivo da comissão: “{enquete.justificativa}”
            </p>
          )}
          {/* Voto secreto (ADR-0010): a pessoa lê antes de votar. */}
          {secreto && (
            <p className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
              <EyeOff className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              <span>
                <strong className="font-medium text-foreground">Voto secreto.</strong> Ninguém vê
                sua escolha, nem a comissão. Aparece só que você votou.
              </span>
            </p>
          )}
          {/* Regra combinada e participação (ADR-0003) numa linha só: quando
              fecha, quanto precisa e quantos já votaram. */}
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {prazo && !decidida && (
              <span className="inline-flex items-center gap-1">
                <CalendarClock className="size-3.5" aria-hidden />
                {encerrada ? "fechou em " : "fecha em "}
                {formatarDataHora.format(new Date(prazo))}
              </span>
            )}
            {quorumPct && !decidida && <span>precisa de {quorumPct}% da turma votando</span>}
            <span className="tabular-nums">
              {votantes} de {membros} votaram
            </span>
          </p>
        </CardHeader>
        <CardContent className="mt-3 flex flex-col gap-2">
          {opcoes.map((o) => (
            <label
              key={o.id}
              className={
                fechada
                  ? decisao.includes(o.id)
                    ? "flex min-h-11 items-center gap-3 rounded-lg border border-primary bg-primary/5 px-3 py-2 text-sm font-medium"
                    : "flex min-h-11 items-center gap-3 rounded-lg border px-3 py-2 text-sm text-muted-foreground"
                  : // 44px no toque (DESIGN.md): a linha inteira é o alvo do voto.
                    "flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted has-checked:border-primary has-checked:bg-primary/5 has-checked:font-medium has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50 pointer-coarse:py-3"
              }
            >
              <input
                type={tipo === "unica" ? "radio" : "checkbox"}
                name={`opcao-${id}`}
                value={o.id}
                checked={selecionadas.includes(o.id)}
                onChange={() => aoAlternar(id, o.id)}
                disabled={fechada || somenteLeitura}
                className="size-4 shrink-0 accent-primary"
              />
              <span className="flex min-w-0 flex-col">
                <span>{o.texto}</span>
                {(o.valorPessoa != null || o.link) && (
                  <span className="flex flex-wrap items-center gap-x-2 text-xs font-normal text-muted-foreground">
                    {o.valorPessoa != null && (
                      <span className="tabular-nums">
                        {formatarReal.format(o.valorPessoa)} por pessoa, no total
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
                <span className="ml-auto flex shrink-0 items-center gap-1 text-xs text-primary">
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