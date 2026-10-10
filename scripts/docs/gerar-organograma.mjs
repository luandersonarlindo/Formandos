#!/usr/bin/env node
// Gera docs/Organograma da Aplicação.md na íntegra, tudo em SVG:
//   §1 sitemap visual  ·  §2 jornadas do usuário  ·  §3 fluxo de cada página
//
// Uso: node scripts/docs/gerar-organograma.mjs
//
// Entradas:
//   scripts/docs/fluxos-paginas.json  dado por rota (arquivo, gate, dados, actions, tabelas)
//   src/app/**                        conferido contra o sitemap antes de escrever
import fs from "node:fs";
import path from "node:path";

const LIM = 88; // largura máxima de linha no PDF

// ============================================================ utilitários de texto
function quebrar(txt, max) {
  const palavras = String(txt).replace(/`/g, "").split(/\s+/).filter(Boolean);
  const out = [];
  let cur = "";
  for (const p of palavras) {
    if (!cur) cur = p;
    else if (cur.length + 1 + p.length <= max) cur += " " + p;
    else { out.push(cur); cur = p; }
  }
  if (cur) out.push(cur);
  return out;
}

function cortar(t, max) {
  return t.length <= max ? t : t.slice(0, max - 1).replace(/[\s·]+$/, "") + "…";
}

// ============================================================ toolkit SVG
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const claro = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (255 - v) * 0.88));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};

// cabe quantos caracteres cabem numa caixa de largura w com fonte `fonte`
const maxChars = (w, fonte) => Math.max(6, Math.floor((w - 26) / (fonte * 0.56) + 1e-6));

function normLinhas(linhas) {
  const padrao = { fonte: 13, peso: 600, fill: "#111827" };
  return (Array.isArray(linhas) ? linhas : [linhas]).map((l) =>
    typeof l === "string" ? { ...padrao, t: l } : { ...padrao, ...l });
}

const altCaixa = (linhas) =>
  Math.round(linhas.reduce((s, l) => s + l.fonte * 1.2, 0) + 12);

function caixaSVG({ x, y, w, h, linhas, cor, fill, anchor, dash, rx = 5 }) {
  const out = [
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${cor}" stroke-width="1.6"${dash ? ' stroke-dasharray="7 4"' : ""}/>`,
  ];
  const total = linhas.reduce((s, l) => s + l.fonte * 1.2, 0);
  let ty = y + h / 2 - total / 2;
  for (const l of linhas) {
    const lh = l.fonte * 1.2;
    ty += lh;
    out.push(
      `<text x="${anchor === "start" ? x + 13 : x + w / 2}" y="${(ty - lh / 2 + l.fonte * 0.35).toFixed(1)}" text-anchor="${anchor}" font-family="Liberation Sans, DejaVu Sans, Arial, sans-serif" font-size="${l.fonte}" font-weight="${l.peso}" fill="${l.fill}">${esc(l.t)}</text>`,
    );
  }
  return out.join("");
}

let DIAG_N = 0;
class Diagrama {
  constructor(larg, rotulo) {
    this.larg = larg;
    this.rotulo = rotulo;
    this.uid = `g${++DIAG_N}`;
    this.piezas = [];
    this.defs = [];
    this.maxY = 0;
  }
  caixa({ x, y, w, h, cor, fill, linhas, anchor = "middle", dash = false, rx = 5 }) {
    const ls = normLinhas(linhas);
    for (const l of ls) {
      const c = maxChars(w, l.fonte);
      if (l.t.length > c) {
        console.error(`texto estoura caixa em ${this.rotulo}: "${l.t}" (${l.t.length} > ${c}, w=${w} fonte=${l.fonte})`);
        process.exit(1);
      }
    }
    const hh = h ?? altCaixa(ls);
    this.piezas.push(caixaSVG({ x, y, w, h: hh, linhas: ls, cor, fill, anchor, dash, rx }));
    this.maxY = Math.max(this.maxY, y + hh);
    return hh;
  }
  caminho(d, { cor = "#94a3b8", tracejado = false, seta = true } = {}) {
    let marca = "";
    if (seta) {
      const id = `${this.uid}a${this.defs.length}`;
      this.defs.push(
        `<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="${cor}"/></marker>`,
      );
      marca = ` marker-end="url(#${id})"`;
    }
    this.piezas.push(
      `<path d="${d}" fill="none" stroke="${cor}" stroke-width="1.8"${tracejado ? ' stroke-dasharray="6 5"' : ""}${marca}/>`,
    );
  }
  texto(x, y, t, { fonte = 11, peso = 600, fill = "#64748b", anchor = "start" } = {}) {
    this.piezas.push(
      `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Liberation Sans, DejaVu Sans, Arial, sans-serif" font-size="${fonte}" font-weight="${peso}" fill="${fill}">${esc(t)}</text>`,
    );
    this.maxY = Math.max(this.maxY, y + 4);
  }
  svg() {
    const alt = this.maxY + 16;
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.larg} ${alt}" role="img" aria-label="${esc(this.rotulo)}" style="width:90%;max-width:100%;height:auto;display:block;margin:8pt auto;break-inside:avoid">` +
      (this.defs.length ? `<defs>${this.defs.join("")}</defs>` : "") +
      this.piezas.join("") +
      "</svg>"
    );
  }
}

