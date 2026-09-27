// Leitor dos catálogos escritos em Markdown (catálogo padrão e catálogos-modelo).
// Usado pelo seed (db/seed.mjs) e pela tela "Novo catálogo" (src/lib/modelos.ts).

// Lê as categorias, enquetes e opções de um documento no formato de
// docs/catalogo-enquetes.md.
export function lerCatalogo(markdown) {
  const categorias = [];
  let categoria = null;
  let enquete = null;

  for (const linha of markdown.split("\n")) {
    let m;
    if ((m = linha.match(/^## \d+\.\s+(.+)$/))) {
      categoria = { nome: m[1].trim(), enquetes: [] };
      categorias.push(categoria);
      enquete = null;
    } else if (categoria && (m = linha.match(/^### \d+\.\d+\.\s+(.+)$/))) {
      enquete = { titulo: m[1].trim(), tipo: "unica", opcoes: [] };
      categoria.enquetes.push(enquete);
    } else if (enquete && (m = linha.match(/^> \*\*Tipo:\*\*\s+(.+)$/))) {
      enquete.tipo = /m[úu]ltipla/i.test(m[1]) ? "multipla" : "unica";
    } else if (enquete && (m = linha.match(/^- `\[\s*(.+?)\s*\]`(.*)$/))) {
      enquete.opcoes.push({
        texto: m[1],
        exclusiva: /\(exclusiva\)/i.test(m[2]),
      });
    }
  }
  return categorias;
}

// Catálogo-modelo: o mesmo formato, com um título `# Nome` e uma descrição na
// primeira linha `> ...` antes da primeira categoria.
export function lerModelo(markdown) {
  const antes = markdown.split(/^## /m)[0];
  const nome = antes.match(/^# (.+)$/m)?.[1].trim() ?? "";
  const descricao = antes.match(/^> (.+)$/m)?.[1].trim() ?? "";
  return { nome, descricao, categorias: lerCatalogo(markdown) };
}
