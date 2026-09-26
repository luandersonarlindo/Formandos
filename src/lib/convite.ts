import { randomInt } from "node:crypto";

// Sem 0/O, 1/I/L para evitar confusão ao digitar o código.
const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const TAMANHO_CODIGO = 8;

export function gerarCodigoConvite() {
  let codigo = "";
  for (let i = 0; i < TAMANHO_CODIGO; i++) {
    codigo += ALFABETO[randomInt(ALFABETO.length)];
  }
  return codigo;
}

export function normalizarCodigo(texto: string) {
  return texto.replace(/[\s-]/g, "").toUpperCase();
}
