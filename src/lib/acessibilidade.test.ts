import { describe, expect, it } from "vitest";
import { SEM_RESPOSTA, lerResposta, linhasAcessibilidade, valorDoSelect } from "./acessibilidade";

const vazia = { rampa: null, estacionamento: null, banheiro: null, obs: null };

describe("acessibilidade do local (ADR-0024)", () => {
  it("lê o select: vazio é não informado, nunca não", () => {
    expect(lerResposta("sim")).toBe(true);
    expect(lerResposta("nao")).toBe(false);
    expect(lerResposta("")).toBeNull();
    expect(lerResposta(null)).toBeNull();
    expect(lerResposta("talvez")).toBeNull();
  });
  it("valor do select volta igual", () => {
    for (const v of [true, false, null]) expect(lerResposta(valorDoSelect(v))).toBe(v);
  });
  it("sem nenhuma resposta, uma linha só", () => {
    expect(linhasAcessibilidade(vazia)).toEqual([SEM_RESPOSTA]);
  });
  it("com uma resposta, as três linhas, com não informado", () => {
    expect(linhasAcessibilidade({ ...vazia, rampa: true, banheiro: false })).toEqual([
      "Rampa ou entrada sem degrau: sim",
      "Estacionamento perto da entrada: não informado",
      "Banheiro adaptado: não",
    ]);
  });
  it("só a observação também conta como resposta", () => {
    expect(linhasAcessibilidade({ ...vazia, obs: "Elevador pela lateral" })).toHaveLength(3);
  });
});
