import { describe, expect, it } from "vitest";
import { ehMaster, emailsMaster } from "./master";

describe("emailsMaster", () => {
  it("separa por vírgula, tira espaços e ignora maiúsculas", () => {
    expect(emailsMaster(" A@x.com, b@Y.com ,,")).toEqual(["a@x.com", "b@y.com"]);
  });
  it("vazio ou ausente não dá ninguém", () => {
    expect(emailsMaster("")).toEqual([]);
  });
});

describe("ehMaster", () => {
  const lista = "chefe@x.com";
  it("aceita email da lista, sem diferenciar maiúsculas", () => {
    expect(ehMaster({ email: "Chefe@X.com", emailVerified: true }, lista)).toBe(true);
  });
  it("recusa email fora da lista", () => {
    expect(ehMaster({ email: "outro@x.com", emailVerified: true }, lista)).toBe(false);
  });
  it("recusa email da lista sem confirmação", () => {
    expect(ehMaster({ email: "chefe@x.com", emailVerified: false }, lista)).toBe(false);
  });
  it("lista vazia não deixa ninguém entrar", () => {
    expect(ehMaster({ email: "chefe@x.com", emailVerified: true }, "")).toBe(false);
  });
});
