// Pequeno controle do Chrome headless via DevTools Protocol, para os testes de
// fluxo (fluxos.mjs). Sem dependências: usa o WebSocket global do Node 22.
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

export async function iniciar({ base = "http://localhost:3000", largura = 1280, altura = 900 } = {}) {
  const porta = 9500 + Math.floor(Math.random() * 300);
  const perfil = fs.mkdtempSync(path.join(os.tmpdir(), "cdp-"));
  const chrome = spawn(
    process.env.CHROME ?? "google-chrome",
    ["--headless=new", "--no-sandbox", `--remote-debugging-port=${porta}`, `--user-data-dir=${perfil}`],
    { stdio: "ignore" },
  );
  await dormir(2500);
  const alvos = await (await fetch(`http://127.0.0.1:${porta}/json`)).json();
  const ws = new WebSocket(alvos.find((a) => a.type === "page").webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));

  let id = 0;
  const pendentes = new Map();
  const logs = [];
  const esperandoCarga = [];
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.method === "Page.loadEventFired") {
      esperandoCarga.splice(0).forEach((r) => r());
    } else if (m.id && pendentes.has(m.id)) {
      pendentes.get(m.id)(m.result ?? m.error);
      pendentes.delete(m.id);
    } else if (m.method === "Runtime.exceptionThrown") {
      logs.push("EXC " + String(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text).slice(0, 300));
    } else if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") {
      logs.push("ERR " + m.params.args.map((a) => a.value ?? a.description).join(" ").slice(0, 300));
    }
  };
  const cdp = (method, params = {}) =>
    new Promise((r) => {
      const i = ++id;
      pendentes.set(i, r);
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  await cdp("Runtime.enable");
  await cdp("Network.enable");
  await cdp("Page.enable");
  await cdp("Emulation.setDeviceMetricsOverride", { width: largura, height: altura, deviceScaleFactor: 1, mobile: false });

  const nav = {
    base,
    logs,
    cdp,
    async ev(expressao) {
      const r = await cdp("Runtime.evaluate", { expression: expressao, returnByValue: true, awaitPromise: true, userGesture: true });
      if (r.exceptionDetails) throw new Error("ev: " + (r.exceptionDetails.exception?.description ?? r.exceptionDetails.text));
      return r.result?.value;
    },
    // Espera uma expressão JS ficar verdadeira.
    async esperar(expressao, ms = 10000, descricao = expressao) {
      const fim = Date.now() + ms;
      while (Date.now() < fim) {
        try {
          if (await nav.ev(expressao)) return true;
        } catch {}
        await dormir(150);
      }
      throw new Error(`tempo esgotado esperando: ${descricao}`);
    },
    url: () => nav.ev("location.pathname + location.search"),
    texto: () => nav.ev("document.body.innerText"),
    async abrir(caminho) {
      // Espera o evento load do documento NOVO; sem isso, a checagem de "assentar"
      // pode olhar a página antiga antes de a navegação acontecer.
      const carregou = new Promise((r) => {
        esperandoCarga.push(r);
        setTimeout(r, 30000);
      });
      await cdp("Page.navigate", { url: caminho.startsWith("http") ? caminho : base + caminho });
      await carregou;
      await nav.assentar();
    },
    // Espera a página carregar e o AnimarPagina liberar o conteúdo (hidratação).
    async assentar(ms = 15000) {
      await dormir(200);
      await nav.esperar(
        `document.readyState === 'complete' && (() => { const w = document.querySelector('[data-animar]'); return !w || w.dataset.animar === 'pronto'; })()`,
        ms,
        "página assentar",
      );
      await dormir(900); // deixa as animações de entrada terminarem
    },
    async tem(texto) {
      return (await nav.texto()).includes(texto);
    },
    async esperarTexto(texto, ms = 10000) {
      await nav.esperar(`document.body.innerText.includes(${JSON.stringify(texto)})`, ms, `texto "${texto}"`);
    },
    async esperarUrl(parte, ms = 10000) {
      await nav.esperar(`(location.pathname + location.search).includes(${JSON.stringify(parte)})`, ms, `url com "${parte}"`);
    },
    // Clica no primeiro elemento visível (dentro de `escopo`, um trecho de texto de um cartão) com esse texto.
    async clicar(texto, { seletor = "button,a,summary,label", escopo = null, contem = true } = {}) {
      const ok = await nav.ev(`(() => {
        const raiz = ${escopo ? `[...document.querySelectorAll('[data-slot=card],li,section,details,form,article')].filter(c => c.textContent.includes(${JSON.stringify(escopo)})).sort((a, b) => a.textContent.length - b.textContent.length)[0]` : "document"};
        if (!raiz) return 'sem-escopo';
        const t = ${JSON.stringify(texto)};
        const el = [...raiz.querySelectorAll(${JSON.stringify(seletor)})].find(e => {
          const r = e.getBoundingClientRect(); if (!r.width || !r.height) return false;
          const x = (e.getAttribute('aria-label') || '') + ' ' + e.textContent.trim();
          return ${contem ? "x.includes(t)" : "e.textContent.trim() === t"};
        });
        if (!el) return 'sem-elemento';
        el.scrollIntoView({ block: 'center' }); el.click(); return 'ok';
      })()`);
      if (ok !== "ok") throw new Error(`clicar "${texto}"${escopo ? ` em "${escopo}"` : ""}: ${ok}`);
      await dormir(150);
    },
    // Preenche um campo (input, textarea ou select) e avisa o React.
    async preencher(seletor, valor) {
      const ok = await nav.ev(`(() => {
        const el = document.querySelector(${JSON.stringify(seletor)}); if (!el) return false;
        const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
        Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, ${JSON.stringify(valor)});
        el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); return true;
      })()`);
      if (!ok) throw new Error(`campo não encontrado: ${seletor}`);
    },
    async cookie(valor) {
      await cdp("Network.clearBrowserCookies");
      if (valor) await cdp("Network.setCookie", { name: "better-auth.session_token", value: valor, url: base });
    },
    async foto(arquivo) {
      const f = await cdp("Page.captureScreenshot", { format: "png" });
      fs.mkdirSync(path.dirname(arquivo), { recursive: true });
      fs.writeFileSync(arquivo, Buffer.from(f.data, "base64"));
    },
    async tamanho(largura, altura, toque = false) {
      await cdp("Emulation.setDeviceMetricsOverride", { width: largura, height: altura, deviceScaleFactor: 1, mobile: largura < 600 });
      await cdp("Emulation.setTouchEmulationEnabled", { enabled: toque, maxTouchPoints: 5 });
    },
    async fechar() {
      chrome.kill();
      await dormir(500);
      try {
        fs.rmSync(perfil, { recursive: true, force: true });
      } catch {}
    },
  };
  return nav;
}
