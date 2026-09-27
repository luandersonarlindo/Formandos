import { describe, expect, it } from "vitest";
import { formatarReal, lerValorOrcado } from "./orcamento";

describe("lerValorOrcado", () => {
  it("aceita vazio como sem valor", () => {
    expect(lerValorOrcado("")).toBeNull();
    expect(lerValorOrcado("   ")).toBeNull();
  });
  it("aceita vírgula e ponto de milhar", () => {
    expect(lerValorOrcado("1.500,50")).toBe(1500.5);
    expect(lerValorOrcado("1500,5")).toBe(1500.5);
    expect(lerValorOrcado("200")).toBe(200);
  });
  it("arredonda em duas casas", () => {
    expect(lerValorOrcado("10,999")).toBe(11);
  });
  it("recusa negativo e texto inválido", () => {
    for (const ruim of ["-5", "abc", "5-", "NaN", "Infinity"]) {
      expect(lerValorOrcado(ruim), ruim).toBeNull();
    }
  });
});

describe("formatarReal", () => {
  it("formata em reais", () => {
    expect(formatarReal.format(1500.5)).toBe("R$ 1.500,50");
  });
});
