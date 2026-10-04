import { describe, expect, it } from "vitest";
import { ATRIBUTO_TEMA, CHAVE_TEMA, deveFicarEscuro, ehTema, lerTemaGuardado, SCRIPT_TEMA } from "./tema";

describe("ehTema", () => {
  it("aceita só os três modos conhecidos", () => {
    expect(ehTema("sistema")).toBe(true);
    expect(ehTema("claro")).toBe(true);
    expect(ehTema("escuro")).toBe(true);
  });

  it("recusa qualquer outra coisa, inclusive o que venha do localStorage", () => {
    // O localStorage é editável na mão e antigo; "dark" e "preto" não viram
    // modo válido nemalkano tema para o outro.
    expect(ehTema("dark")).toBe(false);
    expect(ehTema("preto")).toBe(false);
    expect(ehTema("")).toBe(false);
    expect(ehTema(null)).toBe(false);
    expect(ehTema(undefined)).toBe(false);
    expect(ehTema(1)).toBe(false);
    expect(ehTema({})).toBe(false);
  });
});

describe("deveFicarEscuro", () => {
  it("no modo sistema, segue o aparelho", () => {
    expect(deveFicarEscuro("sistema", true)).toBe(true);
    expect(deveFicarEscuro("sistema", false)).toBe(false);
  });

  it("em modo fixo, ignora o aparelho", () => {
    // Quem fixou "claro" num aparelho escuro está só escolhendo isso.
    expect(deveFicarEscuro("claro", true)).toBe(false);
    expect(deveFicarEscuro("escuro", false)).toBe(true);
  });
});

describe("lerTemaGuardado", () => {
  it("devolve o que foi guardado", () => {
    expect(lerTemaGuardado(() => "escuro")).toBe("escuro");
  });

  it("volta para sistema quando não há nada guardado", () => {
    expect(lerTemaGuardado(() => null)).toBe("sistema");
    expect(lerTemaGuardado(() => "lixo")).toBe("sistema");
  });

  it("não engole o erro do localStorage", () => {
    // Se o localStorage lançar, o padrão tem de ser "sistema", não a tela branca.
    const lanca = () => {
      throw new Error("localStorage bloqueado");
    };
    expect(lerTemaGuardado(lanca)).toBe("sistema");
  });
});

describe("SCRIPT_TEMA", () => {
  // O script roda no navegador, e o servidor nunca o executa: um erro aqui só
  // apareceria na tela de quem abriu a página.
  it("é um IIFE válido", () => {
    expect(SCRIPT_TEMA.startsWith("(function(){")).toBe(true);
    expect(SCRIPT_TEMA.endsWith("();")).toBe(true);
  });

  it("cria a função e a executa de imediato", () => {
    expect(() => new Function(SCRIPT_TEMA)).not.toThrow();
  });

  it("usa a mesma chave e o mesmo atributo do módulo", () => {
    // Se o script e o componente usarem nomes diferentes, o tema não persiste.
    expect(SCRIPT_TEMA).toContain(CHAVE_TEMA);
    expect(SCRIPT_TEMA).toContain(ATRIBUTO_TEMA);
  });

  it("marca o modo de movimento junto, para não piscar", () => {
    expect(SCRIPT_TEMA).toContain("prefers-reduced-motion");
    expect(SCRIPT_TEMA).toContain("data-sem-animacao");
  });
});