// Abre uma página no Chrome headless (via DevTools Protocol, sem instalar nada:
// o Node 22 já tem WebSocket global), tira um screenshot e mostra erros de
// console e de hidratação.
//
// Uso: node scripts/teste/captura.mjs <url> <saida.png> [largura] [altura] [espera-ms]
// Ambiente:
//   COOKIE_FILE  arquivo do cookie de sessão (padrão scripts/teste/.tmp/cookie.txt)
//   SEM=1        não envia cookie (páginas públicas)
//   CLICK="txt"  clica no primeiro botão cujo texto contém "txt" e mostra o resultado
//   CHROME       binário do Chrome (padrão google-chrome)
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const [, , url, saida, largura = "1280", altura = "900", espera = "4000"] = process.argv;
if (!url || !saida) {
  console.error("Uso: node scripts/teste/captura.mjs <url> <saida.png> [largura] [altura] [espera-ms]");
  process.exit(1);
}
const arquivoCookie = process.env.COOKIE_FILE ?? "scripts/teste/.tmp/cookie.txt";
const cookie = process.env.SEM ? null : fs.readFileSync(arquivoCookie, "utf8").trim();

const porta = 9300 + Math.floor(Math.random() * 500);
const perfil = fs.mkdtempSync(path.join(os.tmpdir(), "cdp-"));
const chrome = spawn(
  process.env.CHROME ?? "google-chrome",
  ["--headless=new", "--no-sandbox", `--remote-debugging-port=${porta}`, `--window-size=${largura},${altura}`, `--user-data-dir=${perfil}`],
  { stdio: "ignore" },
);
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
await dormir(2500);

const alvos = await (await fetch(`http://127.0.0.1:${porta}/json`)).json();
const ws = new WebSocket(alvos.find((a) => a.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pendentes = new Map();
const logs = [];
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pendentes.has(m.id)) {
    pendentes.get(m.id)(m.result);
    pendentes.delete(m.id);
  } else if (m.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(m.params.type)) {
    logs.push(m.params.type + ": " + m.params.args.map((a) => a.value ?? a.description).join(" "));
  } else if (m.method === "Runtime.exceptionThrown") {
    logs.push("EXC " + JSON.stringify(m.params.exceptionDetails.exception?.description));
  }
};
const enviar = (method, params = {}) =>
  new Promise((r) => {
    const i = ++id;
    pendentes.set(i, r);
    ws.send(JSON.stringify({ id: i, method, params }));
  });

await enviar("Runtime.enable");
await enviar("Network.enable");
await enviar("Page.enable");
await enviar("Emulation.setDeviceMetricsOverride", { width: +largura, height: +altura, deviceScaleFactor: 1, mobile: +largura < 600 });
if (cookie) await enviar("Network.setCookie", { name: "better-auth.session_token", value: cookie, url: new URL(url).origin });
await enviar("Page.navigate", { url });
await dormir(+espera);

const estado = await enviar("Runtime.evaluate", {
  returnByValue: true,
  expression: `(() => { const w = document.querySelector('[data-animar]');
    const ocultos = [...document.querySelectorAll('[data-animar] *')].filter(e => getComputedStyle(e).opacity === '0' && e.offsetParent !== null && !e.closest('[aria-hidden]')).length;
    return { animar: w?.dataset.animar, ocultos, titulo: document.title, h1: document.querySelector('h1')?.textContent }; })()`,
});
console.log(JSON.stringify(estado.result.value));

if (process.env.CLICK) {
  await enviar("Emulation.setFocusEmulationEnabled", { enabled: true });
  const r = await enviar("Runtime.evaluate", {
    returnByValue: true,
    userGesture: true,
    awaitPromise: true,
    expression: `(async () => { const b = [...document.querySelectorAll('button')].find(x => x.textContent.includes(${JSON.stringify(process.env.CLICK)}));
      if (!b) return 'sem botão'; b.click(); await new Promise(r => setTimeout(r, 600)); return b.textContent; })()`,
  });
  console.log("CLICK:", JSON.stringify(r.result.value));
}

console.log(logs.length ? "LOGS:\n" + logs.join("\n") : "sem erros de console");
const foto = await enviar("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
fs.mkdirSync(path.dirname(saida), { recursive: true });
fs.writeFileSync(saida, Buffer.from(foto.data, "base64"));
chrome.kill();
await dormir(500);
try {
  fs.rmSync(perfil, { recursive: true, force: true });
} catch {
  // O Chrome ainda pode estar gravando no perfil temporário; o sistema limpa depois.
}
process.exit(0);
