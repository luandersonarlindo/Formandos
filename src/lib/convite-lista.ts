// Lista colada pela comissão para convidar por email (ADR-0007), sem banco.
// Aceita uma pessoa por linha: "email" ou "nome; email" (também com vírgula
// ou tab, como sai de uma planilha). O email pode vir antes ou depois do nome.

import { normalizarEmail } from "./email-validacao";

export const MAX_CONVITES_POR_VEZ = 200;

export type Convidado = { nome: string | null; email: string };
export type ResultadoLista = {
  validos: Convidado[];
  invalidas: string[]; // linhas sem email válido, como foram coladas
  repetidos: number;
  excedeu: boolean; // passou de MAX_CONVITES_POR_VEZ (o resto ficou de fora)
};

const EMAIL = /[^\s@;,<>"]+@[^\s@;,<>"]+\.[^\s@;,<>"]+/;

export function lerListaConvites(texto: string): ResultadoLista {
  const vistos = new Set<string>();
  const validos: Convidado[] = [];
  const invalidas: string[] = [];
  let repetidos = 0;
  let excedeu = false;

  for (const bruta of texto.split(/\r?\n/)) {
    const linha = bruta.trim();
    if (!linha) continue;
    const achado = linha.match(EMAIL);
    // "ana@ex" (sem ponto no domínio) não casa e cai aqui.
    if (!achado) {
      invalidas.push(linha);
      continue;
    }
    const email = normalizarEmail(achado[0]);
    if (vistos.has(email)) {
      repetidos++;
      continue;
    }
    if (validos.length >= MAX_CONVITES_POR_VEZ) {
      excedeu = true;
      continue;
    }
    vistos.add(email);
    // O resto da linha é o nome: sem o email, os <> e os separadores.
    const nome =
      linha
        .replace(achado[0], " ")
        .replace(/[<>;,\t]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 120) || null;
    validos.push({ nome, email });
  }
  return { validos, invalidas, repetidos, excedeu };
}
