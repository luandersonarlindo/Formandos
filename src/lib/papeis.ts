// Papéis de uma pessoa na turma (ADR-0012). Arquivo sem banco nem cookies,
// para poder ser usado em qualquer lugar e testado.
//
// - admin: comissão. Pode tudo na turma.
// - participante: formando. Vota, paga, envia dúvida.
// - observador: professor, orientador ou coordenador. Só lê; a única coisa
//   que preenche é a própria presença. Não entra na conta da turma.

export const PAPEIS = ["admin", "participante", "observador"] as const;
export type Papel = (typeof PAPEIS)[number];

export const ROTULO_PAPEL: Record<Papel, string> = {
  admin: "Administrador",
  participante: "Participante",
  observador: "Observador",
};

export const ehObservador = (papel: Papel) => papel === "observador";

// Trecho de SQL para toda consulta que conta a turma (quórum, "X de Y
// votaram", parcelas, lembretes de prazo): observador fica de fora. Passe o
// apelido da tabela `membros` quando a consulta tiver um.
export function contaComoFormandoSql(apelido = ""): string {
  if (apelido && !/^[a-z_][a-z0-9_]*$/.test(apelido)) throw new Error("apelido inválido");
  return `${apelido ? `${apelido}.` : ""}papel <> 'observador'`;
}
