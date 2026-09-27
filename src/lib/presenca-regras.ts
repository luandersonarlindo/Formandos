// Regras da confirmação de presença, sem acesso ao banco.

export const STATUS_PRESENCA = ["vou", "talvez", "nao"] as const;
export type StatusPresenca = (typeof STATUS_PRESENCA)[number];

export const ROTULO_PRESENCA: Record<StatusPresenca, string> = {
  vou: "Vou",
  talvez: "Talvez",
  nao: "Não vou",
};

// Limite de acompanhantes por membro (o banco aceita até 10, para dar folga).
export const MAX_ACOMPANHANTES = 5;

// Só quem vai leva acompanhantes: com "talvez" ou "não vou" o número é zerado,
// para o total de pessoas esperadas nunca contar quem não confirmou.
export function normalizarPresenca(status: StatusPresenca, acompanhantes: number) {
  return {
    status,
    acompanhantes:
      status === "vou" ? Math.min(Math.max(0, Math.trunc(acompanhantes)), MAX_ACOMPANHANTES) : 0,
  };
}

// Membro + acompanhantes de quem confirmou.
export function pessoasEsperadas(vou: number, acompanhantes: number) {
  return vou + acompanhantes;
}
