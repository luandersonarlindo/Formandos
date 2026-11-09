import { describe, expect, it } from "vitest";
import {
  LIMITE_AVISO,
  linkWhatsApp,
  textoAviso,
  textoDecisao,
  textoEvento,
  textoVotacao,
  type DadosVotacao,
} from "./texto-whatsapp";

const ORIGEM = "https://formandos.example.com";

describe("textoAviso", () => {
  it("título em negrito, recado e link", () => {
    expect(textoAviso({ titulo: "Reunião", conteudo: "Sexta às 19h." }, ORIGEM)).toBe(
      "*Aviso da comissão: Reunião*\nSexta às 19h.\nVer no Formandos: https://formandos.example.com/avisos",
    );
  });

  it("corta recado longo e mantém o link", () => {
    const texto = textoAviso({ titulo: "Longo", conteudo: "a".repeat(LIMITE_AVISO + 50) }, ORIGEM);
    expect(texto).toContain(`${"a".repeat(LIMITE_AVISO)}…`);
    expect(texto).not.toContain("a".repeat(LIMITE_AVISO + 1));
    expect(texto.endsWith("/avisos")).toBe(true);
  });

  it("título com quebra de linha vira uma linha só", () => {
    expect(textoAviso({ titulo: "A\nB", conteudo: "x" }, ORIGEM)).toMatch(/^\*Aviso da comissão: A B\*/);
  });
});

const votacao = (parcial: Partial<DadosVotacao> = {}): DadosVotacao => ({
  pergunta: "Qual buffet?",
  catalogoId: "cat1",
  enqueteId: "enq1",
  prazo: null,
  quorumPct: null,
  opcoes: [
    { texto: "Buffet A", valorPessoa: 95 },
    { texto: "Buffet B", valorPessoa: null },
  ],
  votantes: 22,
  membros: 38,
  ...parcial,
});

describe("textoVotacao", () => {
  it("sem regra: sem linha de prazo nem de quórum", () => {
    expect(textoVotacao(votacao(), ORIGEM)).toBe(
      [
        "*Votação: Qual buffet?*",
        "- Buffet A (R$ 95,00 por pessoa)",
        "- Buffet B",
        "Já votaram 22 de 38.",
        "Vote aqui: https://formandos.example.com/votacoes/cat1#enquete-enq1",
      ].join("\n"),
    );
  });

  it("prazo no fuso de Brasília e quórum", () => {
    // 02:59 UTC do dia 13 = 23:59 do dia 12 em Brasília.
    const texto = textoVotacao(
      votacao({ prazo: new Date("2026-12-13T02:59:00Z"), quorumPct: 60 }),
      ORIGEM,
    );
    expect(texto.split("\n")[1]).toBe("Fecha em 12/12 às 23:59. Precisa de 60% da turma votando.");
  });
});

describe("textoVotacao sem votos", () => {
  it("diz que ninguém votou em vez de 0 de N", () => {
    expect(textoVotacao(votacao({ votantes: 0 }), ORIGEM)).toContain("\nNinguém votou ainda.\n");
  });
});

describe("textoDecisao", () => {
  it("com números e motivo", () => {
    expect(
      textoDecisao(
        {
          pergunta: "Qual buffet?",
          escolhas: ["Buffet B"],
          votantes: 22,
          membros: 38,
          justificativa: "O A não tem a data.",
        },
        ORIGEM,
      ),
    ).toBe(
      [
        "*Decidido: Qual buffet?*",
        "Escolha da turma: Buffet B",
        "Votaram 22 de 38.",
        "Motivo da comissão: O A não tem a data.",
        "Ver detalhes no Formandos: https://formandos.example.com/dashboard",
      ].join("\n"),
    );
  });

  it("decisão antiga, sem números nem motivo", () => {
    const texto = textoDecisao(
      { pergunta: "Cor?", escolhas: ["Azul", "Dourado"], votantes: null, membros: null, justificativa: null },
      ORIGEM,
    );
    expect(texto).toBe(
      "*Decidido: Cor?*\nEscolha da turma: Azul, Dourado\nVer detalhes no Formandos: https://formandos.example.com/dashboard",
    );
  });
});

describe("textoEvento", () => {
  it("data por extenso, local e endereço", () => {
    const texto = textoEvento(
      {
        nome: "SI 2026",
        data: new Date("2026-12-19T23:00:00Z"),
        local: "Chácara Bela Vista",
        endereco: "Rua A, 10",
      },
      ORIGEM,
    );
    expect(texto).toBe(
      [
        "*Formatura: SI 2026*",
        "Quando: sábado, 19 de dezembro às 20:00",
        "Onde: Chácara Bela Vista, Rua A, 10",
        "Ver detalhes no Formandos: https://formandos.example.com/dashboard",
      ].join("\n"),
    );
  });

  it("sem data e sem local: só nome e link", () => {
    expect(textoEvento({ nome: "", data: null, local: "", endereco: "" }, ORIGEM)).toBe(
      "*Nossa formatura*\nVer detalhes no Formandos: https://formandos.example.com/dashboard",
    );
  });
});

describe("textoEvento com página pública", () => {
  it("usa o link público quando ligado", () => {
    expect(
      textoEvento({ nome: "SI", data: null, local: "", endereco: "", tokenPublico: "abcdefghijklmnopqrstuv" }, ORIGEM),
    ).toBe(
      "*Formatura: SI*\nDetalhes para a família e os convidados: https://formandos.example.com/evento/abcdefghijklmnopqrstuv",
    );
  });
});

describe("linkWhatsApp", () => {
  it("codifica o texto na URL", () => {
    expect(linkWhatsApp("*Oi* & tchau\nlinha")).toBe(
      "https://wa.me/?text=*Oi*%20%26%20tchau%0Alinha",
    );
  });
});
