// Regra para fixar a decisão de uma pergunta (ADR-0003), sem acesso ao banco.
//
// A comissão pode fixar qualquer opção. A regra não proíbe: ela só diz se a
// decisão foge do combinado e por quê. Com algum motivo, a justificativa é
// obrigatória e fica visível para a turma.

export const MOTIVOS_FORA_DA_REGRA = [
  "sem_votos",
  "nao_mais_votada",
  "empate",
  "sem_quorum",
  "antes_do_prazo",
] as const;
export type MotivoForaDaRegra = (typeof MOTIVOS_FORA_DA_REGRA)[number];

// Frases para a turma e para o diálogo de fixar.
export const TEXTO_MOTIVO: Record<MotivoForaDaRegra, string> = {
  sem_votos: "Ninguém votou nesta pergunta.",
  nao_mais_votada: "A opção escolhida não é a mais votada.",
  empate: "A opção escolhida está empatada com outra.",
  sem_quorum: "Votou menos gente do que o quórum combinado.",
  antes_do_prazo: "O prazo da votação ainda não terminou e falta gente votar.",
};

export type RegraEnquete = {
  prazo: Date | null;
  quorumPct: number | null;
};

export type EntradaDecisao = {
  // Votos de cada opção da pergunta (todas, não só as escolhidas).
  contagem: { id: string; votos: number }[];
  escolhidas: string[];
  votantes: number;
  membros: number;
  regra: RegraEnquete | null;
  agora: Date;
};

// Devolve os motivos pelos quais a decisão foge da regra. Lista vazia =
// decisão dentro da regra.
export function avaliarDecisao(e: EntradaDecisao): MotivoForaDaRegra[] {
  if (e.votantes === 0) return ["sem_votos"];

  const motivos: MotivoForaDaRegra[] = [];
  const escolhidas = new Set(e.escolhidas);
  const votosEscolhidas = e.contagem.filter((o) => escolhidas.has(o.id)).map((o) => o.votos);
  const votosFora = e.contagem.filter((o) => !escolhidas.has(o.id)).map((o) => o.votos);

  if (votosEscolhidas.length > 0 && votosFora.length > 0) {
    const menorEscolhida = Math.min(...votosEscolhidas);
    const maiorFora = Math.max(...votosFora);
    if (menorEscolhida < maiorFora) motivos.push("nao_mais_votada");
    else if (menorEscolhida === maiorFora) motivos.push("empate");
  }

  const quorum = e.regra?.quorumPct;
  if (quorum && e.votantes * 100 < quorum * e.membros) motivos.push("sem_quorum");

  const prazo = e.regra?.prazo;
  if (prazo && e.agora < prazo && e.votantes < e.membros) motivos.push("antes_do_prazo");

  return motivos;
}

export const JUSTIFICATIVA_MIN = 10;
export const JUSTIFICATIVA_MAX = 500;

// Justificativa obrigatória só quando há motivo. Devolve a mensagem de erro,
// ou null se vale.
export function validarJustificativa(
  motivos: MotivoForaDaRegra[],
  texto: string,
): string | null {
  const limpo = texto.trim();
  if (limpo.length > JUSTIFICATIVA_MAX) {
    return `A justificativa pode ter no máximo ${JUSTIFICATIVA_MAX} caracteres.`;
  }
  if (motivos.length > 0 && limpo.length < JUSTIFICATIVA_MIN) {
    return `${TEXTO_MOTIVO[motivos[0]]} Escreva para a turma o motivo da decisão (pelo menos ${JUSTIFICATIVA_MIN} caracteres).`;
  }
  return null;
}

// Quórum vem do formulário como texto: vazio = sem quórum.
export function lerQuorum(texto: string): number | null | "invalido" {
  const limpo = texto.trim().replace("%", "");
  if (limpo === "") return null;
  const n = Number(limpo);
  if (!Number.isInteger(n) || n < 1 || n > 100) return "invalido";
  return n;
}
