import { describe, expect, it } from "vitest";
import { DESTINO_PADRAO, destinoSeguro } from "./redirecionamento";

describe("destinoSeguro", () => {
  it("aceita caminho interno com query", () => {
    expect(destinoSeguro("/convite?codigo=K7QM4R2XAB23")).toBe("/convite?codigo=K7QM4R2XAB23");
    expect(destinoSeguro("/votacoes/abc")).toBe("/votacoes/abc");
  });

  it("usa o padrão quando não há destino", () => {
    expect(destinoSeguro(undefined)).toBe(DESTINO_PADRAO);
    expect(destinoSeguro(null)).toBe(DESTINO_PADRAO);
    expect(destinoSeguro("")).toBe(DESTINO_PADRAO);
  });

  it("recusa outro domínio", () => {
    for (const v of [
      "https://site-falso.com",
      "//site-falso.com",
      "/\\site-falso.com",
      "/\t/site-falso.com",
      "/\n/site-falso.com",
      "javascript:alert(1)",
      "site-falso.com",
    ]) {
      expect(destinoSeguro(v)).toBe(DESTINO_PADRAO);
    }
  });

  it("não volta para o próprio login", () => {
    expect(destinoSeguro("/entrar?voltar=/dashboard")).toBe(DESTINO_PADRAO);
  });

  it("recusa valor longo demais", () => {
    expect(destinoSeguro("/" + "a".repeat(600))).toBe(DESTINO_PADRAO);
  });
});
