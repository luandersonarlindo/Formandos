import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { lerCatalogo, lerModelo } from "../../db/catalogo-md.mjs";

// Garante que o catálogo padrão e os modelos respeitam os mesmos limites que a
// tela de perguntas impõe (src/actions/catalogos.ts).
const docs = path.join(process.cwd(), "docs");
const pastaModelos = path.join(docs, "catalogos-modelo");

const catalogos = [
  { nome: "catálogo padrão", md: readFileSync(path.join(docs, "catalogo-enquetes.md"), "utf8") },
  ...readdirSync(pastaModelos)
    .filter((a) => a.endsWith(".md"))
    .map((a) => ({ nome: a, md: readFileSync(path.join(pastaModelos, a), "utf8") })),
];

describe("lerModelo", () => {
  it("lê título, descrição e categorias", () => {
    const m = lerModelo(
      "# Meu modelo\n\n> Uma descrição.\n\n## 1. Cat\n\n### 1.1. Pergunta de teste?\n> **Tipo:** Seleção Múltipla\n\n- `[ A ]`\n- `[ B ]` *(exclusiva)*\n",
    );
    expect(m.nome).toBe("Meu modelo");
    expect(m.descricao).toBe("Uma descrição.");
    expect(m.categorias[0].enquetes[0]).toEqual({
      titulo: "Pergunta de teste?",
      tipo: "multipla",
      opcoes: [
        { texto: "A", exclusiva: false },
        { texto: "B", exclusiva: true },
      ],
    });
  });
});

describe("catálogos em Markdown", () => {
  it("há pelo menos um modelo", () => {
    expect(catalogos.length).toBeGreaterThan(1);
  });

  for (const { nome, md } of catalogos) {
    describe(nome, () => {
      const categorias = lerCatalogo(md);

      it("respeita os limites de categorias e perguntas", () => {
        expect(categorias.length).toBeGreaterThan(0);
        expect(categorias.length).toBeLessThanOrEqual(20);
        for (const c of categorias) {
          expect(c.nome.length).toBeLessThanOrEqual(100);
          expect(c.enquetes.length).toBeGreaterThan(0);
          expect(c.enquetes.length).toBeLessThanOrEqual(50);
        }
      });

      it("cada pergunta tem 2 a 12 opções sem repetição", () => {
        for (const e of categorias.flatMap((c) => c.enquetes)) {
          expect(e.titulo.length, e.titulo).toBeGreaterThanOrEqual(5);
          expect(e.titulo.length, e.titulo).toBeLessThanOrEqual(500);
          expect(e.opcoes.length, e.titulo).toBeGreaterThanOrEqual(2);
          expect(e.opcoes.length, e.titulo).toBeLessThanOrEqual(12);
          const textos = e.opcoes.map((o) => o.texto.toLowerCase());
          expect(new Set(textos).size, e.titulo).toBe(textos.length);
          for (const o of e.opcoes) expect(o.texto.length, o.texto).toBeLessThanOrEqual(255);
        }
      });

      it("opção exclusiva só em pergunta múltipla e no máximo uma por pergunta", () => {
        for (const e of categorias.flatMap((c) => c.enquetes)) {
          const exclusivas = e.opcoes.filter((o) => o.exclusiva);
          if (e.tipo === "unica") expect(exclusivas, e.titulo).toHaveLength(0);
          expect(exclusivas.length, e.titulo).toBeLessThanOrEqual(1);
        }
      });

      it("não repete título de pergunta", () => {
        const titulos = categorias.flatMap((c) => c.enquetes.map((e) => e.titulo));
        expect(new Set(titulos).size).toBe(titulos.length);
      });
    });
  }

  it("cada modelo tem nome e descrição", () => {
    for (const { nome, md } of catalogos.slice(1)) {
      const m = lerModelo(md);
      expect(m.nome, nome).not.toBe("");
      expect(m.descricao, nome).not.toBe("");
    }
  });
});
