import { describe, expect, it } from "vitest";
import { validarSelecao, type OpcaoInfo } from "./votos-regras";

const E = "11111111-1111-1111-1111-111111111111";
const outra = (exclusiva = false): OpcaoInfo => ({ enqueteId: E, exclusiva });

describe("validarSelecao", () => {
  it("aceita uma opção em pergunta de seleção única", () => {
    const opcoes = new Map([["a", outra()]]);
    expect(validarSelecao(E, "unica", ["a"], opcoes)).toBeNull();
  });

  it("recusa duas opções em pergunta de seleção única", () => {
    const opcoes = new Map([["a", outra()], ["b", outra()]]);
    expect(validarSelecao(E, "unica", ["a", "b"], opcoes)).toBe("Escolha apenas uma opção.");
  });

  it("aceita várias opções em pergunta múltipla", () => {
    const opcoes = new Map([["a", outra()], ["b", outra()]]);
    expect(validarSelecao(E, "multipla", ["a", "b"], opcoes)).toBeNull();
  });

  it("recusa a mesma opção escolhida duas vezes", () => {
    const opcoes = new Map([["a", outra()]]);
    expect(validarSelecao(E, "multipla", ["a", "a"], opcoes)).toBe(
      "Escolha apenas uma vez cada opção.",
    );
  });

  it("recusa opção que não pertence à enquete", () => {
    const opcoes = new Map([["a", { enqueteId: "outra-enquete", exclusiva: false }]]);
    expect(validarSelecao(E, "unica", ["a"], opcoes)).toBe("Opção inválida para esta pergunta.");
  });

  it("aceita a opção exclusiva sozinha", () => {
    const opcoes = new Map([["a", outra(true)]]);
    expect(validarSelecao(E, "multipla", ["a"], opcoes)).toBeNull();
  });

  it("recusa a opção exclusiva combinada com outra", () => {
    const opcoes = new Map([["a", outra(true)], ["b", outra()]]);
    expect(validarSelecao(E, "multipla", ["a", "b"], opcoes)).toBe(
      "Essa opção não pode ser combinada com as outras.",
    );
  });
});
