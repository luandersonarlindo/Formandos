import { describe, expect, it } from "vitest";
import {
  ACOMPANHANTES_PADRAO,
  limitarAcompanhantes,
  normalizarPresenca,
  pessoasEsperadas,
  TETO_ACOMPANHANTES,
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