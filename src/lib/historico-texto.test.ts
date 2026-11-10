import { describe, expect, it } from "vitest";
import { ACOES_AUDITORIA } from "./auditoria-acoes";
import { descreverAcao } from "./historico-texto";

describe("descreverAcao", () => {
  it("toda ação tem frase", () => {
    for (const acao of ACOES_AUDITORIA) {
      expect(descreverAcao(acao, {}).frase.length).toBeGreaterThan(5);
    }
  });

  it("decisão fora da regra traz números, motivo e alerta", () => {
    const r = descreverAcao("decisao.fixada", {
      pergunta: "Qual buffet?",
      escolhidas: ["Buffet B"],
      votantes: 22,
      membros: 38,
      foraDaRegra: ["nao_mais_votada"],
      justificativa: "O A não tem a data.",
    });
    expect(r.frase).toBe("fixou “Buffet B” em “Qual buffet?”.");
    expect(r.detalhes).toEqual([
      "Votaram 22 de 38.",
      "Fora da regra: A opção escolhida não é a mais votada.",
      "Motivo da comissão: “O A não tem a data.”",
    ]);
    expect(r.alerta).toBe(true);
  });

  it("evento mostra antes e depois", () => {
    expect(
      descreverAcao("evento.alterado", { mudancas: [{ rotulo: "horário", antes: "20:00", depois: "19:00" }] }).frase,
    ).toBe("mudou o evento: horário de 20:00 para 19:00.");
  });

  it("fornecedor: valor e situação", () => {
    expect(
      descreverAcao("fornecedor.alterado", {
        fornecedor: "Buffet B",
        valorAntes: 9000,
        valorDepois: 9500,
        statusAntes: "cotando",
        statusDepois: "contratado",
      }).frase,
    ).toMatch(/^mudou o fornecedor “Buffet B”: valor de R\$\s9\.000,00 para R\$\s9\.500,00; situação de cotando para contratado\.$/);
  });

  it("membro removido nunca mostra email", () => {
    const r = descreverAcao("membro.removido", { email: "ana@ex.com", nome: "Ana", por: "admin" });
    expect(r.frase).toBe("removeu Ana da turma.");
    expect(JSON.stringify(r)).not.toContain("ana@ex.com");
  });

  it("usa o nome achado pelo banco quando há", () => {
    expect(descreverAcao("papel.tesouraria", { tesouraria: true }, "Maria").frase).toBe("pôs Maria na tesouraria.");
  });

  it("plano: montar e ajustar parcela", () => {
    expect(
      descreverAcao("plano.alterado", {
        antes: [],
        depois: [
          { numero: 1, valor: 100, vencimento: "2026-10-10" },
          { numero: 2, valor: 100, vencimento: "2026-11-10" },
        ],
      }).frase,
    ).toMatch(/^montou o plano de parcelas: 2 × R\$\s100,00, a partir de 10\/10\/2026\.$/);
  });

  it("arquivar e mudar a data mostram as datas (ADR-0009)", () => {
    expect(descreverAcao("turma.arquivada", { excluirEm: "2027-02-07" }).detalhes).toEqual([
      "Tudo será excluído em 07/02/2027.",
    ]);
    expect(descreverAcao("turma.prazo_exclusao", { antes: "2027-02-07", depois: "2027-05-08" }).detalhes).toEqual([
      "Era 07/02/2027, agora é 08/05/2027.",
    ]);
  });
});