// ============================================================ shells, menus e links
const SHELL = {};
for (const r of ["/", "/entrar", "/esqueci-senha", "/redefinir-senha", "/privacidade", "/termos"]) SHELL[r] = "público";
SHELL["/convite"] = "onboarding";
SHELL["/conta"] = "conta";
SHELL["/conta/exportar"] = "conta";
for (const r of ["/dashboard", "/avisos", "/tarefas", "/duvidas", "/terceiros",
  "/votacoes", "/votacoes/[catalogoId]", "/votacoes/relatorio"]) SHELL[r] = "membro";
for (const r of ["/admin", "/admin/membros",
  "/admin/presenca", "/admin/turma", "/admin/votacoes",
  "/admin/votacoes/nova", "/admin/votacoes/[catalogoId]",
  "/admin/votacoes/votos/[enqueteId]"]) SHELL[r] = "administração";
for (const r of ["/master", "/master/turmas", "/master/turmas/[turmaId]", "/master/usuarios"])
  SHELL[r] = "master";
SHELL["/api/auth/[...all]"] = "api";

const COR = {
  público: "#64748b",
  onboarding: "#d97706",
  conta: "#ca8a04",
  membro: "#16a34a",
  "administração": "#2563eb",
  master: "#7c3aed",
  api: "#334155",
};
const TINTA = {
  público: "#334155",
  onboarding: "#92400e",
  conta: "#854d0e",
  membro: "#166534",
  "administração": "#1e40af",
  master: "#5b21b6",
  api: "#0f172a",
};

const MENU = {
  membro: ["/dashboard", "/avisos", "/tarefas", "/votacoes", "/votacoes/relatorio", "/duvidas", "/terceiros"],
  administração: ["/admin", "/admin/membros",
    "/admin/presenca", "/admin/turma", "/admin/votacoes"],
  master: ["/master", "/master/turmas", "/master/usuarios"],
};
const RODAPE = {
  membro: ["/conta", "/admin", "/master"],
  administração: ["/dashboard", "/master", "/conta"],
  master: ["/dashboard"],
  onboarding: ["/dashboard", "/master", "/conta"],
  conta: ["/dashboard", "/convite"],
  público: [],
  api: [],
};
const LINKS = {
  "/": ["/entrar"],
  "/entrar": ["/dashboard", "/esqueci-senha", "/convite"],
  "/esqueci-senha": ["/redefinir-senha"],
  "/redefinir-senha": ["/entrar"],
  "/convite": ["/dashboard"],
  "/conta": ["/dashboard", "/conta/exportar", "/privacidade"],
  "/conta/exportar": [],
  "/privacidade": ["/termos"],
  "/termos": ["/privacidade"],
  "/dashboard": ["/admin", "/master", "/conta"],
  "/votacoes": ["/votacoes/[catalogoId]", "/votacoes/relatorio"],
  "/votacoes/[catalogoId]": ["/votacoes"],
  "/votacoes/relatorio": ["/votacoes"],
  "/admin/votacoes": ["/admin/votacoes/nova", "/admin/votacoes/[catalogoId]"],
  "/admin/votacoes/[catalogoId]": ["/admin/votacoes/votos/[enqueteId]"],
  "/admin/votacoes/nova": ["/admin/votacoes"],
  "/admin/votacoes/votos/[enqueteId]": ["/admin/votacoes/[catalogoId]"],
  "/master/turmas": ["/master/turmas/[turmaId]"],
  "/master/turmas/[turmaId]": ["/master/turmas"],
  "/api/auth/[...all]": [],
};

function saidasDe(rota) {
  const s = SHELL[rota];
  const menu = MENU[s] ?? [];
  const links = [...new Set(LINKS[rota] ?? [])];
  const rodape = [...new Set(RODAPE[s] ?? [])]
    .filter((r) => !menu.includes(r) && !links.includes(r));
  return { menu, rodape, links };
}

// ============================================================ gates
const GATE_CURTO = [
  ["exigirMembroEditavel", "exigirMembroEditavel()", "/dashboard", "turma arquivada"],
  ["exigirAdminEditavel", "exigirAdminEditavel()", "/dashboard", "turma arquivada"],
  ["exigirSessao", "exigirSessao()", "/entrar", "sem sessão"],
  ["exigirMembro", "exigirMembro()", "/convite", "sem vínculo"],
  ["exigirAdmin", "exigirAdmin()", "/dashboard", "papel ≠ admin"],
  ["exigirMaster", "exigirMaster()", "404", "não é master"],
  ["getSessao", "getSessao()", null, "não bloqueia"],
  ["getVinculos", "getVinculos()", null, "não bloqueia"],
  ["listarModelos", "listarModelos()", null, "não bloqueia"],
];

