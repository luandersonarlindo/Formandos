import { describe, expect, it } from "vitest";
import { MAX_CONVITES_POR_VEZ, lerListaConvites } from "./convite-lista";

describe("lerListaConvites", () => {
  it("só email, nome; email, vírgula, tab e email antes do nome", () => {
    const r = lerListaConvites(
      "ana@ex.com\nBruno Lima; bruno@ex.com\nCarla, CARLA@EX.COM\nDavi\tdavi@ex.com\neva@ex.com; Eva Souza",
    );
    expect(r.validos).toEqual([
      { nome: null, email: "ana@ex.com" },
      { nome: "Bruno Lima", email: "bruno@ex.com" },
      { nome: "Carla", email: "carla@ex.com" },
      { nome: "Davi", email: "davi@ex.com" },
      { nome: "Eva Souza", email: "eva@ex.com" },
    ]);
  });
  it("repetido conta uma vez, ignorando maiúsculas", () => {
    const r = lerListaConvites("a@ex.com\nA@EX.com");
    expect(r.validos).toHaveLength(1);
    expect(r.repetidos).toBe(1);
  });
  it("linha sem email válido vai para inválidas", () => {
    const r = lerListaConvites("Fulano sem email\nana@ex\n\n  ");
    expect(r.invalidas).toEqual(["Fulano sem email", "ana@ex"]);
  });
  it("email entre < > como sai do Gmail", () => {
    expect(lerListaConvites("Ana <ana@ex.com>").validos[0].email).toBe("ana@ex.com");
  });
  it("corta no limite", () => {
    const texto = Array.from({ length: MAX_CONVITES_POR_VEZ + 5 }, (_, i) => `p${i}@ex.com`).join("\n");
    const r = lerListaConvites(texto);
    expect(r.validos).toHaveLength(MAX_CONVITES_POR_VEZ);
    expect(r.excedeu).toBe(true);
  });
});
