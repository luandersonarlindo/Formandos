#!/usr/bin/env node
// Gera o sitemap visual da aplicação em SVG e o injeta no Markdown.
//
// Uso: node scripts/docs/gerar-sitemap.mjs [arquivo.md]
//   Padrão: docs/Organograma da Aplicação.md
//
// O SVG entra entre <!-- sitemap:begin --> e <!-- sitemap:end -->.
// As rotas declaradas em GRUPOS são conferidas contra src/app/ antes de gerar:
// se sobrar ou faltar rota, o script falha em vez de publicar mapa errado.
//
// Layout: árvore horizontal. Raiz à esquerda, sete grupos no meio, páginas à
// direita. Cada grupo fica centrado verticalmente no bloco das suas páginas.
import fs from "node:fs";
import path from "node:path";

const GRUPOS = [
  {
    nome: "Público",
    cor: "#64748b",
    rotas: [
      { p: "/" },
      { p: "/entrar" },
      { p: "/esqueci-senha" },
      { p: "/redefinir-senha" },
    ],
  },
  {
    nome: "Onboarding",
    cor: "#d97706",
    rotas: [{ p: "/convite" }],
  },
  {
    nome: "Conta",
    cor: "#ca8a04",
    rotas: [{ p: "/conta" }],
  },
  {
    nome: "Membro",
    cor: "#16a34a",
    rotas: [
      { p: "/dashboard" },
      { p: "/avisos", flag: "!" },
      { p: "/tarefas" },
      { p: "/duvidas" },
      { p: "/terceiros" },
      { p: "/votacoes" },
      { p: "/votacoes/[catalogoId]", flag: "?" },
      { p: "/votacoes/relatorio" },
    ],
  },
  {
    nome: "Administração",
    cor: "#2563eb",
    rotas: [
      { p: "/admin" },
      { p: "/admin/membros" },
      { p: "/admin/convite", flag: "?" },
      { p: "/admin/evento" },
      { p: "/admin/presenca" },
      { p: "/admin/duvidas" },
      { p: "/admin/turma" },
      { p: "/admin/votacoes" },
      { p: "/admin/votacoes/nova", flag: "!" },
      { p: "/admin/votacoes/[catalogoId]", flag: "?" },
      { p: "/admin/votacoes/votos/[enqueteId]", flag: "?" },
    ],
  },
  {
    nome: "Master",
    cor: "#7c3aed",
    rotas: [
      { p: "/master" },
      { p: "/master/turmas" },
      { p: "/master/turmas/[turmaId]" },
      { p: "/master/usuarios" },
    ],
  },
  {
    nome: "API",
    cor: "#334155",
    rotas: [{ p: "/api/auth/[...all]" }],
  },
];

// ---------------------------------------------------------------- geometria
const PAD = 8;
const ROOT_W = 160;
const ROOT_H = 54;
const GRUPO_W = 150;
const GRUPO_H = 34;
const PAG_W = 300;
const PAG_H = 28;
const PAG_GAP = 5;
const BLOCO_GAP = 8;
const COL_GAP = 54; // gutter entre colunas; o tronco fica no meio dele

const ROOT_X = PAD;
const GRUPO_X = ROOT_X + ROOT_W + COL_GAP;
const PAG_X = GRUPO_X + GRUPO_W + COL_GAP;
const T1 = ROOT_X + ROOT_W + COL_GAP / 2; // tronco raiz -> grupos
const T2 = GRUPO_X + GRUPO_W + COL_GAP / 2; // tronco grupos -> páginas
const LARG = PAG_X + PAG_W + PAD;

const F_ROOT = 15;
const F_GRUPO = 14;
const F_PAG = 13;

// posiciona os blocos de cada grupo
let y = PAD;
const blocos = GRUPOS.map((g) => {
  const h = g.rotas.length * PAG_H + (g.rotas.length - 1) * PAG_GAP;
  const b = { g, y, h, pagY: y };
  y += h + BLOCO_GAP;
  return b;
});
const ALT = y - BLOCO_GAP + PAD;
const paginas = blocos.flatMap((b) =>
  b.g.rotas.map((r, i) => ({ ...r, y: b.pagY + i * (PAG_H + PAG_GAP) })),
);
const cy = (yy) => yy / 1;

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function claro(hex) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) =>
    Math.round(v + (255 - v) * 0.88),
  );
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