function gateDe(txt) {
  if (!txt || /^(nenhum gate|nenhuma)/i.test(txt)) return { curto: "nenhum gate", bloqueia: false };
  for (const [chave, curto, alvo, motivo] of GATE_CURTO)
    if (txt.includes(chave))
      return { curto, bloqueia: Boolean(alvo), alvo, motivo };
  const m = txt.match(/[a-zA-Z]+\([^)]*\)/);
  const curto = m ? m[0] : txt.length > 140 ? txt.slice(0, 140).trimEnd() + " …" : txt;
  return { curto, bloqueia: false };
}

// ============================================================ dados minerados
const PAGINAS = JSON.parse(fs.readFileSync("scripts/docs/fluxos-paginas.json", "utf8"));

const GRUPO_DIR = {
  público: "(publico)", onboarding: "(onboarding)", conta: "(conta)",
  membro: "(app)", "administração": "(admin)", master: "(master)",
};

// resolve o arquivo real quando o dado veio vazio, e acha a linha do componente
function arquivoDe(rota) {
  const d = PAGINAS[rota];
  if (d && d.arquivo && /:\d+$/.test(d.arquivo)) return d.arquivo;
  const rel = rota === "/" ? "" : rota.slice(1);
  const dir = SHELL[rota] === "api" ? "src/app" : `src/app/${GRUPO_DIR[SHELL[rota]]}`;
  const base = rel ? `${dir}/${rel}` : dir;
  for (const cand of [`${base}/page.tsx`, `${base}/route.ts`]) {
    if (!fs.existsSync(cand)) continue;
    const linhas = fs.readFileSync(cand, "utf8").split("\n");
    let i = linhas.findIndex((l) => /export default/.test(l));
    if (i < 0) i = linhas.findIndex((l) => /export const/.test(l));
    return `${cand}:${i >= 0 ? i + 1 : 1}`;
  }
  return `${base}:1`;
}

const TODAS = Object.keys(SHELL);

// rotas que uma outra página alcança quando o seu gate bloqueia (redirect / 404)
function gateAlvo(rota) {
  const g = gateDe(PAGINAS[rota]?.gate);
  return g.bloqueia ? g.alvo : null;
}

const origensDe = (alvo) => [...new Set(TODAS.filter((r) => {
  const s = saidasDe(r);
  if ([...s.menu, ...s.rodape, ...s.links].includes(alvo)) return true;
  return gateAlvo(r) === alvo;
}))];

// ============================================================ rótulo humano de cada rota
function apelido(rota) {
  const mapa = {
    "/": "Vitrine",
    "/entrar": "Login e cadastro",
    "/esqueci-senha": "Pedir link de redefinição",
    "/redefinir-senha": "Trocar senha pelo token",
    "/convite": "Entrar por código ou criar turma",
    "/conta": "Ver, baixar dados e excluir a própria conta",
    "/conta/exportar": "Download dos dados (JSON)",
    "/privacidade": "Política de Privacidade",
    "/termos": "Termos de Uso",
    "/dashboard": "Painel da turma",
    "/avisos": "Mural de recados",
    "/tarefas": "Lista de tarefas",
    "/duvidas": "Fila de dúvidas",
    "/terceiros": "Vitrine de fornecedores",
    "/votacoes": "Lista de catálogos",
    "/votacoes/[catalogoId]": "Votação",
    "/votacoes/relatorio": "Resultados agregados",
    "/admin": "Redireciona para o dashboard",
    "/admin/membros": "Gestão de membros e código de convite",
    "/admin/presenca": "Painel de presença",
    "/admin/turma": "Arquivar e excluir",
    "/admin/votacoes": "Catálogos",
    "/admin/votacoes/nova": "Criar catálogo",
    "/admin/votacoes/[catalogoId]": "Detalhe do catálogo",
    "/admin/votacoes/votos/[enqueteId]": "Quem votou",
    "/master": "Resumo da plataforma",
    "/master/turmas": "Lista de turmas",
    "/master/turmas/[turmaId]": "Detalhe da turma",
    "/master/usuarios": "Papéis de usuário",
    "/api/auth/[...all]": "Endpoint do Better Auth",
  };
  return mapa[rota] ?? rota;
}

// ============================================================ §3 fluxo por página (SVG)
const ROTULO_SHELL = {
  público: "telas públicas",
  onboarding: "onboarding",
  conta: "tela de conta",
  membro: "telas do membro",
  "administração": "telas da administração",
  master: "telas master",
  api: "api",
};
const ORDEM_SHELL = ["público", "onboarding", "conta", "membro", "administração", "master", "api"];
const W3 = 362, X3 = 16, RX3 = 418, RW3 = 246, LARG3 = 680;

