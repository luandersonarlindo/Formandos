import { describe, expect, it } from "vitest";
import {
  ACOMPANHANTES_PADRAO,
  lerAcompanhantes,
  limitarAcompanhantes,
  normalizarPresenca,
  pessoasEsperadas,
  presencaFechada,
  TETO_ACOMPANHANTES,
  totaisPorTipo,
  vagasDeAcompanhante,
} from "./presenca-regras";

describe("normalizarPresenca", () => {
  it("só quem vai leva acompanhantes", () => {
    expect(normalizarPresenca("vou", 2)).toEqual({ status: "vou", acompanhantes: 2 });
    expect(normalizarPresenca("talvez", 3)).toEqual({ status: "talvez", acompanhantes: 0 });
    expect(normalizarPresenca("nao", 1)).toEqual({ status: "nao", acompanhantes: 0 });
  });
  it("usa o limite padrão quando a turma não escolheu outro", () => {
    expect(normalizarPresenca("vou", 99).acompanhantes).toBe(ACOMPANHANTES_PADRAO);
    expect(normalizarPresenca("vou", -4).acompanhantes).toBe(0);
    expect(normalizarPresenca("vou", 1.9).acompanhantes).toBe(1);
  });
  it("respeita o limite escolhido pelo administrador da turma", () => {
    expect(normalizarPresenca("vou", 99, 0).acompanhantes).toBe(0);
    expect(normalizarPresenca("vou", 4, 2).acompanhantes).toBe(2);
    expect(normalizarPresenca("vou", 4, 10).acompanhantes).toBe(4);
  });
});

describe("limitarAcompanhantes", () => {
  it("mantém o limite dentro do que o banco aceita", () => {
    expect(limitarAcompanhantes(-3)).toBe(0);
    expect(limitarAcompanhantes(0)).toBe(0);
    expect(limitarAcompanhantes(7)).toBe(7);
    expect(limitarAcompanhantes(999)).toBe(TETO_ACOMPANHANTES);
  });
  it("volta ao padrão quando o valor não é um número", () => {
    expect(limitarAcompanhantes(Number.NaN)).toBe(ACOMPANHANTES_PADRAO);
    expect(limitarAcompanhantes(Number.POSITIVE_INFINITY)).toBe(ACOMPANHANTES_PADRAO);
  });
});

describe("pessoasEsperadas", () => {
  it("soma quem vai e os acompanhantes", () => {
    expect(pessoasEsperadas(0, 0)).toBe(0);
    expect(pessoasEsperadas(3, 4)).toBe(7);
  });
});

describe("acompanhantes com nome (ADR-0013)", () => {
  const regra = { limite: 2, atuais: 0 };
  it("só quem vai leva acompanhantes", () => {
    expect(lerAcompanhantes("talvez", ["Ana"], ["adulto"], regra)).toEqual({ lista: [] });
    expect(lerAcompanhantes("nao", ["Ana"], ["adulto"], regra)).toEqual({ lista: [] });
  });
  it("limpa o nome e aceita adulto ou criança", () => {
    expect(lerAcompanhantes("vou", ["  Ana   Lima ", "Léo"], ["adulto", "crianca"], regra)).toEqual({
      lista: [
        { nome: "Ana Lima", tipo: "adulto" },
        { nome: "Léo", tipo: "crianca" },
      ],
    });
    expect(lerAcompanhantes("vou", ["Ana"], ["bebê"], regra)).toEqual({ lista: [{ nome: "Ana", tipo: "adulto" }] });
  });
  it("linha sem nome é erro, não some sozinha", () => {
    expect(lerAcompanhantes("vou", ["Ana", "  "], ["adulto", "adulto"], regra)).toHaveProperty("erro");
  });
  it("respeita o limite da turma", () => {
    expect(lerAcompanhantes("vou", ["A", "B", "C"], [], regra)).toHaveProperty("erro");
    expect(lerAcompanhantes("vou", ["A"], [], { limite: 0, atuais: 0 })).toEqual({
      erro: "A turma não permite acompanhantes.",
    });
  });
  it("quem já estava acima do limite mantém, mas não aumenta", () => {
    expect(vagasDeAcompanhante(2, 4)).toBe(4);
    expect(vagasDeAcompanhante(2, 1)).toBe(2);
    const acima = { limite: 2, atuais: 4 };
    expect(lerAcompanhantes("vou", ["A", "B", "C", "D"], [], acima)).toHaveProperty("lista");
    expect(lerAcompanhantes("vou", ["A", "B", "C", "D", "E"], [], acima)).toHaveProperty("erro");
  });
  it("separa adultos e crianças para o buffet", () => {
    expect(totaisPorTipo(10, 6, 2)).toEqual({ pessoas: 16, adultos: 14, criancas: 2 });
  });
});

describe("prazo de presença (ADR-0013)", () => {
  const prazo = new Date("2026-12-01T21:00:00Z");
  it("sem prazo nunca fecha", () => {
    expect(presencaFechada(null, new Date())).toBe(false);
  });
  it("fecha na hora marcada", () => {
    expect(presencaFechada(prazo, new Date("2026-12-01T20:59:59Z"))).toBe(false);
    expect(presencaFechada(prazo, new Date("2026-12-01T21:00:00Z"))).toBe(true);
    expect(presencaFechada(prazo, new Date("2026-12-02T00:00:00Z"))).toBe(true);
  });
});
