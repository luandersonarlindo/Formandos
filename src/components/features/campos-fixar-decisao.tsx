"use client";

import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  avaliarDecisao,
  JUSTIFICATIVA_MAX,
  JUSTIFICATIVA_MIN,
  TEXTO_MOTIVO,
} from "@/lib/decisao-regras";

// Campos do diálogo "Fixar decisão" (ADR-0003). Mostra, antes de confirmar,
// se a escolha foge da regra combinada e por quê. Com algum motivo, a
// justificativa vira obrigatória: a turma lê esse texto no histórico.
// A conta é a mesma do servidor (avaliarDecisao), que confere de novo ao salvar.
export function CamposFixarDecisao({
  tipo,
  opcoes,
  sugeridas,
  votantes,
  membros,
  prazo,
  quorumPct,
  justificativaAtual,
}: {
  tipo: "unica" | "multipla";
  opcoes: { id: string; texto: string; votos: number }[];
  sugeridas: string[];
  votantes: number;
  membros: number;
  prazo: string | null;
  quorumPct: number | null;
  justificativaAtual: string | null;
}) {
  const [escolhidas, setEscolhidas] = useState<string[]>(sugeridas);
  const [justificativa, setJustificativa] = useState(justificativaAtual ?? "");
  const maisVotos = Math.max(0, ...opcoes.map((o) => o.votos));

  const motivos =
    escolhidas.length === 0
      ? []
      : avaliarDecisao({
          contagem: opcoes.map((o) => ({ id: o.id, votos: o.votos })),
          escolhidas,
          votantes,
          membros,
          regra: { prazo: prazo ? new Date(prazo) : null, quorumPct },
          agora: new Date(),
        });
  const exige = motivos.length > 0;

  function alternar(id: string) {
    if (tipo === "unica") return setEscolhidas([id]);
    setEscolhidas((atual) =>
      atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id],
    );
  }

  return (
    <>
      <fieldset className="grid gap-2">
        <legend className="sr-only">Opção escolhida</legend>
        {opcoes.map((o) => (
          <label
            key={o.id}
            className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted has-checked:border-[var(--vitrine-a)] has-checked:bg-[color-mix(in_oklch,var(--vitrine-a)_8%,transparent)] has-checked:font-medium"
          >
            <input
              type={tipo === "unica" ? "radio" : "checkbox"}
              name="opcaoId"
              value={o.id}
              checked={escolhidas.includes(o.id)}
              onChange={() => alternar(o.id)}
              required={tipo === "unica"}
              className="size-4 accent-[var(--vitrine-a)]"
            />
            <span className="min-w-0 flex-1">{o.texto}</span>
            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
              {o.votos} {o.votos === 1 ? "voto" : "votos"}
              {maisVotos > 0 && o.votos === maisVotos ? " · mais votada" : ""}
            </span>
          </label>
        ))}
      </fieldset>

      <p className="text-sm text-muted-foreground tabular-nums">
        Votaram {votantes} de {membros}
        {quorumPct ? ` · quórum combinado: ${quorumPct}%` : ""}
      </p>

      {exige && (
        <div
          role="status"
          className="flex gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden />
          <div>
            <p className="font-medium">Esta decisão foge da regra combinada.</p>
            <ul className="mt-1 list-disc pl-4 text-muted-foreground">
              {motivos.map((m) => (
                <li key={m}>{TEXTO_MOTIVO[m]}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="justificativa" className="text-xs">
          {exige ? "Motivo da decisão (obrigatório)" : "Motivo da decisão (opcional)"}
        </Label>
        <Textarea
          id="justificativa"
          name="justificativa"
          value={justificativa}
          onChange={(e) => setJustificativa(e.target.value)}
          minLength={exige ? JUSTIFICATIVA_MIN : undefined}
          maxLength={JUSTIFICATIVA_MAX}
          required={exige}
          placeholder={exige ? "Ex.: o buffet mais votado não tem a data livre." : undefined}
        />
        <p className="text-xs text-muted-foreground">
          A turma vê este texto junto com a decisão e no histórico.
        </p>
      </div>
    </>
  );
}
