// Regras puras do plano de fim (ADR-0009): prazos de exclusão da turma
// arquivada. Sem acesso ao banco, com teste. Datas em "AAAA-MM-DD" (dia de
// Brasília), sem passar por fuso.

// Opções que a comissão escolhe ao arquivar e ao mudar a data.
export const PRAZOS_EXCLUSAO = [30, 60, 90, 180] as const;
export type PrazoExclusao = (typeof PRAZOS_EXCLUSAO)[number];
export const PRAZO_PADRAO: PrazoExclusao = 90;

// Dias de antecedência do segundo aviso por email.
export const DIAS_AVISO_EXCLUSAO = 7;

export function ePrazoValido(dias: number): dias is PrazoExclusao {
  return (PRAZOS_EXCLUSAO as readonly number[]).includes(dias);
}

export function somarDias(iso: string, dias: number): string {
  const [a, m, d] = iso.split("-").map(Number);
  const data = new Date(Date.UTC(a, m - 1, d + dias));
  return data.toISOString().slice(0, 10);
}

// Data de exclusão a partir de hoje. Como a menor opção é 30 dias, ninguém
// recebe menos de 30 dias de aviso, nem ao antecipar.
export function dataExclusao(hoje: string, dias: PrazoExclusao): string {
  return somarDias(hoje, dias);
}

// Dias que faltam (negativo = já passou).
export function diasAte(hoje: string, alvo: string): number {
  const ms = Date.parse(`${alvo}T00:00:00Z`) - Date.parse(`${hoje}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}

// O aviso de 7 dias sai quando faltam 7 dias ou menos.
export function deveAvisarExclusao(hoje: string, excluirEm: string): boolean {
  return diasAte(hoje, excluirEm) <= DIAS_AVISO_EXCLUSAO;
}
