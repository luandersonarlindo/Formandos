import { formatarDataHora } from "@/lib/datas";
import type { MudancaPlano } from "@/lib/auditoria";
import { formatarReal } from "@/lib/orcamento";
import { dataBr } from "@/lib/situacao-regras";

// "Mudanças no plano" (ADR-0005, parte 3): cada vez que a tesouraria montou,
// refez ou ajustou parcelas, com antes e depois. Visível à turma.

type P = { numero: number; valor: number; vencimento: string };

const parcela = (p: P) => `${formatarReal.format(p.valor)} (vence ${dataBr(p.vencimento)})`;

function resumoPlano(lista: P[]) {
  if (lista.length === 0) return "sem plano";
  const total = lista.reduce((s, p) => s + p.valor, 0);
  const iguais = lista.every((p) => p.valor === lista[0].valor);
  return iguais
    ? `${lista.length} × ${formatarReal.format(lista[0].valor)}, a partir de ${dataBr(lista[0].vencimento)}`
    : `${lista.length} parcelas, ${formatarReal.format(total)} no total`;
}

function Descricao({ m }: { m: MudancaPlano }) {
  const autor = m.autor ?? "Conta excluída";
  const d = m.detalhe as { parcela?: number; antes: P | P[]; depois: P | P[] };
  if (typeof d.parcela === "number") {
    return (
      <p>
        <strong className="font-medium">{autor}</strong> ajustou a parcela {d.parcela}: de{" "}
        {parcela(d.antes as P)} para {parcela(d.depois as P)}.
      </p>
    );
  }
  const antes = d.antes as P[];
  const depois = d.depois as P[];
  return (
    <p>
      <strong className="font-medium">{autor}</strong>{" "}
      {antes.length === 0
        ? `montou o plano: ${resumoPlano(depois)}.`
        : `refez o plano: de ${resumoPlano(antes)} para ${resumoPlano(depois)}.`}
    </p>
  );
}

export function MudancasPlano({ itens }: { itens: MudancaPlano[] }) {
  return (
    <ol className="flex flex-col gap-3 border-l pl-4">
      {itens.map((m) => (
        <li key={m.id} className="flex flex-col gap-0.5 text-sm">
          <time className="text-xs text-muted-foreground" dateTime={new Date(m.quando).toISOString()}>
            {formatarDataHora.format(new Date(m.quando))}
          </time>
          <Descricao m={m} />
        </li>
      ))}
    </ol>
  );
}