function caixa({ x, y, w, h, cor, fill, texto, fonte, peso = 600, r = 5, claroTexto = false, flag = null }) {
  const out = [
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${cor}" stroke-width="1.6"/>`,
  ];
  const linhas = Array.isArray(texto) ? texto : [texto];
  const lh = fonte * 1.2;
  const y0 = y + h / 2 - ((linhas.length - 1) * lh) / 2 + fonte * 0.35;
  const fillTexto = claroTexto ? "#ffffff" : "#111827";
  linhas.forEach((l, i) => {
    out.push(
      `<text x="${x + w / 2}" y="${y0 + i * lh}" text-anchor="middle" font-family="Liberation Sans, DejaVu Sans, Arial, sans-serif" font-size="${fonte}" font-weight="${peso}" fill="${fillTexto}">${esc(l)}</text>`,
    );
  });
  if (flag) {
    const b = 15;
    out.push(
      `<rect x="${x + w - b - 5}" y="${y + 4}" width="${b}" height="${b}" rx="3" fill="${flag === "!" ? "#dc2626" : "#d97706"}"/>`,
      `<text x="${x + w - b / 2 - 5}" y="${y + 4 + b * 0.76}" text-anchor="middle" font-family="Liberation Sans, DejaVu Sans, Arial, sans-serif" font-size="11" font-weight="700" fill="#ffffff">${flag}</text>`,
    );
  }
  return out.join("");
}

// ---------------------------------------------------------------- montagem
const svg = [];
svg.push(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LARG} ${ALT}" role="img" aria-label="Sitemap da aplicação Formandos: 30 rotas em 7 grupos" style="width:100%;height:auto;display:block;margin:6pt 0;break-inside:avoid">`,
);

const gY = blocos.map((b) => b.y + b.h / 2 - GRUPO_H / 2);
const rootCy = (gY[0] + gY.at(-1)) / 2;

svg.push(
  caixa({
    x: ROOT_X,
    y: rootCy - ROOT_H / 2,
    w: ROOT_W,
    h: ROOT_H,
    cor: "#0f172a",
    fill: "#0f172a",
    texto: ["Formandos", `${paginas.length} rotas`],
    fonte: F_ROOT,
    peso: 700,
    r: 7,
    claroTexto: true,
  }),
);

// tronco raiz -> grupos
svg.push(
  `<path d="M ${ROOT_X + ROOT_W} ${rootCy} H ${T1} M ${T1} ${gY[0]} V ${gY.at(-1)}" fill="none" stroke="#94a3b8" stroke-width="1.8"/>`,
);
gY.forEach((yy) =>
  svg.push(
    `<path d="M ${T1} ${yy} H ${GRUPO_X}" fill="none" stroke="#94a3b8" stroke-width="1.8"/>`,
  ),
);

blocos.forEach((b, i) => {
  const gc = gY[i];
  svg.push(
    caixa({
      x: GRUPO_X,
      y: gc - GRUPO_H / 2,
      w: GRUPO_W,
      h: GRUPO_H,
      cor: b.g.cor,
      fill: b.g.cor,
      texto: `${b.g.nome} · ${b.g.rotas.length}`,
      fonte: F_GRUPO,
      peso: 700,
      claroTexto: true,
    }),
  );
  const cys = b.g.rotas.map((_, j) => b.pagY + j * (PAG_H + PAG_GAP) + PAG_H / 2);
  svg.push(
    `<path d="M ${GRUPO_X + GRUPO_W} ${gc} H ${T2} M ${T2} ${cys[0]} V ${cys.at(-1)}" fill="none" stroke="#cbd5e1" stroke-width="1.6"/>`,
  );
  cys.forEach((yy) =>
    svg.push(
      `<path d="M ${T2} ${yy} H ${PAG_X}" fill="none" stroke="#cbd5e1" stroke-width="1.6"/>`,
    ),
  );
  b.g.rotas.forEach((r, j) => {
    svg.push(
      caixa({
        x: PAG_X,
        y: b.pagY + j * (PAG_H + PAG_GAP),
        w: PAG_W,
        h: PAG_H,
        cor: b.g.cor,
        fill: claro(b.g.cor),
        texto: r.p,
        fonte: F_PAG,
        peso: 600,
        r: 4,
        flag: r.flag ?? null,
      }),
    );
  });
});