function linhasOrigem(rota) {
  const orig = origensDe(rota).filter((r) => r !== rota);
  const max = maxChars(W3, 11);
  const out = [{ t: orig.length ? `origem (${orig.length})` : "chegada", fonte: 13, peso: 700, fill: "#334155" }];
  if (!orig.length) {
    const corpo = rota === "/" ? "quem digita o endereço"
      : SHELL[rota] === "api" ? "chamado pelo cliente (Better Auth)"
      : "chamada direta";
    out.push({ t: corpo, fonte: 11, peso: 500, fill: "#475569" });
    return out;
  }
  let restos = [...orig];
  const partes = [];
  for (const s of ORDEM_SHELL) {
    const dentro = restos.filter((r) => SHELL[r] === s);
    if (dentro.length >= 2) {
      partes.push(`${ROTULO_SHELL[s]} (${dentro.length})`);
      restos = restos.filter((r) => SHELL[r] !== s);
    }
  }
  partes.push(...restos);
  const linhas = quebrar(partes.join(" · "), max);
  linhas.slice(0, 4).forEach((l, i) => out.push({
    t: i === 3 && linhas.length > 4 ? cortar(l + " …", max) : l,
    fonte: 11, peso: 500, fill: "#475569",
  }));
  return out;
}

function linhasDestino(rota) {
  const { menu, rodape, links } = saidasDe(rota);
  const sem = (r) => r !== rota;
  const m = [...new Set(menu.filter(sem))];
  const l = [...new Set([...links.filter(sem), ...rodape.filter(sem)])].filter((r) => !m.includes(r));
  const max = maxChars(W3, 11);
  const out = [{ t: "o usuário vai para", fonte: 13, peso: 700, fill: "#334155" }];
  let linhas = [];
  if (m.length) linhas.push(...quebrar("menu lateral: " + m.join(" · "), max));
  if (l.length) linhas.push(...quebrar("vai para: " + l.join(" · "), max));
  if (!linhas.length) {
    linhas = [rota === "/api/auth/[...all]" ? "responde JSON · nenhuma navegação" : "nenhum link nesta tela"];
  }
  linhas.slice(0, 4).forEach((l2, i) => out.push({
    t: i === 3 && linhas.length > 4 ? cortar(l2 + " …", max) : l2,
    fonte: 11, peso: 500, fill: "#475569",
  }));
  return out;
}

function svgPagina(rota) {
  const d = PAGINAS[rota];
  const gate = gateDe(d.gate);
  const cor = COR[SHELL[rota]];
  const g = new Diagrama(LARG3, `fluxo de ${rota}`);

  const hO = g.caixa({ x: X3, y: 16, w: W3, linhas: linhasOrigem(rota), cor: "#cbd5e1", fill: "#f8fafc", anchor: "start" });
  const yP = 16 + hO + 34;
  g.caminho(`M${X3 + W3 / 2},${16 + hO} V${yP - 4}`);
  const hP = g.caixa({
    x: X3, y: yP, w: W3, cor, fill: claro(cor),
    linhas: [
      { t: rota, fonte: 15, peso: 700 },
      { t: arquivoDe(rota), fonte: 10, peso: 400, fill: "#64748b" },
    ],
  });

  if (gate.bloqueia) {
    g.caixa({
      x: RX3, y: yP + hP / 2 - 28, w: RW3, cor: "#dc2626", fill: "#fee2e2", anchor: "start",
      linhas: [
        { t: gate.alvo === "404" ? "não encontra" : "redireciona", fonte: 12, peso: 700, fill: "#dc2626" },
        { t: gate.alvo, fonte: 15, peso: 700, fill: "#991b1b" },
        { t: gate.motivo, fonte: 11, peso: 500, fill: "#b91c1c" },
      ],
    });
    g.caminho(`M${X3 + W3},${yP + hP / 2} H${RX3 - 4}`, { cor: "#dc2626" });
  }

  const yD = yP + hP + 34;
  g.caminho(`M${X3 + W3 / 2},${yP + hP} V${yD - 4}`);
  if (gate.bloqueia) g.texto(X3 + W3 / 2 + 8, yP + hP + 22, "segue");
  g.caixa({ x: X3, y: yD, w: W3, linhas: linhasDestino(rota), cor: "#94a3b8", fill: "#ffffff", anchor: "start" });

  return g.svg();
}

