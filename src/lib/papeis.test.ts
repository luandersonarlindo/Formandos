import { describe, expect, it } from "vitest";
import { contaComoFormandoSql, ehObservador, ROTULO_PAPEL } from "./papeis";

describe("papéis da turma (ADR-0012)", () => {
  it("só o observador é observador", () => {
    expect(ehObservador("observador")).toBe(true);
    expect(ehObservador("admin")).toBe(false);
    expect(ehObservador("participante")).toBe(false);
  });

  it("todo papel tem nome para a tela", () => {
    expect(ROTULO_PAPEL).toEqual({
      admin: "Administrador",
      participante: "Participante",
      observador: "Observador",
    });
  });

  it("o filtro de quem conta aceita apelido de tabela e recusa texto estranho", () => {
    expect(contaComoFormandoSql()).toBe("papel <> 'observador'");
    expect(contaComoFormandoSql("m")).toBe("m.papel <> 'observador'");
    expect(() => contaComoFormandoSql("m; drop table")).toThrow();
  });
});
