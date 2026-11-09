import { describe, expect, it } from "vitest";
import { codigoDoLink, linkConvite } from "./convite-link";

describe("link de convite", () => {
  it("monta o link com o código", () => {
    expect(linkConvite("https://formandos.app", "K7QM4R2XAB23")).toBe(
      "https://formandos.app/convite?codigo=K7QM4R2XAB23",
    );
  });

  it("aceita código do link normalizado", () => {
    expect(codigoDoLink(" k7qm-4r2x ")).toBe("K7QM4R2X");
  });

  it("recusa código vazio, curto ou com símbolos", () => {
    expect(codigoDoLink(null)).toBeNull();
    expect(codigoDoLink("abc")).toBeNull();
    expect(codigoDoLink("<script>")).toBeNull();
  });
});