// ============================================================ §2 jornadas do usuário (SVG)
function svgJornadaVisitante() {
  const g = new Diagrama(760, "jornada do visitante: da home até o painel");
  const pub = COR["público"];
  const mem = COR.membro;

  g.caixa({ x: 16, y: 16, w: 170, h: 52, cor: pub, fill: "#ffffff",
    linhas: [{ t: "/", fonte: 16, peso: 700 }, { t: "vitrine", fonte: 11, peso: 500, fill: pub }] });
  g.caminho("M101,68 V96");
  g.texto(107, 88, "abre o login");
  g.caixa({ x: 16, y: 100, w: 170, h: 44, cor: pub, fill: "#ffffff",
    linhas: [{ t: "/entrar", fonte: 15, peso: 700 }, { t: "senha ou Google", fonte: 11, peso: 500, fill: pub }] });

  g.caminho("M186,112 H426");
  g.texto(306, 104, "esqueci a senha", { anchor: "middle" });
  g.caixa({ x: 430, y: 91, w: 290, h: 42, cor: pub, fill: "#ffffff",
    linhas: [{ t: "/esqueci-senha", fonte: 15, peso: 700 }, { t: "pedido de link", fonte: 11, peso: 500, fill: pub }] });
  g.caminho("M575,133 V156");
  g.texto(581, 150, "link no email");
  g.caixa({ x: 430, y: 160, w: 290, h: 42, cor: pub, fill: "#ffffff",
    linhas: [{ t: "/redefinir-senha", fonte: 15, peso: 700 }, { t: "troca a senha", fonte: 11, peso: 500, fill: pub }] });
  g.caminho("M720,181 H740 V72 H140 V96", { tracejado: true });
  g.texto(430, 66, "volta ao login");

  g.caixa({ x: 16, y: 188, w: 190, h: 44, cor: "#334155", fill: "#ffffff", dash: true,
    linhas: [{ t: "já tem turma?", fonte: 15, peso: 700 }] });
  g.caminho("M111,232 V276");
  g.texto(117, 258, "sim");

  g.caixa({ x: 16, y: 280, w: 260, h: 56, cor: mem, fill: claro(mem),
    linhas: [{ t: "/dashboard", fonte: 16, peso: 700 }, { t: "painel · menu do membro", fonte: 11, peso: 500, fill: TINTA.membro }] });

  g.caminho("M206,210 H300 V258 H355");
  g.texto(253, 202, "não", { anchor: "middle" });
  g.caixa({ x: 360, y: 230, w: 270, h: 56, cor: COR.onboarding, fill: claro(COR.onboarding),
    linhas: [{ t: "/convite", fonte: 15, peso: 700 }, { t: "código ou nova turma", fonte: 11, peso: 500, fill: TINTA.onboarding }] });
  g.caminho("M495,286 V308 H273");
  g.texto(370, 302, "entrou");

  return g.svg();
}

function svgJornadaMembro() {
  const g = new Diagrama(760, "jornada do membro: do painel para as telas");
  const mem = COR.membro;

  g.caixa({ x: 280, y: 16, w: 200, h: 52, cor: mem, fill: claro(mem),
    linhas: [{ t: "/dashboard", fonte: 15, peso: 700 }, { t: "menu lateral", fonte: 11, peso: 500, fill: TINTA.membro }] });
  g.caminho("M380,68 V104", { seta: false });
  g.caminho("M86,104 H674", { seta: false });

  const fan = ["/avisos", "/tarefas", "/votacoes", "/duvidas", "/terceiros"];
  fan.forEach((r, i) => {
    const cx = 86 + i * 147;
    g.caminho(`M${cx},104 V132`);
    g.caixa({ x: cx - 66, y: 136, w: 132, h: 40, cor: mem, fill: claro(mem),
      linhas: [{ t: r, fonte: 14, peso: 700 }] });
  });

  g.caminho("M380,176 V212", { seta: false });
  g.caminho("M210,212 H535", { seta: false });
  g.caminho("M210,212 V244");
  g.caminho("M535,212 V244");
  g.caixa({ x: 80, y: 248, w: 260, h: 52, cor: mem, fill: claro(mem),
    linhas: [{ t: "/votacoes/[catalogoId]", fonte: 14, peso: 700 }, { t: "abrir catálogo", fonte: 11, peso: 500, fill: TINTA.membro }] });
  g.caixa({ x: 420, y: 248, w: 230, h: 52, cor: mem, fill: claro(mem),
    linhas: [{ t: "/votacoes/relatorio", fonte: 14, peso: 700 }, { t: "ver resultados", fonte: 11, peso: 500, fill: TINTA.membro }] });

  g.texto(20, 330, "o menu lateral cobre as sete telas; votações abre mais duas");
  g.caixa({ x: 470, y: 326, w: 250, h: 48, cor: "#94a3b8", fill: "#f1f5f9",
    linhas: [{ t: "rodapé do menu", fonte: 14, peso: 700 }, { t: "conta · administração · master", fonte: 11, peso: 500, fill: "#475569" }] });
  g.caminho("M480,42 H745 V350 H725", { tracejado: true });

  return g.svg();
}

