// Valor por pessoa e link de uma opção de votação (ADR-0003), sem banco.
import { ehLinkHttps } from "./evento";

export const VALOR_PESSOA_MAX = 99_999_999.99;

// Aceita "95", "95,50", "1.234,56" e "95.50". Com vírgula, os pontos são
// separador de milhar; sem vírgula, um ponto seguido de 1 ou 2 dígitos no fim
// é a casa decimal. Vazio = sem valor.
export function lerValorPessoa(texto: string): number | null | "invalido" {
  let limpo = texto.trim().replace(/^R\$\s*/i, "").replace(/\s/g, "");
  if (limpo === "") return null;
  if (limpo.includes(",")) {
    limpo = limpo.replace(/\./g, "").replace(",", ".");
  } else if (!/^\d+\.\d{1,2}$/.test(limpo)) {
    limpo = limpo.replace(/\./g, "");
  }
  if (!/^\d+(\.\d{1,2})?$/.test(limpo)) return "invalido";
  const valor = Number(limpo);
  if (!Number.isFinite(valor) || valor > VALOR_PESSOA_MAX) return "invalido";
  return Math.round(valor * 100) / 100;
}

export type DetalheOpcao = { valorPessoa: number | null; link: string | null };

// Lê os dois campos de uma opção. Devolve o detalhe ou a mensagem de erro.
export function lerDetalheOpcao(
  texto: string,
  valorTexto: string,
  linkTexto: string,
): DetalheOpcao | { erro: string } {
  const valor = lerValorPessoa(valorTexto);
  if (valor === "invalido") {
    return { erro: `Valor por pessoa inválido em “${texto}”. Use só números, como 95 ou 95,50.` };
  }
  const link = linkTexto.trim();
  if (link && (link.length > 500 || !ehLinkHttps(link))) {
    return { erro: `Link inválido em “${texto}”. Use um endereço que comece com https://.` };
  }
  return { valorPessoa: valor, link: link || null };
}

// Prazo vem de <input type="datetime-local"> ("AAAA-MM-DDTHH:mm", horário de
// Brasília). Vazio = sem prazo. A conversão de fuso fica no SQL.
export function lerPrazoLocal(texto: string): string | null | "invalido" {
  const limpo = texto.trim();
  if (limpo === "") return null;
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(limpo) ? limpo : "invalido";
}
