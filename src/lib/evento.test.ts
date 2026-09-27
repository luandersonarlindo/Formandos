import { describe, expect, it } from "vitest";
import { ehLinkHttps, linkComoChegar } from "./evento";

describe("ehLinkHttps", () => {
  it("aceita https com domínio", () => {
    expect(ehLinkHttps("https://maps.app.goo.gl/abc123")).toBe(true);
    expect(ehLinkHttps("https://www.google.com/maps?q=recife")).toBe(true);
  });
  it("recusa o que não for https", () => {
    for (const ruim of [
      "http://maps.google.com",
      "javascript:alert(1)",
      "data:text/html,<b>oi</b>",
      "ftp://exemplo.com",
      "maps.google.com",
      "https://localhost",
      "https://",
      "",
    ]) {
      expect(ehLinkHttps(ruim), ruim).toBe(false);
    }
  });
});

describe("linkComoChegar", () => {
  it("prefere o link do mapa", () => {
    expect(linkComoChegar({ linkMapa: "https://exemplo.com/m", endereco: "Rua A", local: "Salão" })).toBe(
      "https://exemplo.com/m",
    );
  });
  it("sem link, busca pelo endereço e depois pelo local", () => {
    expect(linkComoChegar({ linkMapa: null, endereco: "Rua A, 10 - Recife", local: "Salão" })).toBe(
      "https://www.google.com/maps/search/?api=1&query=Rua%20A%2C%2010%20-%20Recife",
    );
    expect(linkComoChegar({ linkMapa: null, endereco: null, local: "Salão Azul" })).toBe(
      "https://www.google.com/maps/search/?api=1&query=Sal%C3%A3o%20Azul",
    );
  });
  it("sem nada, não há botão", () => {
    expect(linkComoChegar({ linkMapa: null, endereco: null, local: null })).toBeNull();
  });
});
