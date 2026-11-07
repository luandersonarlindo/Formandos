// Regras de uma seleção de voto numa enquete, sem acesso ao banco.
export type OpcaoInfo = { enqueteId: string; exclusiva: boolean };

// Seleção única = 1 opção; múltipla = 1 ou mais; uma opção exclusiva
// ("Sem preferência"…) não pode vir junto com outras. Devolve a mensagem de
// erro, ou null se a seleção vale.
export function validarSelecao(
  enqueteId: string,
  tipo: "unica" | "multipla",
  opcaoIds: string[],
  opcoes: Map<string, OpcaoInfo>,
): string | null {
  const unicas = new Set(opcaoIds);
  if (unicas.size !== opcaoIds.length) {
    return "Escolha apenas uma vez cada opção.";
  }
  if (opcaoIds.some((id) => !opcoes.get(id) || opcoes.get(id)!.enqueteId !== enqueteId)) {
    return "Opção inválida para esta pergunta.";
  }
  if (tipo === "unica" && opcaoIds.length !== 1) {
    return "Escolha apenas uma opção.";
  }
  if (opcaoIds.length > 1 && opcaoIds.some((id) => opcoes.get(id)?.exclusiva)) {
    return "Essa opção não pode ser combinada com as outras.";
  }
  return null;
}
