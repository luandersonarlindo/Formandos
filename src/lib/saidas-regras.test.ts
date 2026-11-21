import { describe, expect, it } from "vitest";
import {
  OUTRAS_DESPESAS,
  detalheAuditoria,
  resumoPorFornecedor,
  saidaParaTurma,
  saldoCaixa,
  totalSaidas,
  type Saida,
} from "./saidas-regras";

const saida = (parcial: Partial<Saida> = {}): Saida => ({
  id: "s1",
  descricao: "Sinal do buffet",
  valor: 1500,
  pagoEm: "2026-11-10",
  referencia: "E123",
  soComissao: false,
  fornecedorId: "f1",
  fornecedor: "Buffet Sabor",
  ...parcial,
});

describe("saidaParaTurma (ADR-0022)", () => {
  it("a turma vê descrição, valor, data e fornecedor, sem referência", () => {
    expect(saidaParaTurma(saida())).toEqual({
      id: "s1",
      descricao: "Sinal do buffet",
      valor: 1500,
      pagoEm: "2026-11-10",
      fornecedor: "Buffet Sabor",
    });
  });
  it("só da comissão: Outras despesas, sem fornecedor, com o valor", () => {
    expect(saidaParaTurma(saida({ soComissao: true, descricao: "Tarifa do banco" }))).toEqual({
      id: "s1",
      descricao: OUTRAS_DESPESAS,
      valor: 1500,
      pagoEm: "2026-11-10",
      fornecedor: null,
    });
  });
});

describe("detalheAuditoria", () => {
  it("só da comissão nunca leva a descrição para o histórico", () => {
    const d = detalheAuditoria(saida({ soComissao: true, descricao: "Tarifa do banco" }));
    expect(d.descricao).toBe(OUTRAS_DESPESAS);
    expect(JSON.stringify(d)).not.toContain("Tarifa");
  });
});

describe("totais", () => {
  it("soma em centavos e saldo", () => {
    expect(totalSaidas([{ valor: 0.1 }, { valor: 0.2 }])).toBe(0.3);
    expect(saldoCaixa(1000, 1500.5)).toBe(-500.5);
  });
});

describe("resumoPorFornecedor", () => {
  const fornecedores = [
    { id: "f1", nome: "Buffet", status: "contratado", valorOrcado: 5000 },
    { id: "f2", nome: "DJ", status: "cotando", valorOrcado: 800 },
    { id: "f3", nome: "Foto", status: "contratado", valorOrcado: null },
    { id: "f4", nome: "Banda", status: "descartado", valorOrcado: 900 },
  ];
  it("contratado, pago e falta; entra quem é contratado ou teve saída", () => {
    const r = resumoPorFornecedor(fornecedores, [
      { fornecedorId: "f1", valor: 1500 },
      { fornecedorId: "f1", valor: 1000 },
      { fornecedorId: "f4", valor: 100 },
      { fornecedorId: null, valor: 30 },
    ]);
    expect(r).toEqual([
      { id: "f1", nome: "Buffet", contratado: 5000, pago: 2500, falta: 2500 },
      { id: "f3", nome: "Foto", contratado: null, pago: 0, falta: null },
      { id: "f4", nome: "Banda", contratado: 900, pago: 100, falta: 800 },
    ]);
  });
  it("pagar além do orçado não dá falta negativa", () => {
    expect(resumoPorFornecedor([fornecedores[0]], [{ fornecedorId: "f1", valor: 6000 }])[0].falta).toBe(0);
  });
});
