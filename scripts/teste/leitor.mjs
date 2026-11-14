// Sonda de leitor de tela (ADR-0015). Lê a árvore de acessibilidade do Chrome,
// a mesma que o TalkBack recebe no Android, e acusa o que quebra a leitura:
//   - controle (botão, link, campo, opção) sem nome;
//   - página sem h1, ou com nível de título pulado (h1 direto para h3);
//   - dois botões com o mesmo nome na mesma página (o leitor lista os botões
//     fora do contexto; "Ver como tabela" 23 vezes não diz de qual pergunta).
// Não substitui o teste com TalkBack/VoiceOver de verdade: a árvore prova
// estrutura, nome e foco, não a ordem dos gestos nem a fala.
// Ver docs/adr/0015-leitor-de-tela-nas-telas-de-voto-presenca-e-evento.md.
//
// Uso: node scripts/teste/leitor.mjs <cookie|-> <caminhos,csv> [--ler] [--presenca]
//   cookie      arquivo do cookie de sessão, ou "-" para páginas públicas
//   --ler       imprime cada tela na ordem de leitura, para revisão por uma pessoa
//   --presenca  no /dashboard, abre o diálogo de presença e confere o foco ao
//               adicionar e ao remover acompanhante (não salva nada)
// Exemplo:
//   node scripts/teste/leitor.mjs scripts/teste/.tmp/cookie-participante.txt /dashboard,/votacoes/relatorio --ler
// Sai com código 1 se achar problema. fluxos.mjs usa as mesmas funções.
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import { dormir, iniciar } from "./lib/navegador.mjs";

const CONTROLES = new Set([
  "button", "link", "textbox", "combobox", "checkbox", "radio", "switch", "slider",
  "searchbox", "spinbutton", "menuitem", "tab", "DisclosureTriangle",
]);
// Papéis que só agrupam: sem nome, não são lidos.
const MUDOS = new Set([
  "generic", "none", "paragraph", "list", "listitem", "group", "ListMarker", "LineBreak",
  "DescriptionListDetail", "LayoutTable", "LabelText", "Legend", "strong", "emphasis",
]);
const ESTADOS = ["checked", "disabled", "expanded", "pressed", "required", "level", "live", "modal"];
// Botão que o Next põe na tela em desenvolvimento; não é do app.
const DE_FORA = /^Open Next\.js Dev Tools$/;

// Nós visíveis ao leitor, na ordem de leitura. A lista do Chrome vem fora de
// ordem: é preciso descer pelos filhos.
async function nos(nav) {
  await nav.cdp("Accessibility.enable");
  const { nodes } = await nav.cdp("Accessibility.getFullAXTree");
  const porId = new Map(nodes.map((n) => [n.nodeId, n]));
  const saida = [];
  const descer = (n, nivel) => {
    const papel = n.role?.value ?? "";
    const nome = String(n.name?.value ?? "").trim();
    let proximo = nivel;
    if (!n.ignored && papel !== "InlineTextBox" && !(MUDOS.has(papel) && !nome)) {
      const estados = Object.fromEntries(
        (n.properties ?? []).filter((p) => ESTADOS.includes(p.name)).map((p) => [p.name, p.value.value]),
      );
      saida.push({ papel, nome, nivel, estados, valor: n.value?.value, descricao: n.description?.value });
      proximo = nivel + 1;
    }
    for (const id of n.childIds ?? []) {
      const filho = porId.get(id);
      if (filho) descer(filho, proximo);
    }
  };
  if (nodes[0]) descer(nodes[0], 0);
  return saida;
}

// A tela como texto, uma linha por coisa lida.
export async function lerTela(nav) {
  return (await nos(nav)).map((n) => {
    const recuo = "  ".repeat(n.nivel);
    if (n.papel === "StaticText") return `${recuo}"${n.nome}"`;
    const estados = Object.entries(n.estados)
      .filter(([, v]) => v !== false && v !== "off")
      .map(([k, v]) => `${k}=${v}`)
      .join(" ");
    const valor = n.valor !== undefined && n.valor !== "" ? ` valor="${n.valor}"` : "";
    return `${recuo}[${n.papel}] "${n.nome}"${valor}${estados ? ` ${estados}` : ""}`;
  });
}

// Lista de problemas da tela aberta em `nav`. Vazia = passou.
export async function problemasDeLeitura(nav) {
  const lista = await nos(nav);
  const problemas = [];

  for (const n of lista) {
    if (CONTROLES.has(n.papel) && !n.nome) problemas.push(`controle sem nome: [${n.papel}]`);
  }

  const titulos = lista.filter((n) => n.papel === "heading");
  if (!titulos.some((t) => t.estados.level === 1)) problemas.push("página sem h1");
  let anterior = 0;
  for (const t of titulos) {
    const nivel = Number(t.estados.level);
    if (nivel > anterior + 1) problemas.push(`título pulado: h${anterior || "?"} para h${nivel} em "${t.nome}"`);
    anterior = nivel;
  }

  const vezes = new Map();
  for (const n of lista) {
    if ((n.papel === "button" || n.papel === "DisclosureTriangle") && n.nome && !DE_FORA.test(n.nome)) {
      vezes.set(n.nome, (vezes.get(n.nome) ?? 0) + 1);
    }
  }
  for (const [nome, total] of vezes) {
    if (total > 1) problemas.push(`${total} botões com o mesmo nome: "${nome}"`);
  }
  return problemas;
}

