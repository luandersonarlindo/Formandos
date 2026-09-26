import { describe, expect, it } from "vitest";
import { gerarCodigoConvite, normalizarCodigo, TAMANHO_CODIGO } from "./convite";

describe("gerarCodigoConvite", () => {
  it("gera código com o tamanho esperado", () => {
    expect(gerarCodigoConvite()).toHaveLength(TAMANHO_CODIGO);
  });

  it("não usa caracteres ambíguos (0, O, 1, I, L)", () => {
    for (let i = 0; i < 500; i++) {
      expect(gerarCodigoConvite()).toMatch(/^[A-HJKMN-Z2-9]+$/);
    }
  });

  it("não repete códigos em 1000 sorteios", () => {
    const codigos = new Set(Array.from({ length: 1000 }, gerarCodigoConvite));
    expect(codigos.size).toBe(1000);
  });
});

describe("normalizarCodigo", () => {
  it("ignora espaços e hífens e converte para maiúsculas", () => {
    expect(normalizarCodigo(" k7qm-4r2x ")).toBe("K7QM4R2X");
  });

  it("mantém um código já normalizado", () => {
    expect(normalizarCodigo("K7QM4R2X")).toBe("K7QM4R2X");
  });
});
