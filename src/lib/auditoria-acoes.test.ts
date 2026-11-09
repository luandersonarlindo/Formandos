import { describe, expect, it } from "vitest";
import { ACOES_AUDITORIA, ACOES_VISIVEIS_TURMA } from "./auditoria-acoes";

describe("ACOES_VISIVEIS_TURMA", () => {
  it("só mostra à turma as ações das decisões", () => {
    expect([...ACOES_VISIVEIS_TURMA].sort()).toEqual([
      "decisao.fixada",
      "decisao.reaberta",
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
