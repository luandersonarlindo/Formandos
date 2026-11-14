// Importação de pagamentos colados da planilha da tesouraria (ADR-0014), sem
// banco. Uma linha por pagamento, colunas separadas por tabulação (como sai do
// Excel e do Google Planilhas) ou por ponto e vírgula:
//
//   email ; valor ; data ; forma ; quem pagou ; referência
//
// Vírgula não separa colunas: é o separador de centavos.

import { normalizarEmail } from "./email-validacao";
import { lerValorPessoa } from "./opcao-detalhe";

export const MAX_LINHAS_IMPORTACAO = 500;
export const REFERENCIA_PADRAO = "Importado da planilha";

export const FORMAS = ["pix", "dinheiro", "transferencia", "outro"] as const;
export type Forma = (typeof FORMAS)[number];

export type LinhaPagamento = {
  linha: number; // posição no texto colado, contando a partir de 1
  email: string;
  valor: number;
  data: string; // AAAA-MM-DD
  forma: Forma;
  pagoPor: string | null;
  referencia: string | null;
};
export type ProblemaLinha = { linha: number; motivo: string };
export type PlanilhaLida = { linhas: LinhaPagamento[]; problemas: ProblemaLinha[]; excedeu: boolean };

const EMAIL = /^[^\s@;,<>"]+@[^\s@;,<>"]+\.[^\s@;,<>"]+$/;

const semAcento = (t: string) =>
  t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

function lerForma(texto: string): Forma | null {
  const t = semAcento(texto);
  if (t === "") return "pix";
  if (t === "pix") return "pix";
  if (t === "dinheiro" || t === "especie") return "dinheiro";
  if (t === "transferencia" || t === "ted" || t === "doc") return "transferencia";
  if (t === "outro" || t === "outros") return "outro";
  return null;
}

// "15/03/2026" ou "2026-03-15" viram "2026-03-15". Data que não existe
// (31/02) devolve null.
export function lerDataPlanilha(texto: string): string | null {
  const t = texto.trim();
  let ano: number, mes: number, dia: number;
  const br = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const iso = t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (br) [dia, mes, ano] = [Number(br[1]), Number(br[2]), Number(br[3])];
  else if (iso) [ano, mes, dia] = [Number(iso[1]), Number(iso[2]), Number(iso[3])];
  else return null;
  const d = new Date(Date.UTC(ano, mes - 1, dia));
  if (d.getUTCFullYear() !== ano || d.getUTCMonth() !== mes - 1 || d.getUTCDate() !== dia) return null;
  if (ano < 2000) return null;
  return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

// `hoje` em AAAA-MM-DD (fuso do Brasil): pagamento com data no futuro é erro
// de digitação na planilha.
export function lerPlanilhaPagamentos(texto: string, hoje: string): PlanilhaLida {
  const linhas: LinhaPagamento[] = [];
  const problemas: ProblemaLinha[] = [];
  let excedeu = false;
  let primeira = true;

  texto.split(/\r?\n/).forEach((bruta, i) => {
    if (!bruta.trim()) return;
    const numero = i + 1;
    const colunas = (bruta.includes("\t") ? bruta.split("\t") : bruta.split(";")).map((c) => c.trim());
    const ehPrimeira = primeira;
    primeira = false;
    // Cabeçalho da planilha ("Email", "Nome"...): a primeira coluna não é email.
    if (ehPrimeira && !colunas[0].includes("@")) return;
    if (linhas.length + problemas.length >= MAX_LINHAS_IMPORTACAO) {
      excedeu = true;
      return;
    }
    const problema = (motivo: string) => problemas.push({ linha: numero, motivo });

    const [emailTexto = "", valorTexto = "", dataTexto = "", formaTexto = "", pagoPor = "", referencia = ""] =
      colunas;
    if (colunas.length < 3) return problema("faltam colunas: precisa de email, valor e data");
    const email = normalizarEmail(emailTexto);
    if (!EMAIL.test(email)) return problema(`email inválido (${emailTexto || "vazio"})`);
    const valor = lerValorPessoa(valorTexto);
    if (valor === null || valor === "invalido" || valor <= 0) {
      return problema(`valor inválido (${valorTexto || "vazio"})`);
    }
    const data = lerDataPlanilha(dataTexto);
    if (!data) return problema(`data inválida (${dataTexto || "vazia"}): use 15/03/2026`);
    if (data > hoje) return problema(`data no futuro (${dataTexto})`);
    const forma = lerForma(formaTexto);
    if (!forma) return problema(`forma desconhecida (${formaTexto}): use pix, dinheiro, transferência ou outro`);
    if (pagoPor.length > 120) return problema("“quem pagou” com mais de 120 caracteres");
    if (referencia.length > 120) return problema("referência com mais de 120 caracteres");

    linhas.push({
      linha: numero,
      email,
      valor,
      data,
      forma,
      pagoPor: pagoPor || null,
      referencia: referencia || null,
    });
  });
  return { linhas, problemas, excedeu };
}

// Mesma pessoa, mesmo valor e mesma data = mesmo pagamento.
export const chavePagamento = (usuarioId: string, valor: number, data: string) =>
  `${usuarioId}|${valor.toFixed(2)}|${data}`;

// Colar de novo não duplica: se a planilha traz 2 linhas iguais e o site já
// tem 1, entra só 1. `existentes` diz quantos lançamentos confirmados há por chave.
export function descontarExistentes<T extends { chave: string }>(
  linhas: T[],
  existentes: Map<string, number>,
): { novas: T[]; repetidas: number } {
  const resta = new Map(existentes);
  const novas: T[] = [];
  let repetidas = 0;
  for (const l of linhas) {
    const n = resta.get(l.chave) ?? 0;
    if (n > 0) {
      resta.set(l.chave, n - 1);
      repetidas++;
    } else {
      novas.push(l);
    }
  }
  return { novas, repetidas };
}
