import { describe, expect, it } from "vitest";
import { calcularSituacao, dataBr, gerarPlano, hojeBrasil, type Lancamento } from "./situacao-regras";

const plano = gerarPlano(3, 100, "2026-10-10"); // 10/10, 10/11, 10/12
const pag = (valor: number): Lancamento => ({ tipo: "pagamento", valor });

describe("calcularSituacao", () => {
  it("sem plano", () => {
    expect(calcularSituacao([], [], "2026-11-01").estado).toBe("sem_plano");
  });

  it("em dia: pagou a parcela vencida, a próxima ainda não venceu", () => {
    const s = calcularSituacao(plano, [pag(100)], "2026-11-01");
    expect(s.estado).toBe("em_dia");
    expect(s.pago).toBe(100);
    expect(s.falta).toBe(200);
    expect(s.proxima).toEqual({ numero: 2, vencimento: "2026-11-10", falta: 100 });
  });

  it("atrasado: parcela vencida sem pagamento", () => {
    const s = calcularSituacao(plano, [], "2026-10-11");
    expect(s.estado).toBe("atrasado");
    expect(s.parcelas[0].estado).toBe("vencida");
    expect(s.parcelas[0].emAtraso).toBe(true);
  });

  it("no dia do vencimento ainda não está atrasado", () => {
    expect(calcularSituacao(plano, [], "2026-10-10").estado).toBe("em_dia");
  });

  it("parcela dupla: um pagamento cobre duas parcelas", () => {
    const s = calcularSituacao(plano, [pag(200)], "2026-10-15");
    expect(s.parcelas.map((p) => p.estado)).toEqual(["paga", "paga", "a_vencer"]);
    expect(s.estado).toBe("adiantado");
  });

  it("pagamento parcial", () => {
    const s = calcularSituacao(plano, [pag(150)], "2026-11-15");
    expect(s.parcelas[1]).toMatchObject({ estado: "parcial", coberto: 50, falta: 50, emAtraso: true });
    expect(s.estado).toBe("atrasado");
    expect(s.proxima).toEqual({ numero: 2, vencimento: "2026-11-10", falta: 50 });
  });

  it("devolução subtrai e ajuste soma", () => {
    const s = calcularSituacao(
      plano,
      [pag(300), { tipo: "devolucao", valor: 100 }, { tipo: "ajuste", valor: 50 }],
      "2026-12-20",
    );
    expect(s.pago).toBe(250);
    expect(s.falta).toBe(50);
  });

  it("quitado", () => {
    const s = calcularSituacao(plano, [pag(100), pag(100), pag(100)], "2027-01-01");
    expect(s.estado).toBe("quitado");
    expect(s.proxima).toBeNull();
    expect(s.falta).toBe(0);
  });

  it("centavos não acumulam erro", () => {
    const tres = gerarPlano(3, 33.33, "2026-10-10");
    const s = calcularSituacao(tres, [pag(33.33), pag(33.33), pag(33.33)], "2027-01-01");
    expect(s.totalPlano).toBe(99.99);
    expect(s.estado).toBe("quitado");
  });

  it("devolução maior que o pago não deixa parcela coberta", () => {
    const s = calcularSituacao(plano, [pag(50), { tipo: "devolucao", valor: 80 }], "2026-10-01");
    expect(s.pago).toBe(-30);
    expect(s.parcelas.every((p) => p.coberto === 0)).toBe(true);
  });
});

describe("gerarPlano", () => {
  it("mensal, numerado a partir de 1", () => {
    expect(plano.map((p) => [p.numero, p.vencimento])).toEqual([
      [1, "2026-10-10"],
      [2, "2026-11-10"],
      [3, "2026-12-10"],
    ]);
  });

  it("dia 31 vira o último dia do mês curto e volta a 31 depois", () => {
    expect(gerarPlano(3, 50, "2027-01-31").map((p) => p.vencimento)).toEqual([
      "2027-01-31",
      "2027-02-28",
      "2027-03-31",
    ]);
  });

  it("ano bissexto e virada de ano", () => {
    expect(gerarPlano(3, 50, "2027-12-29").map((p) => p.vencimento)).toEqual([
      "2027-12-29",
      "2028-01-29",
      "2028-02-29",
    ]);
  });
});

describe("datas", () => {
  it("hoje no fuso de Brasília", () => {
    // 02:00 UTC do dia 11 ainda é dia 10 em Brasília.
    expect(hojeBrasil(new Date("2026-12-11T02:00:00Z"))).toBe("2026-12-10");
  });
  it("dataBr", () => expect(dataBr("2026-12-10")).toBe("10/12/2026"));
});
