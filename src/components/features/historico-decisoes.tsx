import { formatarDataHora } from "@/lib/datas";
import { TEXTO_MOTIVO, type MotivoForaDaRegra } from "@/lib/decisao-regras";
import { formatarReal } from "@/lib/orcamento";
import type { ItemHistorico } from "@/lib/auditoria";

// Histórico de uma pergunta que a turma vê (ADR-0003): quem fixou, reabriu,
// mudou a regra ou o valor de uma opção, com os números do dia. Vem de
// `listarHistoricoDecisoes`, que só traz as ações liberadas para a turma.

type Detalhe = {
  pergunta?: string;
  escolhidas?: string[];
  votantes?: number;
  membros?: number;
  foraDaRegra?: MotivoForaDaRegra[];
  justificativa?: string | null;
  antes?: { prazo: string | null; quorumPct: number | null } | number | null;
  depois?: { prazo: string | null; quorumPct: number | null } | number | null;
  opcao?: string;
};

// "2026-12-12T23:59" (horário de Brasília) → "12/12/2026 às 23:59".
function prazoTexto(local: string | null) {
  if (!local) return "sem prazo";
  const [data, hora] = local.split("T");
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano} às ${hora}`;
}

const quorumTexto = (q: number | null) => (q ? `${q}%` : "sem quórum");
const valorTexto = (v: unknown) => (typeof v === "number" ? formatarReal.format(v) : "sem valor");
const lista = (itens?: string[]) => (itens ?? []).map((t) => `“${t}”`).join(", ");

function Descricao({ item }: { item: ItemHistorico }) {
  const d = item.detalhe as Detalhe;
  const autor = item.autor ?? "Ex-membro da comissão";
  switch (item.acao) {
    case "decisao.fixada":
      return (
        <>
          <p>
            <strong className="font-medium">{autor}</strong> fixou {lista(d.escolhidas)}.{" "}
            <span className="text-muted-foreground tabular-nums">
              Votaram {d.votantes} de {d.membros}.
            </span>
          </p>
          {d.foraDaRegra && d.foraDaRegra.length > 0 && (
            <p className="text-amber-700 dark:text-amber-400">
              Fora da regra: {d.foraDaRegra.map((m) => TEXTO_MOTIVO[m]).join(" ")}
            </p>
          )}
          {d.justificativa && (
            <p className="text-muted-foreground">Motivo: “{d.justificativa}”</p>
          )}
        </>
      );
    case "decisao.reaberta":
      return (
        <p>
          <strong className="font-medium">{autor}</strong> reabriu a votação (estava fixada em{" "}
          {lista(d.escolhidas)}).
        </p>
      );
    case "regra.alterada": {
      const antes = d.antes as { prazo: string | null; quorumPct: number | null };
      const depois = d.depois as { prazo: string | null; quorumPct: number | null };
      const mudancas: string[] = [];
      if (antes.prazo !== depois.prazo) {
        mudancas.push(`prazo de ${prazoTexto(antes.prazo)} para ${prazoTexto(depois.prazo)}`);
      }
      if (antes.quorumPct !== depois.quorumPct) {
        mudancas.push(
          `quórum de ${quorumTexto(antes.quorumPct)} para ${quorumTexto(depois.quorumPct)}`,
        );
      }
      return (
        <p>
          <strong className="font-medium">{autor}</strong> mudou a regra: {mudancas.join("; ")}.
        </p>
      );
    }
    case "opcao.valor_alterado":
      return (
        <p>
          <strong className="font-medium">{autor}</strong> mudou o valor de “{d.opcao}”: de{" "}
          {valorTexto(d.antes)} para {valorTexto(d.depois)} por pessoa.
        </p>
      );
  }
}

export function HistoricoDecisoes({
  itens,
  mostrarPergunta = false,
}: {
  itens: ItemHistorico[];
  mostrarPergunta?: boolean;
}) {
  if (itens.length === 0) {
    return <p className="text-sm text-muted-foreground">Nada registrado ainda.</p>;
  }
  return (
    <ol className="flex flex-col gap-3 border-l pl-4">
      {itens.map((item) => (
        <li key={item.id} className="flex flex-col gap-0.5 text-sm">
          <time className="text-xs text-muted-foreground" dateTime={new Date(item.quando).toISOString()}>
            {formatarDataHora.format(new Date(item.quando))}
          </time>
          {mostrarPergunta && (item.detalhe as Detalhe).pergunta && (
            <p className="text-xs text-muted-foreground">{(item.detalhe as Detalhe).pergunta}</p>
          )}
          <Descricao item={item} />
        </li>
      ))}
    </ol>
  );
}
