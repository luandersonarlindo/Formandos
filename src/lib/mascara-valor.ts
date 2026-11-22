// Máscara de dinheiro (pt-BR) para os campos de valor, enquanto a pessoa
// digita: "1500" vira "1.500", "1500,5" vira "1.500,5" e a vírgula aceita até
// 2 casas. O resultado é o mesmo texto que os leitores do servidor já aceitam
// (lerValorPessoa, lerValorOrcado), então a regra não muda.

/** Formata o texto digitado. `pontoDecimal`: a pessoa acabou de digitar "." e quer dizer vírgula. */
export function mascararValor(texto: string, pontoDecimal = false): string {
  let s = texto.replace(/[^\d,.]/g, "");
  if (pontoDecimal && !s.includes(",")) {
    const i = s.lastIndexOf(".");
    if (i >= 0) s = `${s.slice(0, i)},${s.slice(i + 1)}`;
  }
  s = s.replace(/\./g, "");
  const virgula = s.indexOf(",");
  let inteiro = virgula >= 0 ? s.slice(0, virgula) : s;
  const decimal = virgula >= 0 ? s.slice(virgula + 1).replace(/,/g, "").slice(0, 2) : "";
  inteiro = inteiro.replace(/^0+(?=\d)/, "");
  if (virgula >= 0 && inteiro === "") inteiro = "0";
  const comMilhar = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return virgula >= 0 ? `${comMilhar},${decimal}` : comMilhar;
}

/** Valor inicial vindo do banco ("150.5", "150.50") ou já em pt-BR ("150,50"). */
export function valorInicial(texto: string | number | null | undefined): string {
  if (texto === null || texto === undefined || texto === "") return "";
  const t = String(texto).trim();
  if (/^\d+(\.\d+)?$/.test(t)) return mascararValor(Number(t).toFixed(2).replace(".", ","));
  return mascararValor(t);
}
