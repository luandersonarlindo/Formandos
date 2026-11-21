import { describe, expect, it } from "vitest";
import { erroTurmaNovaEncerramento, lerDataEncerramento, textoFaixaEncerramento } from "./encerramento";

describe("lerDataEncerramento (ADR-0021)", () => {
  it("aceita AAAA-MM-DD", () => expect(lerDataEncerramento(" 2027-03-01 ")).toBe("2027-03-01"));
  it("sem valor, sem encerramento", () => {
    expect(lerDataEncerramento(undefined)).toBeNull();
    expect(lerDataEncerramento("")).toBeNull();
  });
  it("recusa formato e data que não existem", () => {
    expect(lerDataEncerramento("01/03/2027")).toBeNull();
    expect(lerDataEncerramento("2027-02-30")).toBeNull();
    expect(lerDataEncerramento("2027-13-01")).toBeNull();
  });
});

describe("textos do encerramento", () => {
  it("faixa com a data e o que fazer", () => {
    expect(textoFaixaEncerramento("2027-03-01")).toBe(
      "O Formandos será encerrado em 01/03/2027. Até lá tudo continua funcionando. Baixe seus dados em Minha conta e o registro da turma.",
    );
  });
  it("recusa de turma nova", () => {
    expect(erroTurmaNovaEncerramento("2027-03-01")).toBe(
      "O Formandos será encerrado em 01/03/2027 e não aceita turmas novas.",
    );
  });
});
