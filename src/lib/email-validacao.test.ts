import { describe, expect, it } from "vitest";
import listaDescartavel from "disposable-domains";
import {
  ehDescartavel,
  ehDescartavelEmLista,
  extrairDominio,
  normalizarEmail,
  sugerirDominio,
  validarEmailCadastro,
} from "./email-validacao";

describe("normalizarEmail", () => {
  it("apara espaços e converte para minúsculas", () => {
    expect(normalizarEmail("  Maria@Gmail.COM ")).toBe("maria@gmail.com");
  });
});

describe("extrairDominio", () => {
  it("extrai o domínio de um email válido", () => {
    expect(extrairDominio("maria@gmail.com")).toBe("gmail.com");
  });

  it("usa o último @ quando há mais de um", () => {
    expect(extrairDominio("a@b@gmail.com")).toBe("gmail.com");
  });

  it("devolve null sem @, sem usuário, sem domínio ou sem ponto", () => {
    expect(extrairDominio("maria")).toBeNull();
    expect(extrairDominio("@gmail.com")).toBeNull();
    expect(extrairDominio("maria@")).toBeNull();
    expect(extrairDominio("maria@localhost")).toBeNull();
  });
});

describe("ehDescartavel", () => {
  it("barra provedores temporários conhecidos", () => {
    expect(ehDescartavel("alguem@mailinator.com")).toBe(true);
    expect(ehDescartavel("alguem@10minutemail.com")).toBe(true);
    expect(ehDescartavel("alguem@guerrillamail.com")).toBe(true);
    expect(ehDescartavel("ALGUEM@YOPMAIL.COM")).toBe(true);
  });

  it("barra subdomínios de provedores temporários", () => {
    expect(ehDescartavel("alguem@mail.yopmail.com")).toBe(true);
  });

  it("libera provedor real e domínio de teste dos E2E", () => {
    expect(ehDescartavel("maria@gmail.com")).toBe(false);
    expect(ehDescartavel("teste-jl@example.invalid")).toBe(false);
  });

  it("não confunde sufixo parecido (evita falso positivo)", () => {
    expect(ehDescartavel("maria@notmailinator.com")).toBe(false);
  });
});

describe("ehDescartavelEmLista", () => {
  const lista = new Set(["mailinator.com", "yopmail.com"]);

  it("barra exato e subdomínio, libera o resto", () => {
    expect(ehDescartavelEmLista("a@mailinator.com", lista)).toBe(true);
    expect(ehDescartavelEmLista("a@mail.yopmail.com", lista)).toBe(true);
    expect(ehDescartavelEmLista("a@gmail.com", lista)).toBe(false);
    expect(ehDescartavelEmLista("a@notmailinator.com", lista)).toBe(false);
  });
});

describe("lista completa (disposable-domains)", () => {
  const completos = new Set<string>(listaDescartavel);

  it("contém os temporários conhecidos", () => {
    for (const d of ["mailinator.com", "yopmail.com", "guerrillamail.com", "10minutemail.com"]) {
      expect(completos.has(d)).toBe(true);
    }
  });

  it("não contém provedor real nem domínio de teste dos E2E", () => {
    for (const d of ["gmail.com", "outlook.com", "example.invalid"]) {
      expect(completos.has(d)).toBe(false);
    }
  });

  it("barra via função um domínio só existente na lista completa", () => {
    expect(ehDescartavelEmLista("a@0-180.com", completos)).toBe(true);
    expect(ehDescartavelEmLista("teste-jl@example.invalid", completos)).toBe(false);
  });
});

describe("sugerirDominio", () => {
  it("sugere o domínio certo para erros comuns", () => {
    expect(sugerirDominio("gmal.com")).toBe("gmail.com");
    expect(sugerirDominio("hotmal.com")).toBe("hotmail.com");
    expect(sugerirDominio("outlok.com")).toBe("outlook.com");
    expect(sugerirDominio("yaho.com")).toBe("yahoo.com");
    expect(sugerirDominio("uol.con.br")).toBe("uol.com.br");
  });

  it("ignora caixa na comparação", () => {
    expect(sugerirDominio("GMAL.COM")).toBe("gmail.com");
  });

  it("não sugere para provedor real parecido (mail.com ≠ gmail.com)", () => {
    expect(sugerirDominio("mail.com")).toBeNull();
    expect(sugerirDominio("gmail.com")).toBeNull();
  });
});

describe("validarEmailCadastro", () => {
  it("aceita email válido e devolve normalizado", () => {
    expect(validarEmailCadastro("  Maria@Gmail.com ")).toEqual({
      ok: true,
      email: "maria@gmail.com",
    });
  });

  it("rejeita formato inválido", () => {
    expect(validarEmailCadastro("maria")).toEqual({
      ok: false,
      erro: "Digite um email válido.",
    });
  });

  it("rejeita descartável", () => {
    const r = validarEmailCadastro("alguem@mailinator.com");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erro).toContain("temporário");
  });

  it("rejeita erro de digitação com sugestão", () => {
    expect(validarEmailCadastro("maria@gmal.com")).toEqual({
      ok: false,
      erro: "Verifique o domínio: você quis dizer maria@gmail.com?",
    });
  });

  it("descartável ganha do erro de digitação", () => {
    const r = validarEmailCadastro("alguem@yopmail.fr");
    expect(r.ok).toBe(false);
  });
});
