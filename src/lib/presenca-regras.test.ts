import { describe, expect, it } from "vitest";
import { MAX_ACOMPANHANTES, normalizarPresenca, pessoasEsperadas } from "./presenca-regras";

describe("normalizarPresenca", () => {
  it("só quem vai leva acompanhantes", () => {
    expect(normalizarPresenca("vou", 2)).toEqual({ status: "vou", acompanhantes: 2 });
    expect(normalizarPresenca("talvez", 3)).toEqual({ status: "talvez", acompanhantes: 0 });
    expect(normalizarPresenca("nao", 1)).toEqual({ status: "nao", acompanhantes: 0 });
  });
  it("mantém o número dentro do limite", () => {
    expect(normalizarPresenca("vou", 99).acompanhantes).toBe(MAX_ACOMPANHANTES);
    expect(normalizarPresenca("vou", -4).acompanhantes).toBe(0);
    expect(normalizarPresenca("vou", 1.9).acompanhantes).toBe(1);
  });
});

describe("pessoasEsperadas", () => {
  it("soma quem vai e os acompanhantes", () => {
    expect(pessoasEsperadas(0, 0)).toBe(0);
    expect(pessoasEsperadas(3, 4)).toBe(7);
  });
});
