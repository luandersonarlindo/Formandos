// Regras do orçamento de fornecedores, sem acesso ao banco.

export const STATUS_ORCAMENTO = ["cotando", "contratado", "descartado"] as const;
export type StatusOrcamento = (typeof STATUS_ORCAMENTO)[number];

export const ROTULO_ORCAMENTO: Record<StatusOrcamento, string> = {
  cotando: "Cotando",
  contratado: "Contratado",
  descartado: "Descartado",
};

export const formatarReal = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

// O valor chega da tela como texto (aceita vírgula ou ponto); vazio = sem valor
// definido ainda. Só recusa o que não for um número não negativo.
export function lerValorOrcado(texto: string): number | null {
  const limpo = texto.trim().replace(/\./g, "").replace(",", ".");
  if (limpo === "") return null;
  const valor = Number(limpo);
  if (!Number.isFinite(valor) || valor < 0) return null;
  return Math.round(valor * 100) / 100;
}
