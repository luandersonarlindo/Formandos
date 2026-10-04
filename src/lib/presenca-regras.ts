// Regras da confirmação de presença, sem acesso ao banco.

export const STATUS_PRESENCA = ["vou", "talvez", "nao"] as const;
export type StatusPresenca = (typeof STATUS_PRESENCA)[number];

export const ROTULO_PRESENCA: Record<StatusPresenca, string> = {
  vou: "Vou",
  talvez: "Talvez",
  nao: "Não vou",
};

// Teto aceito pelo banco (turmas.max_acompanhantes vai até 20). O que vale é o
// limite que o administrador da turma escolheu.
export const TETO_ACOMPANHANTES = 20;

// Limite usado quando a turma ainda não escolheu outro (coluna do banco).
export const ACOMPANHANTES_PADRAO = 5;

// Só quem vai leva acompanhantes: com "talvez" ou "não vou" o número é zerado,
// para o total de pessoas esperadas nunca contar quem não confirmou.
export function normalizarPresenca(
  status: StatusPresenca,
  acompanhantes: number,
  limite = ACOMPANHANTES_PADRAO,
) {
  return {
    status,
    acompanhantes:
      status === "vou"
        ? Math.min(Math.max(0, Math.trunc(acompanhantes)), limitarAcompanhantes(limite))
        : 0,
  };
}

// O limite da turma nunca sai do teto do banco.
export function limitarAcompanhantes(limite: number): number {
  if (!Number.isFinite(limite)) return ACOMPANHANTES_PADRAO;
  return Math.min(Math.max(0, Math.trunc(limite)), TETO_ACOMPANHANTES);
}

// Membro + acompanhantes de quem confirmou.
export function pessoasEsperadas(vou: number, acompanhantes: number) {
  return vou + acompanhantes;
}