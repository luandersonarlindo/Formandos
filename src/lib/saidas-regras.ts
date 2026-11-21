// Regras das saídas do caixa (ADR-0022), sem banco.

export const OUTRAS_DESPESAS = "Outras despesas";
export const FRASE_SALDO = "Não é o saldo do banco: é o que a tesouraria lançou no site.";

export type Saida = {
  id: string;
  descricao: string;
  valor: number;
  pagoEm: string; // AAAA-MM-DD
  referencia: string | null;
  soComissao: boolean;
  fornecedorId: string | null;
  fornecedor: string | null;
};

// O que a turma vê de uma saída: sem referência e, na "só da comissão", sem
// descrição nem fornecedor. O valor sempre aparece.
export type SaidaDaTurma = { id: string; descricao: string; valor: number; pagoEm: string; fornecedor: string | null };

export function saidaParaTurma(s: Saida): SaidaDaTurma {
  return s.soComissao
    ? { id: s.id, descricao: OUTRAS_DESPESAS, valor: s.valor, pagoEm: s.pagoEm, fornecedor: null }
    : { id: s.id, descricao: s.descricao, valor: s.valor, pagoEm: s.pagoEm, fornecedor: s.fornecedor };
}

// O que vai para o histórico da turma: a "só da comissão" nunca leva a descrição.
export function detalheAuditoria(s: Pick<Saida, "descricao" | "valor" | "pagoEm" | "soComissao" | "fornecedor">) {
  return {
    descricao: s.soComissao ? OUTRAS_DESPESAS : s.descricao,
    valor: s.valor,
    pagoEm: s.pagoEm,
    fornecedor: s.soComissao ? null : s.fornecedor,
  };
}

const centavos = (v: number) => Math.round(v * 100) / 100;

export function totalSaidas(saidas: { valor: number }[]): number {
  return centavos(saidas.reduce((s, x) => s + x.valor, 0));
}

export function saldoCaixa(confirmado: number, saidas: number): number {
  return centavos(confirmado - saidas);
}

export type Fornecedor = { id: string; nome: string; status: string; valorOrcado: number | null };
export type ResumoFornecedor = { id: string; nome: string; contratado: number | null; pago: number; falta: number | null };

// Contratado, pago e falta por fornecedor, para a tesouraria. Entra quem está
// marcado como contratado ou tem alguma saída. "Falta" só existe com valor
// orçado; pagar além do orçado dá falta zero, nunca negativa.
export function resumoPorFornecedor(fornecedores: Fornecedor[], saidas: Pick<Saida, "fornecedorId" | "valor">[]): ResumoFornecedor[] {
  const pago = new Map<string, number>();
  for (const s of saidas) {
    if (s.fornecedorId) pago.set(s.fornecedorId, (pago.get(s.fornecedorId) ?? 0) + s.valor);
  }
  return fornecedores
    .filter((f) => f.status === "contratado" || pago.has(f.id))
    .map((f) => {
      const p = centavos(pago.get(f.id) ?? 0);
      const contratado = f.valorOrcado;
      return {
        id: f.id,
        nome: f.nome,
        contratado,
        pago: p,
        falta: contratado === null ? null : Math.max(0, centavos(contratado - p)),
      };
    });
}
