import { describe, expect, it } from "vitest";
import { mascararValor, valorInicial } from "./mascara-valor";
import { lerValorPessoa } from "./opcao-detalhe";

describe("mascararValor", () => {
  it("põe o ponto de milhar enquanto digita", () => {
    expect(mascararValor("1")).toBe("1");
    expect(mascararValor("1500")).toBe("1.500");
    expect(mascararValor("1234567")).toBe("1.234.567");
  });
  it("aceita vírgula com até 2 casas", () => {
    expect(mascararValor("1500,")).toBe("1.500,");
    expect(mascararValor("1500,555")).toBe("1.500,55");
    expect(mascararValor("1.500,5")).toBe("1.500,5");
  });
  it("o ponto digitado vira vírgula; os pontos da máscara não", () => {
    expect(mascararValor("95.", true)).toBe("95,");
    expect(mascararValor("1.5000")).toBe("15.000");
  });
  it("tira letras, R$ e zeros à esquerda", () => {
    expect(mascararValor("R$ 0012,3x")).toBe("12,3");
    expect(mascararValor(",5")).toBe("0,5");
  });
  it("o texto mascarado é lido igual pelo servidor", () => {
    expect(lerValorPessoa(mascararValor("123456,78"))).toBe(123456.78);
    expect(lerValorPessoa(mascararValor("110"))).toBe(110);
  });
});

describe("valorInicial", () => {
  it("formata o número do banco", () => {
    expect(valorInicial("150.5")).toBe("150,50");
    expect(valorInicial(1600)).toBe("1.600,00");
    expect(valorInicial("1500,50")).toBe("1.500,50");
    expect(valorInicial(null)).toBe("");
  });
});
