import { randomInt } from "node:crypto";

// Sem 0/O, 1/I/L para evitar confusão ao digitar o código.
// 12 chars em alfabeto de 31: 31^12 tentativas. Com limite de 10/15min por
// usuário, força bruta distribuída deixa de ser viável. Códigos antigos de 8
// chars seguem válidos (coluna aceita até 20).
const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const TAMANHO_CODIGO = 12;

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