// Abre o diálogo de presença no /dashboard e confere para onde o foco vai ao
// adicionar e ao remover acompanhante. Não salva: fecha o diálogo no fim.
// O click() do script não move o foco como o toque; por isso o focus() antes.
export async function problemasDeFocoNaPresenca(nav) {
  const problemas = [];
  const foco = () =>
    nav.ev(`(() => { const a = document.activeElement; return a ? a.tagName + '#' + (a.id || '') : ''; })()`);
  const acionar = (texto) =>
    nav.ev(`(() => {
      const b = [...document.querySelectorAll('[role=dialog] button')].find((x) => x.textContent.includes(${JSON.stringify(texto)}));
      if (!b) return false;
      b.focus(); b.click(); return true;
    })()`);
  const linhas = () => nav.ev("document.querySelectorAll('[role=dialog] [data-acompanhante]').length");

  await nav.abrir("/dashboard");
  const abriu = await nav.ev(`(() => {
    const b = [...document.querySelectorAll('main button')].find((x) => /^(Responder|Mudar resposta|Informar nomes)$/.test(x.textContent.trim()));
    if (!b) return false;
    b.click(); return true;
  })()`);
  if (!abriu) return ["presença: botão de resposta não encontrado (o prazo fechou?)"];
  await nav.esperar("!!document.querySelector('[role=dialog]')", 10000, "diálogo de presença");
  await nav.ev(`(() => { const r = document.querySelector('[role=dialog] input[name=status][value=vou]'); r.focus(); r.click(); })()`);
  await dormir(300);
  // Parte de uma lista vazia, qualquer que seja a resposta já salva.
  for (let i = await linhas(); i > 0; i--) {
    await acionar("Remover");
    await dormir(200);
  }

  if (!(await acionar("Adicionar acompanhante"))) {
    problemas.push("presença: sem botão \"Adicionar acompanhante\" (a turma permite acompanhantes?)");
  } else {
    await dormir(300);
    let onde = await foco();
    if (!/^INPUT#acompanhante-nome-/.test(onde)) problemas.push(`ao adicionar, o foco deveria ir para o nome novo; foi para ${onde}`);
    await acionar("Adicionar acompanhante");
    await dormir(300);
    // Remove a primeira de duas: o foco vai para o "Remover" da que sobrou.
    await acionar("Remover");
    await dormir(300);
    onde = await foco();
    if (!/^BUTTON#acompanhante-remover-/.test(onde)) problemas.push(`ao remover, o foco deveria ir para o "Remover" vizinho; foi para ${onde}`);
    // Remove a última: o foco vai para "Adicionar acompanhante".
    await acionar("Remover");
    await dormir(300);
    onde = await foco();
    if (onde !== "BUTTON#acompanhante-adicionar") problemas.push(`ao esvaziar a lista, o foco deveria ir para "Adicionar acompanhante"; foi para ${onde}`);
  }
  await nav.ev(`(() => { const b = [...document.querySelectorAll('[role=dialog] button')].find((x) => x.textContent.trim() === 'Fechar'); b?.click(); })()`);
  await dormir(300);
  return problemas;
}

// Linha de comando.
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const [, , arquivoCookie, caminhos, ...opcoes] = process.argv;
  if (!arquivoCookie || !caminhos) {
    console.error("Uso: node scripts/teste/leitor.mjs <cookie|-> <caminhos,csv> [--ler] [--presenca]");
    process.exit(1);
  }
  const nav = await iniciar({ base: process.env.BASE_URL ?? "http://localhost:3000", largura: 360, altura: 800 });
  await nav.tamanho(360, 800, true);
  if (arquivoCookie !== "-") await nav.cookie(fs.readFileSync(arquivoCookie, "utf8").trim());
  let total = 0;
  try {
    for (const caminho of caminhos.split(",")) {
      await nav.abrir(caminho);
      if (opcoes.includes("--ler")) console.log(`\n===== ${caminho} =====\n${(await lerTela(nav)).join("\n")}`);
      const problemas = await problemasDeLeitura(nav);
      total += problemas.length;
      console.log(`${problemas.length === 0 ? "✅" : "❌"} ${caminho}${problemas.map((p) => `\n     ${p}`).join("")}`);
    }
    if (opcoes.includes("--presenca")) {
      const problemas = await problemasDeFocoNaPresenca(nav);
      total += problemas.length;
      console.log(`${problemas.length === 0 ? "✅" : "❌"} foco na lista de acompanhantes${problemas.map((p) => `\n     ${p}`).join("")}`);
    }
  } finally {
    // Sem fechar, sobra um Chrome headless vivo comendo memória.
    await nav.fechar();
  }
  process.exit(total === 0 ? 0 : 1);
}
