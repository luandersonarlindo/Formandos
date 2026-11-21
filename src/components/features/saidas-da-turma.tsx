import { formatarReal } from "@/lib/orcamento";
import type { SaidaDaTurma } from "@/lib/saidas-regras";
import { dataBr } from "@/lib/situacao-regras";

// Lista das saídas do caixa como a turma vê (ADR-0022): sem referência, e
// "Outras despesas" no lugar da descrição das que são só da comissão.
export function SaidasDaTurma({ saidas }: { saidas: SaidaDaTurma[] }) {
  return (
    <ul className="flex flex-col divide-y text-sm">
      {saidas.map((s) => (
        <li key={s.id} className="flex items-baseline gap-3 py-1.5 break-inside-avoid">
          <span className="w-20 shrink-0 text-muted-foreground tabular-nums">{dataBr(s.pagoEm)}</span>
          <span className="min-w-0 flex-1 wrap-break-word">
            {s.descricao}
            {s.fornecedor && <span className="text-muted-foreground"> · {s.fornecedor}</span>}
          </span>
          <span className="tabular-nums">{formatarReal.format(s.valor)}</span>
        </li>
      ))}
    </ul>
  );
}