function svgRodapeAreas() {
  const g = new Diagrama(760, "rodapé do menu: conta, administração e master");

  g.caixa({ x: 270, y: 16, w: 220, h: 44, cor: "#94a3b8", fill: "#f1f5f9",
    linhas: [{ t: "rodapé do menu", fonte: 14, peso: 700 }, { t: "qualquer sessão", fonte: 11, peso: 500, fill: "#475569" }] });
  g.caminho("M380,60 V92", { seta: false });
  g.caminho("M140,92 H620", { seta: false });

  const alvos = [
    { cx: 140, x: 35, r: "/conta", quem: "qualquer sessão", cor: COR.conta },
    { cx: 380, x: 275, r: "/admin", quem: "só papel admin", cor: COR["administração"] },
    { cx: 620, x: 515, r: "/master", quem: "só ehMaster", cor: COR.master },
  ];
  for (const a of alvos) {
    g.caminho(`M${a.cx},92 V124`);
    g.caixa({ x: a.x, y: 128, w: 210, cor: a.cor, fill: claro(a.cor),
      linhas: [{ t: a.r, fonte: 15, peso: 700 }, { t: a.quem, fonte: 11, peso: 500, fill: "#334155" }] });
    g.caminho(`M${a.cx},171 V212`);
  }

  const menuAdmin = "/admin · /admin/membros · /admin/presenca · /admin/votacoes · /admin/turma";
  const menuMaster = "/master · /master/turmas · /master/usuarios";
  const carteira = (x, w, titulo, menu) => g.caixa({
    x, y: 216, w, h: 78, cor: "#cbd5e1", fill: "#f8fafc", anchor: "start",
    linhas: [
      { t: titulo, fonte: 12, peso: 700 },
      ...quebrar(menu, maxChars(w, 11)).map((t) => ({ t, fonte: 11, peso: 500, fill: "#475569" })),
    ],
  });

  g.caixa({ x: 35, y: 216, w: 190, h: 78, cor: "#cbd5e1", fill: "#f8fafc", anchor: "start",
    linhas: [
      { t: "atualiza o nome e a foto", fonte: 11, peso: 500, fill: "#334155" },
      { t: "exclui a própria conta", fonte: 11, peso: 500, fill: "#334155" },
      { t: "volta ao /dashboard", fonte: 11, peso: 500, fill: "#64748b" },
    ] });
  carteira(250, 205, "administração · 5 telas", menuAdmin);
  carteira(530, 195, "master · 4 telas", menuMaster);

  g.texto(35, 316, "todas voltam ao /dashboard pelo mesmo rodapé");
  return g.svg();
}

