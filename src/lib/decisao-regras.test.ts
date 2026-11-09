import { describe, expect, it } from "vitest";
import { avaliarDecisao, lerQuorum, validarJustificativa, type EntradaDecisao } from "./decisao-regras";

const agora = new Date("2026-12-10T12:00:00Z");
const base = (parcial: Partial<EntradaDecisao>): EntradaDecisao => ({
  contagem: [
    { id: "a", votos: 10 },
    { id: "b", votos: 5 },
    { id: "c", votos: 0 },
  ],
  escolhidas: ["a"],
  votantes: 15,
  membros: 20,
  regra: null,
  agora,
  ...parcial,
});

describe("avaliarDecisao", () => {
  it("mais votada e sem regra fica dentro da regra", () => {
    expect(avaliarDecisao(base({}))).toEqual([]);
  });

  it("opção menos votada exige justificativa", () => {
    expect(avaliarDecisao(base({ escolhidas: ["b"] }))).toEqual(["nao_mais_votada"]);
  });

  it("empate com opção que ficou de fora", () => {
    const contagem = [
      { id: "a", votos: 7 },
      { id: "b", votos: 7 },
    ];
    expect(avaliarDecisao(base({ contagem, votantes: 14 }))).toEqual(["empate"]);
  });

  it("múltipla: fixar as duas empatadas não é empate", () => {
    const contagem = [
      { id: "a", votos: 7 },
      { id: "b", votos: 7 },
      { id: "c", votos: 2 },
    ];
    expect(avaliarDecisao(base({ contagem, escolhidas: ["a", "b"] }))).toEqual([]);
  });

  it("múltipla: deixar de fora uma mais votada", () => {
    expect(avaliarDecisao(base({ escolhidas: ["a", "c"] }))).toEqual(["nao_mais_votada"]);
  });

  it("todas as opções escolhidas não tem com quem comparar", () => {
    expect(avaliarDecisao(base({ escolhidas: ["a", "b", "c"] }))).toEqual([]);
  });

  it("sem votos", () => {
    const contagem = [
      { id: "a", votos: 0 },
      { id: "b", votos: 0 },
    ];
    expect(avaliarDecisao(base({ contagem, votantes: 0 }))).toEqual(["sem_votos"]);
  });

  it("quórum não atingido", () => {
    const regra = { prazo: null, quorumPct: 80 };
    expect(avaliarDecisao(base({ regra }))).toEqual(["sem_quorum"]);
  });

  it("quórum exatamente atingido", () => {
    const regra = { prazo: null, quorumPct: 75 };
    expect(avaliarDecisao(base({ regra }))).toEqual([]);
  });

  it("antes do prazo com gente faltando votar", () => {
    const regra = { prazo: new Date("2026-12-12T02:59:00Z"), quorumPct: null };
    expect(avaliarDecisao(base({ regra }))).toEqual(["antes_do_prazo"]);
  });

  it("antes do prazo, mas todos já votaram", () => {
    const regra = { prazo: new Date("2026-12-12T02:59:00Z"), quorumPct: null };
    expect(avaliarDecisao(base({ regra, votantes: 20 }))).toEqual([]);
  });

  it("depois do prazo", () => {
    const regra = { prazo: new Date("2026-12-01T00:00:00Z"), quorumPct: null };
    expect(avaliarDecisao(base({ regra }))).toEqual([]);
  });

  it("acumula vários motivos", () => {
    const regra = { prazo: new Date("2026-12-12T00:00:00Z"), quorumPct: 90 };
    expect(avaliarDecisao(base({ regra, escolhidas: ["b"] }))).toEqual([
      "nao_mais_votada",
      "sem_quorum",
      "antes_do_prazo",
    ]);
  });
});

describe("validarJustificativa", () => {
  it("dentro da regra, pode ficar vazia", () => {
    expect(validarJustificativa([], "")).toBeNull();
  });

  it("fora da regra, exige texto", () => {
    expect(validarJustificativa(["empate"], "ok")).toMatch(/empatada/);
  });

  it("fora da regra, aceita texto suficiente", () => {
    expect(validarJustificativa(["empate"], "O buffet B desistiu da data.")).toBeNull();
  });

  it("recusa texto longo demais", () => {
    expect(validarJustificativa([], "x".repeat(501))).toMatch(/500/);
  });
});

describe("lerQuorum", () => {
  it("vazio = sem quórum", () => expect(lerQuorum(" ")).toBeNull());
  it("aceita número com %", () => expect(lerQuorum("50%")).toBe(50));
  it("recusa fora de 1 a 100", () => expect(lerQuorum("0")).toBe("invalido"));
  it("recusa decimal", () => expect(lerQuorum("50.5")).toBe("invalido"));
});
