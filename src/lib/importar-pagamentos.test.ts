import { describe, expect, it } from "vitest";
import {
  chavePagamento,
  descontarExistentes,
  lerDataPlanilha,
  lerPlanilhaPagamentos,
  MAX_LINHAS_IMPORTACAO,
} from "./importar-pagamentos";

const HOJE = "2026-11-14";

describe("lerDataPlanilha", () => {
  it("aceita data brasileira e ISO", () => {
    expect(lerDataPlanilha("15/03/2026")).toBe("2026-03-15");
    expect(lerDataPlanilha("5/3/2026")).toBe("2026-03-05");
    expect(lerDataPlanilha("2026-03-15")).toBe("2026-03-15");
  });
  it("recusa data que não existe ou em outro formato", () => {
    expect(lerDataPlanilha("31/02/2026")).toBeNull();
    expect(lerDataPlanilha("15-03-2026")).toBeNull();
    expect(lerDataPlanilha("15/03/26")).toBeNull();
    expect(lerDataPlanilha("")).toBeNull();
  });
});

describe("lerPlanilhaPagamentos", () => {
  it("lê linhas separadas por tabulação, como sai da planilha", () => {
    const r = lerPlanilhaPagamentos("Ana@Email.com\tR$ 1.250,00\t15/03/2026\tPix\tPai da Ana\tParcelas 1 e 2", HOJE);
    expect(r.problemas).toEqual([]);
    expect(r.linhas).toEqual([
      {
        linha: 1,
        email: "ana@email.com",
        valor: 1250,
        data: "2026-03-15",
        forma: "pix",
        pagoPor: "Pai da Ana",
        referencia: "Parcelas 1 e 2",
      },
    ]);
  });
  it("lê linhas separadas por ponto e vírgula e completa o que é opcional", () => {
    const r = lerPlanilhaPagamentos("ana@email.com; 150,50; 2026-03-15", HOJE);
    expect(r.linhas[0]).toMatchObject({ valor: 150.5, forma: "pix", pagoPor: null, referencia: null });
  });
  it("ignora o cabeçalho e as linhas em branco, mas guarda o número da linha colada", () => {
    const r = lerPlanilhaPagamentos("Email;Valor;Data\n\nana@email.com;100;01/02/2026", HOJE);
    expect(r.linhas.map((l) => l.linha)).toEqual([3]);
    expect(r.problemas).toEqual([]);
  });
  it("aceita transferência com acento e dinheiro", () => {
    const r = lerPlanilhaPagamentos("a@x.com;10;01/02/2026;Transferência\nb@x.com;10;01/02/2026;DINHEIRO", HOJE);
    expect(r.linhas.map((l) => l.forma)).toEqual(["transferencia", "dinheiro"]);
  });
  it("aponta cada problema com o número da linha", () => {
    const r = lerPlanilhaPagamentos(
      [
        "ana@email.com;100;01/02/2026",
        "sem-arroba;100;01/02/2026",
        "b@x.com;abc;01/02/2026",
        "c@x.com;0;01/02/2026",
        "d@x.com;100;31/02/2026",
        "e@x.com;100;01/01/2027",
        "f@x.com;100;01/02/2026;cheque",
        "g@x.com;100",
      ].join("\n"),
      HOJE,
    );
    expect(r.linhas).toHaveLength(1);
    expect(r.problemas.map((p) => p.linha)).toEqual([2, 3, 4, 5, 6, 7, 8]);
    expect(r.problemas[4].motivo).toContain("futuro");
    expect(r.problemas[5].motivo).toContain("forma desconhecida");
    expect(r.problemas[6].motivo).toContain("faltam colunas");
  });
  it("vírgula não separa colunas", () => {
    const r = lerPlanilhaPagamentos("ana@email.com,100,01/02/2026", HOJE);
    expect(r.linhas).toEqual([]);
    expect(r.problemas).toHaveLength(1);
  });
  it("para em 500 linhas", () => {
    const texto = Array.from({ length: MAX_LINHAS_IMPORTACAO + 3 }, () => "a@x.com;1;01/02/2026").join("\n");
    const r = lerPlanilhaPagamentos(texto, HOJE);
    expect(r.linhas).toHaveLength(MAX_LINHAS_IMPORTACAO);
    expect(r.excedeu).toBe(true);
  });
});

describe("descontarExistentes", () => {
  const linha = (id: string, valor: number, data: string) => ({ chave: chavePagamento(id, valor, data) });
  it("colar de novo não duplica", () => {
    const linhas = [linha("u1", 100, "2026-02-01"), linha("u2", 50, "2026-02-01")];
    const existentes = new Map([[chavePagamento("u1", 100, "2026-02-01"), 1]]);
    expect(descontarExistentes(linhas, existentes)).toEqual({ novas: [linhas[1]], repetidas: 1 });
  });
  it("dois pagamentos iguais no mesmo dia: entra só o que falta", () => {
    const linhas = [linha("u1", 100, "2026-02-01"), linha("u1", 100, "2026-02-01")];
    const chave = chavePagamento("u1", 100, "2026-02-01");
    expect(descontarExistentes(linhas, new Map()).novas).toHaveLength(2);
    expect(descontarExistentes(linhas, new Map([[chave, 1]]))).toMatchObject({ repetidas: 1 });
    expect(descontarExistentes(linhas, new Map([[chave, 2]])).novas).toHaveLength(0);
  });
  it("valor com centavos diferentes não é o mesmo pagamento", () => {
    expect(chavePagamento("u1", 100, "2026-02-01")).not.toBe(chavePagamento("u1", 100.5, "2026-02-01"));
  });
});
