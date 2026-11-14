import { describe, expect, it } from "vitest";
import { escolherTurmaAtiva, podeEntrarEmOutraTurma } from "./vinculos";

describe("podeEntrarEmOutraTurma", () => {
  it("quem não tem turma pode entrar na primeira", () => {
    expect(podeEntrarEmOutraTurma([])).toBe(true);
  });
  it("administrador em alguma turma pode entrar em outra", () => {
    expect(podeEntrarEmOutraTurma(["participante", "admin"])).toBe(true);
    expect(podeEntrarEmOutraTurma(["admin"])).toBe(true);
  });
  it("só participante não pode", () => {
    expect(podeEntrarEmOutraTurma(["participante"])).toBe(false);
    expect(podeEntrarEmOutraTurma(["participante", "participante"])).toBe(false);
  });
  it("observador pode acompanhar outra turma (ADR-0012)", () => {
    expect(podeEntrarEmOutraTurma(["observador"])).toBe(true);
    expect(podeEntrarEmOutraTurma(["participante", "observador"])).toBe(true);
  });
});

describe("escolherTurmaAtiva", () => {
  const a = { turmaId: "a" };
  const b = { turmaId: "b" };
  it("sem turmas devolve null", () => {
    expect(escolherTurmaAtiva([], "a")).toBeNull();
  });
  it("usa a preferida quando o usuário é membro", () => {
    expect(escolherTurmaAtiva([a, b], "b")).toBe(b);
  });
  it("ignora preferida de turma alheia e usa a primeira", () => {
    expect(escolherTurmaAtiva([a, b], "outra")).toBe(a);
    expect(escolherTurmaAtiva([a, b], undefined)).toBe(a);
    expect(escolherTurmaAtiva([a, b], null)).toBe(a);
  });
});