// ============================================================ sitemap SVG
function sitemapSVG() {
  const GRUPOS = [
    { nome: "Público", cor: "#64748b", rotas: ["/", "/entrar", "/esqueci-senha", "/redefinir-senha", "/privacidade", "/termos"] },
    { nome: "Onboarding", cor: "#d97706", rotas: ["/convite"] },
    { nome: "Conta", cor: "#ca8a04", rotas: ["/conta", "/conta/exportar"] },
    { nome: "Membro", cor: "#16a34a", rotas: ["/dashboard", "/avisos", "/tarefas", "/duvidas", "/terceiros", "/votacoes", "/votacoes/[catalogoId]", "/votacoes/relatorio"] },
    { nome: "Administração", cor: "#2563eb", rotas: ["/admin", "/admin/membros", "/admin/presenca", "/admin/turma", "/admin/votacoes", "/admin/votacoes/nova", "/admin/votacoes/[catalogoId]", "/admin/votacoes/votos/[enqueteId]"] },
    { nome: "Master", cor: "#7c3aed", rotas: ["/master", "/master/turmas", "/master/turmas/[turmaId]", "/master/usuarios"] },
    { nome: "API", cor: "#334155", rotas: ["/api/auth/[...all]"] },
  ];
  const PAD = 8, ROOT_W = 160, ROOT_H = 54, GRUPO_W = 150, GRUPO_H = 34;
  const PAG_W = 300, PAG_H = 28, PAG_GAP = 5, BLOCO_GAP = 8, COL_GAP = 54;
  const ROOT_X = PAD, GRUPO_X = ROOT_X + ROOT_W + COL_GAP;
  const PAG_X = GRUPO_X + GRUPO_W + COL_GAP;
  const T1 = ROOT_X + ROOT_W + COL_GAP / 2, T2 = GRUPO_X + GRUPO_W + COL_GAP / 2;
  const LARG = PAG_X + PAG_W + PAD;

  let y = PAD;
  const blocos = GRUPOS.map((g) => {
    const h = g.rotas.length * PAG_H + (g.rotas.length - 1) * PAG_GAP;
    const b = { g, y, h, pagY: y };
    y += h + BLOCO_GAP;
    return b;
  });
  const ALT = y - BLOCO_GAP + PAD;

  const caixa = ({ x, yy, w, h, cor, fill, texto, fonte, peso = 600, claroTexto = false }) => {
    const out = [`<rect x="${x}" y="${yy}" width="${w}" height="${h}" rx="5" fill="${fill}" stroke="${cor}" stroke-width="1.6"/>`];
    const linhas = Array.isArray(texto) ? texto : [texto];
    const lh = fonte * 1.2;
    const y0 = yy + h / 2 - ((linhas.length - 1) * lh) / 2 + fonte * 0.35;
    linhas.forEach((l, i) => out.push(
      `<text x="${x + w / 2}" y="${y0 + i * lh}" text-anchor="middle" font-family="Liberation Sans, DejaVu Sans, Arial, sans-serif" font-size="${fonte}" font-weight="${peso}" fill="${claroTexto ? "#ffffff" : "#111827"}">${esc(l)}</text>`));
    return out.join("");
  };

  const svg = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LARG} ${ALT}" role="img" aria-label="Sitemap da aplicação Formandos" style="width:90%;max-width:100%;height:auto;display:block;margin:6pt auto;break-inside:avoid">`];
  const gY = blocos.map((b) => b.y + b.h / 2 - GRUPO_H / 2);
  const rootCy = (gY[0] + gY.at(-1)) / 2;
  const total = GRUPOS.reduce((n, g) => n + g.rotas.length, 0);

  svg.push(caixa({
    x: ROOT_X, yy: rootCy - ROOT_H / 2, w: ROOT_W, h: ROOT_H,
    cor: "#0f172a", fill: "#0f172a", texto: ["Formandos", `${total} rotas`],
    fonte: 15, peso: 700, claroTexto: true,
  }));
  svg.push(`<path d="M ${ROOT_X + ROOT_W} ${rootCy} H ${T1} M ${T1} ${gY[0]} V ${gY.at(-1)}" fill="none" stroke="#94a3b8" stroke-width="1.8"/>`);
  gY.forEach((yy) => svg.push(`<path d="M ${T1} ${yy} H ${GRUPO_X}" fill="none" stroke="#94a3b8" stroke-width="1.8"/>`));
  blocos.forEach((b, i) => {
    const gc = gY[i];
    svg.push(caixa({
      x: GRUPO_X, yy: gc - GRUPO_H / 2, w: GRUPO_W, h: GRUPO_H,
      cor: b.g.cor, fill: b.g.cor, texto: `${b.g.nome} · ${b.g.rotas.length}`, fonte: 14, peso: 700, claroTexto: true,
    }));
    const cys = b.g.rotas.map((_, j) => b.pagY + j * (PAG_H + PAG_GAP) + PAG_H / 2);
    svg.push(`<path d="M ${GRUPO_X + GRUPO_W} ${gc} H ${T2} M ${T2} ${cys[0]} V ${cys.at(-1)}" fill="none" stroke="#cbd5e1" stroke-width="1.6"/>`);
    cys.forEach((yy) => svg.push(`<path d="M ${T2} ${yy} H ${PAG_X}" fill="none" stroke="#cbd5e1" stroke-width="1.6"/>`));
    b.g.rotas.forEach((r, j) => svg.push(caixa({
      x: PAG_X, yy: b.pagY + j * (PAG_H + PAG_GAP), w: PAG_W, h: PAG_H,
      cor: b.g.cor, fill: claro(b.g.cor), texto: r, fonte: 13, peso: 600,
    })));
  });
  svg.push("</svg>");

  return { svg: svg.join("\n"), GRUPOS, total, LARG, ALT };
}

// ============================================================ conferências
function caminhos(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) caminhos(f, acc);
    else acc.push(f);
  }
  return acc;
}

