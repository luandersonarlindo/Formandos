import { describe, expect, it } from "vitest";
import { fraseDaContagem, partesDaContagem } from "./contagem";

const MIN = 60_000;
const HORA = 60 * MIN;
const DIA = 24 * HORA;

describe("partesDaContagem", () => {
  it("separa dias, horas e minutos", () => {
    expect(partesDaContagem(39 * DIA + 23 * HORA + 59 * MIN + 30_000)).toEqual({
      dias: 39,
      horas: 23,
      minutos: 59,
    });
  });

  it("não devolve número negativo", () => {
    expect(partesDaContagem(-5 * MIN)).toEqual({ dias: 0, horas: 0, minutos: 0 });
  });
});

describe("fraseDaContagem", () => {
  it("junta as três partes numa frase", () => {
    expect(fraseDaContagem(39 * DIA + 23 * HORA + 59 * MIN)).toBe(
      "Faltam 39 dias, 23 horas e 59 minutos para o evento.",
    );
  });

  it("usa o singular em cada parte e no verbo", () => {
    expect(fraseDaContagem(DIA + HORA + MIN)).toBe("Falta 1 dia, 1 hora e 1 minuto para o evento.");
  });

  it("mantém as horas zeradas quando ainda há dias", () => {
    expect(fraseDaContagem(2 * DIA + 5 * MIN)).toBe("Faltam 2 dias, 0 horas e 5 minutos para o evento.");
  });

  it("some com os dias quando falta menos de um dia", () => {
    expect(fraseDaContagem(3 * HORA + 10 * MIN)).toBe("Faltam 3 horas e 10 minutos para o evento.");
  });

  it("fica só com os minutos na última hora", () => {
    expect(fraseDaContagem(12 * MIN)).toBe("Faltam 12 minutos para o evento.");
    expect(fraseDaContagem(MIN)).toBe("Falta 1 minuto para o evento.");
  });
});
