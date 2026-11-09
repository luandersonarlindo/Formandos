// Planilha CSV para o Excel em português (ADR-0007), sem dependência.
// Separador ";" (o Excel pt-BR usa vírgula como decimal), BOM UTF-8 (senão o
// acento vira lixo ao abrir) e quebra de linha CRLF.
//
// Proteção contra fórmula (CSV injection): célula que começa com =, +, -, @,
// tab ou retorno ganha um apóstrofo na frente. Sem isso, um nome digitado como
// =HIPERLINK("http://...") vira link ativo quando a comissão abre o arquivo.

export type Celula = string | number | boolean | null | undefined | Date;

const INICIO_PERIGOSO = /^[=+\-@\t\r]/;

function celula(valor: Celula): string {
  if (valor === null || valor === undefined) return "";
  let texto =
    valor instanceof Date
      ? valor.toISOString()
      : typeof valor === "number"
        ? String(valor).replace(".", ",")
        : String(valor);
  if (typeof valor === "string" && INICIO_PERIGOSO.test(texto)) texto = `'${texto}`;
  return /[";\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

export function paraCsv(cabecalho: string[], linhas: Celula[][]): string {
  const todas = [cabecalho, ...linhas].map((l) => l.map(celula).join(";"));
  return `﻿${todas.join("\r\n")}\r\n`;
}

// "Sistemas de Informação 2026" → "sistemas-de-informacao-2026"
export function nomeDeArquivo(texto: string): string {
  return (
    texto
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "turma"
  );
}