svg.push("</svg>");
const conteudo = svg.join("\n");

// ---------------------------------------------------------------- confere rotas
function caminhos(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) caminhos(f, acc);
    else acc.push(f);
  }
  return acc;
}

const declaradas = GRUPOS.flatMap((g) => g.rotas.map((r) => r.p)).sort();
const noDisco = caminhos("src/app")
  .filter((f) => f.endsWith("page.tsx") || f.endsWith("route.ts"))
  .map((f) => {
    let r = f.replace(/^src\/app\//, "");
    for (const g of ["(publico)", "(onboarding)", "(conta)", "(app)", "(admin)", "(master)"])
      if (r.startsWith(g + "/")) {
        r = r.slice(g.length + 1);
        break;
      }
    r = r.replace(/(page\.tsx|route\.ts)$/, "");
    return r === "" ? "/" : "/" + r.replace(/\/$/, "");
  })
  .sort();

const faltam = noDisco.filter((r) => !declaradas.includes(r));
const sobram = declaradas.filter((r) => !noDisco.includes(r));
if (faltam.length || sobram.length) {
  console.error("Sitemap não bate com src/app/:");
  if (faltam.length) console.error("  faltam no mapa:", faltam.join(", "));
  if (sobram.length) console.error("  sobram no mapa:", sobram.join(", "));
  process.exit(1);
}

// confere que o texto da caixa cabe na largura da caixa
const sobrescritos = paginas.filter(
  (r) => r.p.length * (F_PAG * 0.52) > PAG_W - 14,
);
if (sobrescritos.length) {
  console.error("Label de rota estoura a caixa:", sobrescritos.map((r) => r.p).join(", "));
  process.exit(1);
}

// ---------------------------------------------------------------- injeta no md
const alvo = process.argv[2] ?? "docs/Organograma da Aplicação.md";
const md = fs.readFileSync(alvo, "utf8");
const BEGIN = "<!-- sitemap:begin -->";
const END = "<!-- sitemap:end -->";
const i = md.indexOf(BEGIN);
const j = md.indexOf(END);
if (i === -1 || j === -1 || j < i) {
  console.error(`Marcadores ${BEGIN} / ${END} não encontrados em ${alvo}.`);
  process.exit(1);
}
fs.writeFileSync(alvo, md.slice(0, i + BEGIN.length) + "\n" + conteudo + "\n" + md.slice(j));

// área útil de uma página A4 retrato com margem de 18mm/20mm: 174 x 257 mm em px
const util = [(174 / 25.4) * 96, (257 / 25.4) * 96];
const escala = Math.min(util[0] / LARG, util[1] / ALT);
// sobra altura para o titulo da secao antes do diagrama
const DISPONIVEL = util[1] - 56;
if (ALT * (util[0] / LARG) > DISPONIVEL) {
  console.error(
    `Diagrama não cabe numa página: ${(ALT * (util[0] / LARG)).toFixed(0)}px > ${DISPONIVEL}px disponíveis.\n` +
      `Reduza BLOCO_GAP, PAG_GAP ou PAG_H.`,
  );
  process.exit(1);
}
console.log(
  `✅ ${alvo}\n   ${GRUPOS.length} grupos · ${declaradas.length} rotas · SVG ${LARG}×${ALT}px` +
    `\n   escala no PDF ~${(escala * 100).toFixed(0)}% · fonte efetiva ~${(F_PAG * escala * 0.75).toFixed(1)}pt`,
);
