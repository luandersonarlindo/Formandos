// Gera os arquivos .doc (Word 97-2003) de docs/entregas a partir dos .md.
//
// Uso: node scripts/docs/gerar-doc.mjs [arquivo.md | pasta ...]
//   Sem argumentos, converte todos os .md de docs/entregas (menos o README).
// O Markdown vira HTML (marked, via npx) e o LibreOffice headless grava o .doc.
//
// Precisa de Node 22+, npx (com internet na primeira vez) e LibreOffice
// (ou SOFFICE=/caminho/do/soffice).

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const SOFFICE = process.env.SOFFICE ?? "soffice";

// CSS pensado para o importador do LibreOffice, bem mais limitado que o
// Chrome: só formatação básica de texto, tabela e código.
const CSS = `
body { font-family: "Liberation Sans", Arial, sans-serif; font-size: 10.5pt; line-height: 1.4; color: #1a1a1a; }
h1 { font-size: 20pt; color: #1e3a8a; border-bottom: 2px solid #4f46e5; }
h2 { font-size: 14pt; color: #1e3a8a; }
h3 { font-size: 11.5pt; color: #312e81; }
p { margin: 5pt 0; }
ul, ol { margin: 5pt 0; }
li { margin: 2pt 0; }
table { border-collapse: collapse; width: 100%; margin: 8pt 0; font-size: 9.5pt; }
th { background-color: #eef2ff; color: #1e3a8a; text-align: left; }
th, td { border: 1px solid #c7d2fe; padding: 4pt 6pt; vertical-align: top; }
code { font-family: "Liberation Mono", monospace; font-size: 9pt; background-color: #f3f4f6; }
pre { background-color: #f8fafc; border: 1px solid #e2e8f0; font-size: 8.5pt; }
blockquote { border-left: 4px solid #a5b4fc; background-color: #f5f3ff; padding: 6pt 10pt; color: #333333; }
a { color: #4338ca; text-decoration: none; }
`;

function coletar(alvo) {
  const stat = fs.statSync(alvo);
  if (stat.isFile()) return alvo.endsWith(".md") ? [alvo] : [];
  return fs
    .readdirSync(alvo, { withFileTypes: true })
    .flatMap((e) => e.isDirectory() ? coletar(path.join(alvo, e.name)) : e.name.endsWith(".md") && e.name !== "README.md" ? [path.join(alvo, e.name)] : []);
}

const alvos = process.argv.length > 2 ? process.argv.slice(2) : ["docs/entregas"];
const arquivos = alvos.flatMap(coletar);
if (arquivos.length === 0) {
  console.error("Nenhum .md encontrado.");
  process.exit(1);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "md2doc-"));
const htmls = [];

for (const md of arquivos) {
  const corpo = execFileSync("npx", ["--yes", "marked@14", "--gfm", "-i", md], { maxBuffer: 50 * 1024 * 1024 }).toString();
  const titulo = path.basename(md, ".md");
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${titulo}</title><style>${CSS}</style></head><body>${corpo}</body></html>`;
  const arquivoHtml = path.join(tmp, `${path.basename(md, ".md").replace(/[^\w.-]+/g, "_")}.html`);
  fs.writeFileSync(arquivoHtml, html);
  htmls.push({ md, arquivoHtml });
}

// Uma chamada só: o LibreOffice headless não lida bem com vários -envd de
// perfil e também não aceita conversão em paralelo.
const perfil = path.join(tmp, "perfil");
execFileSync(
  SOFFICE,
  ["--headless", "--norestore", `-env:UserInstallation=file://${perfil}`, "--convert-to", 'doc:MS Word 97', "--outdir", tmp, ...htmls.map((h) => h.arquivoHtml)],
  { stdio: "ignore", timeout: 300000 },
);

let ok = 0;
for (const { md, arquivoHtml } of htmls) {
  const base = path.basename(arquivoHtml, ".html");
  const gerado = path.join(tmp, `${base}.doc`);
  if (!fs.existsSync(gerado)) {
    console.error(`❌ ${md} — LibreOffice não gerou o .doc`);
    continue;
  }
  fs.copyFileSync(gerado, md.replace(/\.md$/, ".doc"));
  ok += 1;
  console.log(`✅ ${md.replace(/\.md$/, ".doc")}`);
}

fs.rmSync(tmp, { recursive: true, force: true });
if (ok !== htmls.length) process.exit(1);