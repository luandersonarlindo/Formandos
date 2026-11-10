import { describe, expect, it } from "vitest";
import {
  PRAZOS_EXCLUSAO,
  dataExclusao,
  deveAvisarExclusao,
  diasAte,
  ePrazoValido,
  somarDias,
} from "./fim-da-turma-regras";

describe("prazos de exclusão (ADR-0009)", () => {
  it("só aceita 30, 60, 90 e 180 dias", () => {
    expect([...PRAZOS_EXCLUSAO]).toEqual([30, 60, 90, 180]);
    expect(ePrazoValido(90)).toBe(true);
    expect(ePrazoValido(0)).toBe(false);
    expect(ePrazoValido(365)).toBe(false);
  });

  it("soma dias atravessando mês e ano", () => {
    expect(somarDias("2026-11-09", 90)).toBe("2027-02-07");
    expect(somarDias("2026-12-31", 1)).toBe("2027-01-01");
    expect(somarDias("2028-02-28", 1)).toBe("2028-02-29");
  });

  it("nunca dá menos de 30 dias", () => {
    for (const p of PRAZOS_EXCLUSAO) {
      expect(diasAte("2026-11-09", dataExclusao("2026-11-09", p))).toBeGreaterThanOrEqual(30);
    }
  });

  it("avisa com 7 dias ou menos", () => {
    expect(deveAvisarExclusao("2026-11-09", "2026-11-17")).toBe(false);
    expect(deveAvisarExclusao("2026-11-09", "2026-11-16")).toBe(true);
    expect(deveAvisarExclusao("2026-11-09", "2026-11-01")).toBe(true);
  });
});
