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

// ---- Acompanhantes com nome (ADR-0013) -------------------------------------

export const TIPOS_ACOMPANHANTE = ["adulto", "crianca"] as const;
export type TipoAcompanhante = (typeof TIPOS_ACOMPANHANTE)[number];
export type Acompanhante = { nome: string; tipo: TipoAcompanhante };

export const ROTULO_ACOMPANHANTE: Record<TipoAcompanhante, string> = {
  adulto: "Adulto",
  crianca: "Criança",
};

export const MAX_NOME_ACOMPANHANTE = 80;

// Quantos a pessoa pode ter na lista: o limite da turma, ou o que ela já
// tinha se a comissão baixou o limite depois (ninguém é cortado, mas quem
// está acima só pode remover).
export function vagasDeAcompanhante(limite: number, atuais: number): number {
  return Math.max(limitarAcompanhantes(limite), Math.min(Math.max(0, Math.trunc(atuais)), TETO_ACOMPANHANTES));
}

// Confere a lista enviada pelo formulário. Só quem vai leva acompanhantes;
// cada linha precisa de nome (linha em branco não some sozinha, para ninguém
// perder um convidado sem perceber).
export function lerAcompanhantes(
  status: StatusPresenca,
  nomes: string[],
  tipos: string[],
  { limite, atuais }: { limite: number; atuais: number },
): { lista: Acompanhante[] } | { erro: string } {
  if (status !== "vou") return { lista: [] };
  const vagas = vagasDeAcompanhante(limite, atuais);
  if (nomes.length > vagas) {
    return {
      erro:
        vagas === 0
          ? "A turma não permite acompanhantes."
          : `Você pode levar até ${vagas} ${vagas === 1 ? "acompanhante" : "acompanhantes"}.`,
    };
  }
  const lista: Acompanhante[] = [];
  for (let i = 0; i < nomes.length; i++) {
    const nome = nomes[i].trim().replace(/\s+/g, " ");
    if (!nome) return { erro: "Informe o nome de cada acompanhante ou remova a linha." };
    if (nome.length > MAX_NOME_ACOMPANHANTE) {
      return { erro: `O nome do acompanhante pode ter no máximo ${MAX_NOME_ACOMPANHANTE} caracteres.` };
    }
    const tipo = TIPOS_ACOMPANHANTE.find((t) => t === tipos[i]) ?? "adulto";
    lista.push({ nome, tipo });
  }
  return { lista };
}

// Total para o buffet. Acompanhante sem nome (resposta antiga) conta como adulto.
export function totaisPorTipo(vou: number, acompanhantes: number, criancas: number) {
  return { pessoas: vou + acompanhantes, adultos: vou + acompanhantes - criancas, criancas };
}

// ---- Prazo para responder (ADR-0013) ---------------------------------------

export const HORAS_JANELA_PRESENCA = 48;

// Depois do prazo a resposta trava: a comissão fecha o número com o buffet.
export function presencaFechada(prazo: Date | null, agora: Date): boolean {
  return prazo !== null && agora.getTime() >= prazo.getTime();
}
