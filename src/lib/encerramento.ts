// Encerramento do site (ADR-0021, completa a ADR-0009, item 6). Sem banco:
// lê a data da variável ENCERRAMENTO_EM e monta os textos.
//
// Sem a variável, nada muda. Com ela, todas as telas mostram a faixa, criar
// turma é recusado e /api/encerramento manda o aviso por email.

const ISO = /^\d{4}-\d{2}-\d{2}$/;

// "AAAA-MM-DD" válido ou null. Data inválida (ex.: 2027-02-30) também é null:
// melhor não mostrar faixa do que mostrar uma data errada.
export function lerDataEncerramento(valor: string | undefined | null): string | null {
  const v = valor?.trim();
  if (!v || !ISO.test(v)) return null;
  const [a, m, d] = v.split("-").map(Number);
  const data = new Date(Date.UTC(a, m - 1, d));
  return data.getUTCFullYear() === a && data.getUTCMonth() === m - 1 && data.getUTCDate() === d ? v : null;
}

export function dataEncerramento(): string | null {
  return lerDataEncerramento(process.env.ENCERRAMENTO_EM);
}

export const dataBr = (iso: string) => iso.split("-").reverse().join("/");

export function textoFaixaEncerramento(iso: string): string {
  return `O Formandos será encerrado em ${dataBr(iso)}. Até lá tudo continua funcionando. Baixe seus dados em Minha conta e o registro da turma.`;
}

export function erroTurmaNovaEncerramento(iso: string): string {
  return `O Formandos será encerrado em ${dataBr(iso)} e não aceita turmas novas.`;
}
