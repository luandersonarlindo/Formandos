import { describe, expect, it } from "vitest";
import {
  listarRotulos,
  mudancasEvento,
  parcelasParaLembrar,
  somarDias,
  votacaoNaJanela,
} from "./lembretes-regras";

describe("votacaoNaJanela", () => {
  const agora = new Date("2026-12-10T12:00:00Z");
  it("prazo em 47 horas entra", () =>
    expect(votacaoNaJanela(new Date("2026-12-12T11:00:00Z"), agora)).toBe(true));
  it("prazo em 49 horas ainda não", () =>
    expect(votacaoNaJanela(new Date("2026-12-12T13:00:00Z"), agora)).toBe(false));
  it("prazo vencido não entra", () =>
    expect(votacaoNaJanela(new Date("2026-12-10T11:00:00Z"), agora)).toBe(false));
});

describe("somarDias", () => {
  it("vira o mês", () => expect(somarDias("2026-01-31", 2)).toBe("2026-02-02"));
  it("vira o ano", () => expect(somarDias("2026-12-31", 1)).toBe("2027-01-01"));
});

describe("parcelasParaLembrar", () => {
  const parcelas = [
    { id: "p1", numero: 1, valor: 100, vencimento: "2026-12-05" },
    { id: "p2", numero: 2, valor: 100, vencimento: "2026-12-11" },
    { id: "p3", numero: 3, valor: 100, vencimento: "2026-12-20" },
  ];
  it("só a parcela em aberto que vence em até 2 dias", () => {
    expect(parcelasParaLembrar(parcelas, [{ tipo: "pagamento", valor: 100 }], "2026-12-10")).toEqual([
      { id: "p2", numero: 2, vencimento: "2026-12-11", falta: 100 },
    ]);
  });
  it("parcela já paga não entra", () => {
    expect(parcelasParaLembrar(parcelas, [{ tipo: "pagamento", valor: 200 }], "2026-12-10")).toEqual([]);
  });
  it("paga em parte entra com o que falta", () => {
    expect(parcelasParaLembrar(parcelas, [{ tipo: "pagamento", valor: 150 }], "2026-12-10")[0].falta).toBe(50);
  });
  it("vencida não entra (o lembrete é antes do prazo)", () => {
    expect(parcelasParaLembrar(parcelas, [], "2026-12-10").map((p) => p.numero)).toEqual([2]);
  });
  it("vence hoje entra", () => {
    expect(parcelasParaLembrar(parcelas, [{ tipo: "pagamento", valor: 100 }], "2026-12-11").map((p) => p.numero)).toEqual([2]);
  });
});

describe("mudancasEvento", () => {
  const base = { inicio: "2026-12-19T20:00", local: "Chácara", endereco: "Rua A" };
  it("nada mudou", () => expect(mudancasEvento(base, { ...base })).toEqual([]));
  it("só o horário", () => {
    expect(mudancasEvento(base, { ...base, inicio: "2026-12-19T19:00" })).toEqual([
      { campo: "horario", rotulo: "horário", antes: "20:00", depois: "19:00" },
    ]);
  });
  it("data e horário", () => {
    const m = mudancasEvento(base, { ...base, inicio: "2026-12-20T19:00" });
    expect(m.map((x) => x.campo)).toEqual(["data", "horario"]);
    expect(m[0]).toMatchObject({ antes: "19/12/2026", depois: "20/12/2026" });
  });
  it("local e endereço", () => {
    const m = mudancasEvento(base, { ...base, local: "Salão", endereco: "" });
    expect(m).toEqual([
      { campo: "local", rotulo: "local", antes: "Chácara", depois: "Salão" },
      { campo: "endereco", rotulo: "endereço", antes: "Rua A", depois: "não informado" },
    ]);
  });
  it("preencher pela primeira vez não é mudança", () => {
    expect(mudancasEvento({ inicio: "", local: "", endereco: "" }, base)).toEqual([]);
  });
  it("tirar a data avisa", () => {
    expect(mudancasEvento(base, { ...base, inicio: "" })[0]).toMatchObject({ campo: "data", depois: "a definir" });
  });
});

describe("listarRotulos", () => {
  it("junta com vírgula e 'e'", () => {
    const m = mudancasEvento(
      { inicio: "2026-12-19T20:00", local: "A", endereco: "" },
      { inicio: "2026-12-20T19:00", local: "B", endereco: "" },
    );
    expect(listarRotulos(m)).toBe("data, horário e local");
  });
});