const noDisco = caminhos("src/app")
  .filter((f) => f.endsWith("page.tsx") || f.endsWith("route.ts"))
  .map((f) => {
    let r = f.replace(/^src\/app\//, "");
    for (const g of ["(publico)", "(onboarding)", "(conta)", "(app)", "(admin)", "(master)"])
      if (r.startsWith(g + "/")) { r = r.slice(g.length + 1); break; }
    r = r.replace(/(page\.tsx|route\.ts)$/, "");
    return r === "" ? "/" : "/" + r.replace(/\/$/, "");
  })
  .sort();

const declaradas = Object.keys(PAGINAS).sort();
const faltam = noDisco.filter((r) => !declaradas.includes(r));
const sobram = declaradas.filter((r) => !noDisco.includes(r));
if (faltam.length || sobram.length) {
  console.error("fluxos-paginas.json não bate com src/app/:");
  if (faltam.length) console.error("  faltam:", faltam.join(", "));
  if (sobram.length) console.error("  sobram:", sobram.join(", "));
  process.exit(1);
}

// cada referência arquivo:linha precisa existir de verdade
for (const rota of TODAS) {
  const ref = arquivoDe(rota);
  const m = /^(.*):(\d+)$/.exec(ref);
  if (!m || !fs.existsSync(m[1])) {
    console.error(`referência inválida em ${rota}: ${ref}`);
    process.exit(1);
  }
  const nLinhas = fs.readFileSync(m[1], "utf8").split("\n").length;
  if (+m[2] > nLinhas) {
    console.error(`linha fora do arquivo em ${rota}: ${ref} (arquivo tem ${nLinhas})`);
    process.exit(1);
  }
}

// ============================================================ monta o markdown
const { svg, GRUPOS, total, LARG, ALT } = sitemapSVG();

const md = [];
md.push("# Organograma da Aplicação — Formandos", "");
md.push("| | |", "|---|---|");
md.push("| Escopo | `src/app/**` — 28 `page.tsx` e 2 `route.ts` |");
md.push("| Base | Código na ramificação `main` |");
md.push("| Companheiros | `Especificação de Requisitos de Software.md` · `README.md` |");
md.push("| PDF | `docs/Organograma da Aplicação.pdf` |", "");
md.push("Três leituras: **sitemap** (o que existe), **jornadas** (como o usuário",
  "chega a cada tela) e **fluxo por página** (de onde vem e para onde vai cada rota).",
  "", "---", "");

// §1
md.push('<div style="break-before:page"></div>', "", "## 1. Sitemap visual", "");
md.push("As 30 rotas de `src/app/`, agrupadas por perfil. Gerado por",
  "`scripts/docs/gerar-organograma.mjs`, que confere rota por rota contra o disco",
  "e **falha** se o desenho divergir do código.", "");
md.push("<!-- sitemap:begin -->", svg, "<!-- sitemap:end -->", "");
md.push("**Legenda**", "", "| Cor | Grupo | Quem alcança | Rotas |", "|---|---|---|---|");
const QUEM = {
  "Público": "visitante sem conta",
  "Onboarding": "sessão sem turma",
  "Conta": "qualquer sessão",
  "Membro": "membro da turma",
  "Administração": "papel admin",
  "Master": "`ehMaster`",
  "API": "Better Auth",
};
for (const g of GRUPOS) md.push(`| ${g.nome} | ${g.cor} | ${QUEM[g.nome]} | ${g.rotas.length} |`);
md.push("", "---", "");

// §2
md.push("## 2. Fluxograma geral — jornada do usuário", "");
const jornadas = [
  ["2.1 Da home até o painel", svgJornadaVisitante()],
  ["2.2 Do painel para as telas do membro", svgJornadaMembro()],
  ["2.3 Rodapé do menu: conta, administração e master", svgRodapeAreas()],
];
for (const [titulo, s] of jornadas)
  md.push('<div style="break-inside:avoid">', `<h3>${titulo}</h3>`, s, "</div>", "");
md.push("---", "");

// §3
md.push("## 3. Fluxo de cada página", "");
md.push("Mesma forma para as 30 rotas: de onde o usuário chega, a tela em si e",
  "para onde ele segue. Quando o acesso é negado, o ramo vermelho mostra o destino.",
  "", "O detalhe técnico de cada rota — arquivo, dados lidos, escritas e tabelas —",
  "fica em `scripts/docs/fluxos-paginas.json`.", "");
let n = 0;
GRUPOS.forEach((g, gi) => {
  md.push(`### 3.${gi + 1} ${g.nome}`, "");
  for (const rota of g.rotas) {
    n++;
    md.push('<div style="break-inside:avoid">',
      `<h4>${n}. <code>${esc(rota)}</code> — ${apelido(rota)}</h4>`,
      svgPagina(rota), "</div>", "");
  }
});

const conteudo = md.join("\n").replace(/\n{3,}/g, "\n\n").replace(/\n+$/, "\n");

const nSvg = (conteudo.match(/<svg /g) || []).length;
const nEsperado = 1 + 3 + TODAS.length;
if (nSvg !== nEsperado) {
  console.error(`esperava ${nEsperado} <svg> no documento, veio ${nSvg}`);
  process.exit(1);
}
const semSvg = conteudo.replace(/<svg[\s\S]*?<\/svg>/g, "");
const largas = semSvg.split("\n").map((l, i) => [i + 1, l.length]).filter(([, v]) => v > LIM);
if (largas.length) {
  console.error(`linhas acima de ${LIM} col: ${largas.slice(0, 5).map(([i, v]) => `${i}(${v})`).join(", ")}`);
  process.exit(1);
}
const semSvgEscapo = semSvg.replace(/&amp;|&lt;|&gt;/g, "xx");
for (const rota of TODAS) {
  if (!conteudo.includes(rota)) {
    console.error(`rota ausente do documento: ${rota}`);
    process.exit(1);
  }
  if (semSvgEscapo.split(rota).length < 2) {
    console.error(`rota sem menção fora do SVG: ${rota}`);
    process.exit(1);
  }
}
void semSvgEscapo;

fs.writeFileSync("docs/Organograma da Aplicação.md", conteudo);

const escala = Math.min(((174 / 25.4) * 96) / LARG, ((257 / 25.4) * 96) / ALT);
console.log(`✅ docs/Organograma da Aplicação.md`);
console.log(`   sitemap ${LARG}×${ALT}px · escala ~${(escala * 100).toFixed(0)}% · ${total} rotas`);
console.log(`   3 jornadas + ${n} fluxos por página em SVG · ${nSvg} diagramas · ${conteudo.split("\n").length} linhas`);
