// Converte arquivos Markdown em PDF: o Markdown vira HTML (marked, via npx, sem
// instalar nada no projeto) e o Chrome headless imprime o HTML em A4.
//
// Uso: node scripts/docs/gerar-pdf.mjs [arquivo.md | pasta ...]
//   Sem argumentos, converte todos os .md de docs/entregas (menos o README).
// Precisa de Node 22+, npx (com internet na primeira vez) e google-chrome (ou CHROME=...).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const CHROME = process.env.CHROME ?? "google-chrome";

const CSS = `
@page { size: A4; margin: 20mm 18mm 20mm 18mm; @bottom-center { content: "Formandos · " counter(page) " / " counter(pages); font: 9pt sans-serif; color: #777; } }
* { box-sizing: border-box; }
body { font-family: "Liberation Sans", "DejaVu Sans", Arial, sans-serif; font-size: 10.5pt; line-height: 1.5; color: #1a1a1a; }
h1 { font-size: 22pt; margin: 0 0 6pt; color: #1e3a8a; border-bottom: 3px solid #4f46e5; padding-bottom: 6pt; }
h2 { font-size: 14pt; margin: 20pt 0 6pt; color: #1e3a8a; break-after: avoid; }
h3 { font-size: 11.5pt; margin: 14pt 0 4pt; color: #312e81; break-after: avoid; }
p { margin: 5pt 0; }
ul, ol { margin: 5pt 0; padding-left: 18pt; }
li { margin: 2pt 0; }
table { border-collapse: collapse; width: 100%; margin: 8pt 0; font-size: 9.5pt; break-inside: auto; }
tr { break-inside: avoid; }
/* Tabela de cabeçalho do documento: a linha de título vazia some. */
thead tr:has(> th:empty + th:empty) { display: none; }
th { background: #eef2ff; color: #1e3a8a; text-align: left; }
th, td { border: 1px solid #c7d2fe; padding: 4pt 6pt; vertical-align: top; }
code { font-family: "DejaVu Sans Mono", monospace; font-size: 9pt; background: #f3f4f6; padding: 0 3pt; border-radius: 3pt; }
pre { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4pt; padding: 8pt; font-size: 8pt; line-height: 1.35; white-space: pre-wrap; break-inside: avoid; }
pre code { background: none; padding: 0; }
blockquote { margin: 8pt 0; padding: 4pt 10pt; border-left: 4px solid #a5b4fc; background: #f5f3ff; color: #333; }
hr { border: 0; border-top: 1px solid #ddd; margin: 14pt 0; }
a { color: #4338ca; text-decoration: none; }
`;

function coletar(alvo) {
  const stat = fs.statSync(alvo);
  if (stat.isFile()) return alvo.endsWith(".md") ? [alvo] : [];
  return fs
    .readdirSync(alvo, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? coletar(path.join(alvo, e.name)) : e.name.endsWith(".md") && e.name !== "README.md" ? [path.join(alvo, e.name)] : []));
}

const alvos = process.argv.length > 2 ? process.argv.slice(2) : ["docs/entregas"];
const arquivos = alvos.flatMap(coletar);
if (arquivos.length === 0) {
  console.error("Nenhum .md encontrado.");
  process.exit(1);
}
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "md2pdf-"));
for (const md of arquivos) {
  const corpo = execFileSync("npx", ["--yes", "marked@14", "--gfm", "-i", md], { maxBuffer: 50 * 1024 * 1024 }).toString();
  const titulo = path.basename(md, ".md");
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${titulo}</title><style>${CSS}</style></head><body>${corpo}</body></html>`;
  const arquivoHtml = path.join(tmp, "doc.html");
  fs.writeFileSync(arquivoHtml, html);
  const pdf = md.replace(/\.md$/, ".pdf");
  execFileSync(CHROME, [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--no-pdf-header-footer",
    `--user-data-dir=${path.join(tmp, "perfil")}`,
    `--print-to-pdf=${path.resolve(pdf)}`,
    pathToFileURL(arquivoHtml).href,
  ], { stdio: "ignore" });
  console.log(`✅ ${pdf}`);
}
fs.rmSync(tmp, { recursive: true, force: true });
