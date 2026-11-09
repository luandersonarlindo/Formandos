// Textos prontos para a comissão colar no grupo da turma (ADR-0004).
// Funções puras: sem banco e sem `window`. A origem do site (https://...) vem
// de quem chama, no clique.
//
// Regras: a informação principal em negrito na primeira linha, link no fim,
// linha sem dado não aparece. Nunca entram nomes de pessoas, quem votou em quê,
// email ou telefone: só contagens, que a turma já vê no site.

import { formatarReal } from "./orcamento";

const FUSO = "America/Sao_Paulo";

export const LIMITE_AVISO = 700;

// "12/12 às 23:59"
const diaCurto = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", timeZone: FUSO });
const hora = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: FUSO });
// "sábado, 19 de dezembro"
const diaLongo = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: FUSO,
});

const quando = (d: Date) => `${diaCurto.format(d)} às ${hora.format(d)}`;
const quandoLongo = (d: Date) => `${diaLongo.format(d)} às ${hora.format(d)}`;

// Junta as linhas que existem, sem linhas vazias soltas no meio.
const juntar = (linhas: (string | null | false | undefined)[]) =>
  linhas.filter((l): l is string => typeof l === "string" && l.trim() !== "").join("\n");

const umaLinha = (texto: string) => texto.replace(/\s+/g, " ").trim();

export function textoAviso(aviso: { titulo: string; conteudo: string }, origem: string): string {
  const conteudo = aviso.conteudo.trim();
  const cortado =
    conteudo.length > LIMITE_AVISO ? `${conteudo.slice(0, LIMITE_AVISO).trimEnd()}…` : conteudo;
  return juntar([
    `*Aviso da comissão: ${umaLinha(aviso.titulo)}*`,
    cortado,
    `Ver no Formandos: ${origem}/avisos`,
  ]);
}

export type DadosVotacao = {
  pergunta: string;
  catalogoId: string;
  enqueteId: string;
  prazo: Date | null;
  quorumPct: number | null;
  opcoes: { texto: string; valorPessoa: number | null }[];
  votantes: number;
  membros: number;
};

export function textoVotacao(v: DadosVotacao, origem: string): string {
  const regra = [
    v.prazo && `Fecha em ${quando(v.prazo)}.`,
    v.quorumPct && `Precisa de ${v.quorumPct}% da turma votando.`,
  ]
    .filter(Boolean)
    .join(" ");
  return juntar([
    `*Votação: ${umaLinha(v.pergunta)}*`,
    regra,
    v.opcoes
      .map((o) =>
        o.valorPessoa != null
          ? `- ${umaLinha(o.texto)} (${formatarReal.format(o.valorPessoa)} por pessoa)`
          : `- ${umaLinha(o.texto)}`,
      )
      .join("\n"),
    v.votantes === 0 ? "Ninguém votou ainda." : `Já votaram ${v.votantes} de ${v.membros}.`,
    `Vote aqui: ${origem}/votacoes/${v.catalogoId}#enquete-${v.enqueteId}`,
  ]);
}

export type DadosDecisao = {
  pergunta: string;
  escolhas: string[];
  votantes: number | null;
  membros: number | null;
  justificativa: string | null;
};

export function textoDecisao(d: DadosDecisao, origem: string): string {
  return juntar([
    `*Decidido: ${umaLinha(d.pergunta)}*`,
    `Escolha da turma: ${d.escolhas.map(umaLinha).join(", ")}`,
    d.votantes != null && d.membros != null && `Votaram ${d.votantes} de ${d.membros}.`,
    d.justificativa && `Motivo da comissão: ${umaLinha(d.justificativa)}`,
    `Ver detalhes no Formandos: ${origem}/dashboard`,
  ]);
}

export type DadosEvento = {
  nome: string;
  data: Date | null;
  local: string;
  endereco: string;
  // Código da página pública (ADR-0008): com ele, o link serve à família e
  // aos convidados, sem login.
  tokenPublico?: string | null;
};

export function textoEvento(e: DadosEvento, origem: string): string {
  const onde = [e.local, e.endereco].map((x) => umaLinha(x)).filter(Boolean).join(", ");
  return juntar([
    `*${umaLinha(e.nome) ? `Formatura: ${umaLinha(e.nome)}` : "Nossa formatura"}*`,
    e.data && `Quando: ${quandoLongo(e.data)}`,
    onde && `Onde: ${onde}`,
    e.tokenPublico
      ? `Detalhes para a família e os convidados: ${origem}/evento/${e.tokenPublico}`
      : `Ver detalhes no Formandos: ${origem}/dashboard`,
  ]);
}

// Link que abre o WhatsApp com o texto pronto para escolher o grupo.
export function linkWhatsApp(texto: string): string {
  return `https://wa.me/?text=${encodeURIComponent(texto)}`;
}
