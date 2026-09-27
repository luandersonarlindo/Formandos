import { describe, expect, it } from "vitest";
import { calcularPaginas, deslocamento, lerPagina, limitarPagina } from "./paginacao";

describe("lerPagina", () => {
  it("lê inteiro positivo", () => {
    expect(lerPagina("1")).toBe(1);
    expect(lerPagina("7")).toBe(7);
  });
  it("lixo vira 1", () => {
    for (const ruim of [undefined, "", "abc", "-3", "0", "2.5", "1e9", " 2", "9999999999"]) {
      expect(lerPagina(ruim), String(ruim)).toBe(1);
    }
  });
  it("usa o primeiro valor quando o parâmetro se repete", () => {
    expect(lerPagina(["3", "5"])).toBe(3);
    expect(lerPagina([])).toBe(1);
  });
});

describe("calcularPaginas", () => {
  it("arredonda para cima e nunca passa de 1 para menos", () => {
    expect(calcularPaginas(0, 10)).toBe(1);
    expect(calcularPaginas(10, 10)).toBe(1);
    expect(calcularPaginas(11, 10)).toBe(2);
    expect(calcularPaginas(41, 20)).toBe(3);
  });
});

describe("limitarPagina", () => {
  it("mantém dentro do intervalo", () => {
    expect(limitarPagina(2, 5)).toBe(2);
    expect(limitarPagina(9, 5)).toBe(5);
    expect(limitarPagina(0, 5)).toBe(1);
  });
});

describe("deslocamento", () => {
  it("começa em zero na primeira página", () => {
    expect(deslocamento(1, 10)).toBe(0);
    expect(deslocamento(3, 20)).toBe(40);
  });
});
