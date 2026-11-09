import { describe, expect, it } from "vitest";
import { lerDetalheOpcao, lerPrazoLocal, lerValorPessoa } from "./opcao-detalhe";

describe("lerValorPessoa", () => {
  it("vazio = sem valor", () => expect(lerValorPessoa("  ")).toBeNull());
  it("inteiro", () => expect(lerValorPessoa("95")).toBe(95));
  it("vírgula decimal", () => expect(lerValorPessoa("95,50")).toBe(95.5));
  it("milhar e vírgula", () => expect(lerValorPessoa("1.234,56")).toBe(1234.56));
  it("ponto decimal", () => expect(lerValorPessoa("95.50")).toBe(95.5));
  it("ponto de milhar sem vírgula", () => expect(lerValorPessoa("1.234")).toBe(1234));
  it("com R$", () => expect(lerValorPessoa("R$ 95")).toBe(95));
  it("negativo é inválido", () => expect(lerValorPessoa("-5")).toBe("invalido"));
  it("texto é inválido", () => expect(lerValorPessoa("noventa")).toBe("invalido"));
});

describe("lerDetalheOpcao", () => {
  it("sem nada", () =>
    expect(lerDetalheOpcao("Buffet A", "", "")).toEqual({ valorPessoa: null, link: null }));
  it("valor e link", () =>
    expect(lerDetalheOpcao("Buffet A", "95", "https://buffet.com.br/menu")).toEqual({
      valorPessoa: 95,
      link: "https://buffet.com.br/menu",
    }));
  it("link sem https", () =>
    expect(lerDetalheOpcao("Buffet A", "", "http://buffet.com.br")).toHaveProperty("erro"));
  it("valor inválido cita a opção", () =>
    expect(lerDetalheOpcao("Buffet A", "abc", "")).toEqual({
      erro: expect.stringContaining("Buffet A"),
    }));
});

describe("lerPrazoLocal", () => {
  it("vazio = sem prazo", () => expect(lerPrazoLocal("")).toBeNull());
  it("formato do datetime-local", () => expect(lerPrazoLocal("2026-12-12T23:59")).toBe("2026-12-12T23:59"));
  it("outro formato é inválido", () => expect(lerPrazoLocal("12/12/2026")).toBe("invalido"));
});
