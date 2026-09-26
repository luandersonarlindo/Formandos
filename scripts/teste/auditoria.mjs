// Audita a responsividade: para cada página e largura, mede estouro horizontal,
// alvos pequenos (<32px) e erros de console. Opcionalmente salva screenshots.
//
// Uso: node scripts/teste/auditoria.mjs <cookie|-> <larguras,csv> <caminhos,csv> [pasta-de-screenshots]
//   cookie  arquivo do cookie de sessão, ou "-" para páginas públicas
// Exemplo:
//   node scripts/teste/auditoria.mjs scripts/teste/.tmp/cookie.txt 360,768,1024,1440,1920,3840 /dashboard,/tarefas
// Notas:
//   - Abaixo de 1100px liga a emulação de toque (pointer: coarse).
//   - O servidor de dev é lento: cada página espera 3,5 s (ajuste com ESPERA_MS).
//   - Um erro de hidratação deixa o conteúdo escondido; ele aparece em LOGS.
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const [, , arquivoCookie, larguras, caminhos, pastaShots] = process.argv;
if (!arquivoCookie || !larguras || !caminhos) {
  console.error("Uso: node scripts/teste/auditoria.mjs <cookie|-> <larguras,csv> <caminhos,csv> [pasta-de-screenshots]");
  process.exit(1);
}
const base = process.env.BASE_URL ?? "http://localhost:3000";
const espera = Number(process.env.ESPERA_MS ?? 3500);
const cookie = arquivoCookie === "-" ? null : fs.readFileSync(arquivoCookie, "utf8").trim();

const porta = 9800 + Math.floor(Math.random() * 150);
const perfil = fs.mkdtempSync(path.join(os.tmpdir(), "cdp-"));
const chrome = spawn(
  process.env.CHROME ?? "google-chrome",
  ["--headless=new", "--no-sandbox", `--remote-debugging-port=${porta}`, `--user-data-dir=${perfil}`],
  { stdio: "ignore" },
);
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
await dormir(2500);

const alvos = await (await fetch(`http://127.0.0.1:${porta}/json`)).json();
const ws = new WebSocket(alvos.find((a) => a.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pendentes = new Map();
let logs = [];
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pendentes.has(m.id)) {
    pendentes.get(m.id)(m.result);
    pendentes.delete(m.id);
  } else if (m.method === "Runtime.exceptionThrown") {
    logs.push("EXC " + String(m.params.exceptionDetails.exception?.description).slice(0, 200));
  } else if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") {
    logs.push("ERR " + m.params.args.map((a) => a.value ?? a.description).join(" ").slice(0, 200));
  }
};
const enviar = (method, params = {}) =>
  new Promise((r) => {
    const i = ++id;
    pendentes.set(i, r);
    ws.send(JSON.stringify({ id: i, method, params }));
  });
await enviar("Runtime.enable");
await enviar("Page.enable");
if (cookie) await enviar("Network.setCookie", { name: "better-auth.session_token", value: cookie, url: base });

// Mede elementos que passam da largura da janela sem estarem dentro de um contêiner com rolagem.
const medir = `(() => {
  const w = innerWidth; const ruins = [];
  for (const e of document.querySelectorAll('body *')) {
    if (e.closest('[aria-hidden=true]') || e.closest('nextjs-portal')) continue;
    const r = e.getBoundingClientRect();
    if (r.width > 0 && r.right > w + 1 && getComputedStyle(e).position !== 'fixed') {
      let p = e.parentElement, cortado = false;
      while (p && p !== document.body) {
        if (getComputedStyle(p).overflowX !== 'visible' && p.getBoundingClientRect().right <= w + 1) { cortado = true; break; }
        p = p.parentElement;
      }
      if (!cortado) ruins.push(e.tagName.toLowerCase() + ':' + Math.round(r.right));
    }
  }
  const pequenos = [...document.querySelectorAll('a,button,input,select,textarea,summary')].filter(e => {
    const r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.height < 32 && !e.closest('[aria-hidden=true]') && !e.closest('nextjs-portal')
      && !(e.tagName === 'INPUT' && (e.type === 'radio' || e.type === 'checkbox'));
  }).length;
  return { sw: document.documentElement.scrollWidth, w, ruins: ruins.slice(0, 4), nruins: ruins.length, pequenos, h: document.documentElement.scrollHeight };
})()`;

const listaLarguras = larguras.split(",").map(Number);
const listaCaminhos = caminhos.split(",");
if (pastaShots) fs.mkdirSync(pastaShots, { recursive: true });

// Aquecimento: o servidor de dev compila cada rota na primeira visita.
for (const p of listaCaminhos) {
  await enviar("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  await enviar("Page.navigate", { url: base + p });
  await dormir(1800);
}

for (const p of listaCaminhos) {
  for (const w of listaLarguras) {
    logs = [];
    await enviar("Emulation.setDeviceMetricsOverride", { width: w, height: w >= 1900 ? 1080 : 900, deviceScaleFactor: 1, mobile: w < 600 });
    await enviar("Emulation.setTouchEmulationEnabled", { enabled: w < 1100, maxTouchPoints: 5 });
    await enviar("Page.navigate", { url: base + p });
    await dormir(espera);
    const v = (await enviar("Runtime.evaluate", { returnByValue: true, expression: medir })).result.value;
    // A barra de rolagem vertical (~15px) faz scrollWidth < largura; só conta como estouro se passar da janela.
    const marca = (v.sw > v.w ? "ESTOURO " : "") + (v.nruins ? `fora=${v.nruins} ` : "");
    console.log(`${p} @${w}: sw=${v.sw} h=${v.h} pequenos=${v.pequenos} ${marca}${v.ruins.join(" | ")}${logs.length ? " LOGS:" + logs.join(";") : ""}`);
    if (pastaShots) {
      const foto = await enviar("Page.captureScreenshot", { format: "png" });
      fs.writeFileSync(path.join(pastaShots, `${p.replace(/[^a-z0-9]/gi, "_")}_${w}.png`), Buffer.from(foto.data, "base64"));
    }
  }
}
chrome.kill();
await dormir(500);
try {
  fs.rmSync(perfil, { recursive: true, force: true });
} catch {
  // O Chrome ainda pode estar gravando no perfil temporário; o sistema limpa depois.
}
process.exit(0);
