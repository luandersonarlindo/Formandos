import { describe, expect, it } from "vitest";
import { nomeDeArquivo, paraCsv } from "./csv";

describe("paraCsv", () => {
  it("BOM, ponto e vírgula e CRLF", () => {
    expect(paraCsv(["nome", "valor"], [["Ana", 95.5]])).toBe("﻿nome;valor\r\nAna;95,5\r\n");
  });
  it("aspas quando tem ; aspas ou quebra de linha", () => {
    expect(paraCsv(["x"], [['a;b'], ['diz "oi"'], ["linha\nnova"]])).toBe(
      '﻿x\r\n"a;b"\r\n"diz ""oi"""\r\n"linha\nnova"\r\n',
    );
  });
  it("vazio para nulo e indefinido", () => {
    expect(paraCsv(["a", "b"], [[null, undefined]])).toBe("﻿a;b\r\n;\r\n");
  });
  it("célula que parece fórmula ganha apóstrofo", () => {
    for (const perigo of ["=1+1", "+55", "-2", "@soma", "\tx"]) {
      expect(paraCsv(["x"], [[perigo]]).split("\r\n")[1]).toMatch(/^"?'/);
    }
  });
  it("número negativo não é tratado como fórmula", () => {
    expect(paraCsv(["v"], [[-30]])).toBe("﻿v\r\n-30\r\n");
  });
});

describe("nomeDeArquivo", () => {
  it("sem acento e sem espaço", () => {
    expect(nomeDeArquivo("Sistemas de Informação 2026")).toBe("sistemas-de-informacao-2026");
  });
  it("nunca vazio", () => expect(nomeDeArquivo("!!!")).toBe("turma"));
});
