import { describe, expect, it } from "vitest";
import { formatarHora, formatarPrazo, hojeIso } from "./datas";

describe("formatarPrazo", () => {
  it("converte AAAA-MM-DD em DD/MM/AAAA sem mudar o dia", () => {
    expect(formatarPrazo("2026-12-01")).toBe("01/12/2026");
    expect(formatarPrazo("2020-01-10")).toBe("10/01/2020");
  });
});

describe("hojeIso", () => {
  it("devolve uma data no formato AAAA-MM-DD", () => {
    expect(hojeIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("formatarHora", () => {
  it("usa o fuso de Brasília, independente do servidor", () => {
    // 23:00 UTC = 20:00 em Brasília (UTC-3).
    expect(formatarHora.format(new Date("2026-12-12T23:00:00Z"))).toBe("20:00");
  });
});
