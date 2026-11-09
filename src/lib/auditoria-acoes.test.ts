import { describe, expect, it } from "vitest";
import { ACOES_AUDITORIA, ACOES_VISIVEIS_TURMA, acoesVisiveis } from "./auditoria-acoes";

describe("ACOES_VISIVEIS_TURMA", () => {
  it("só mostra à turma as ações das decisões", () => {
    expect([...ACOES_VISIVEIS_TURMA].sort()).toEqual([
      "decisao.fixada",
      "decisao.reaberta",
      "evento.alterado",
      "opcao.valor_alterado",
      "plano.alterado",
      "regra.alterada",
    ]);
  });

  it("nunca mostra ações sobre pessoas ou contas", () => {
    const restritas = [
      "papel.trocado",
      "membro.removido",
      "conta.excluida",
      "turma.excluida",
      "papel.tesouraria",
      "pagamento.lancado",
      "pagamento.informado",
      "pagamento.confirmado",
      "pagamento.recusado",
      "pagamento.editado",
      "pagamento.excluido",
    ];
    for (const acao of restritas) {
      expect(ACOES_AUDITORIA).toContain(acao);
      expect(ACOES_VISIVEIS_TURMA as readonly string[]).not.toContain(acao);
    }
  });
});

describe("acoesVisiveis (ADR-0008)", () => {
  it("comissão não vê pagamento nem conta excluída", () => {
    const comissao = acoesVisiveis("comissao");
    expect(comissao.some((a) => a.startsWith("pagamento."))).toBe(false);
    expect(comissao).not.toContain("conta.excluida");
    expect(comissao).toContain("fornecedor.alterado");
    expect(comissao).toContain("turma.exportada");
  });
  it("tesouraria vê pagamentos, mas não conta excluída", () => {
    const tesouraria = acoesVisiveis("tesouraria");
    expect(tesouraria).toContain("pagamento.lancado");
    expect(tesouraria).not.toContain("conta.excluida");
  });
  it("turma vê só a lista fechada", () => {
    expect(acoesVisiveis("turma").sort()).toEqual([...ACOES_VISIVEIS_TURMA].sort());
    expect(acoesVisiveis("turma")).not.toContain("fornecedor.alterado");
  });
});
