import { describe, expect, it } from "vitest";
import { lerBusca, MAX_BUSCA, normalizar, padraoBusca, sqlNormalizado } from "./busca";

describe("lerBusca", () => {
  it("tira espaços das pontas e limita o tamanho", () => {
    expect(lerBusca("  joão ")).toBe("joão");
    expect(lerBusca("a".repeat(500))).toHaveLength(MAX_BUSCA);
  });
  it("aceita ausência e repetição do parâmetro", () => {
    expect(lerBusca(undefined)).toBe("");
    expect(lerBusca(["maria", "ana"])).toBe("maria");
    expect(lerBusca([])).toBe("");
  });
});

describe("normalizar", () => {
  it("ignora maiúsculas e acentos", () => {
    expect(normalizar("João Ação ÇÃO")).toBe("joao acao cao");
    expect(normalizar("Álvaro Müller")).toBe("alvaro muller");
  });
  it("mantém o que não tem acento mapeado", () => {
    expect(normalizar("Ana-Maria 2")).toBe("ana-maria 2");
  });
});

describe("padraoBusca", () => {
  it("envolve com % e normaliza", () => {
    expect(padraoBusca("João")).toBe("%joao%");
  });
  it("torna %, _ e \\ literais", () => {
    expect(padraoBusca("50%_a\\b")).toBe("%50\\%\\_a\\\\b%");
  });
});

describe("sqlNormalizado", () => {
  it("usa mapas do mesmo tamanho", () => {
    const m = sqlNormalizado("u.name").match(/, '(.+)', '(.+)'\)$/);
    expect(m?.[1]).toHaveLength(m?.[2].length ?? -1);
  });
});
