// Testes de fluxo no navegador de verdade (Chrome headless): preenche
// formulários, clica em botões e confere o resultado na tela e no banco.
//
// Roda contra o Docker (os emails caem no Mailpit, lido pela API) ou contra o
// dev server no host com SMTP desligado (o email vai para o log, e nenhum
// email real é enviado). Para o grupo "master", a conta fictícia tem de ser master:
//   SMTP_HOST= ADMIN_MASTER_EMAILS="teste-sh@example.invalid" npm run dev > scripts/teste/.tmp/dev.log 2>&1
// No Docker: DATABASE_URL=postgres://formandos:formandos@127.0.0.1:5433/formandos
// Uso:
//   scripts/teste/semear.sh
//   node scripts/teste/fluxos.mjs [grupos,csv]     (padrão: todos)
//   grupos: auth, participante, app, admin, master, extras
// Cria dados com emails teste-*@example.invalid e códigos TESTE*; apague com limpar.sh.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { dormir, iniciar } from "./lib/navegador.mjs";

const TMP = "scripts/teste/.tmp";
const LOG = process.env.LOG_SERVIDOR ?? `${TMP}/dev.log`;
let DB = process.env.DATABASE_URL;
if (!DB && fs.existsSync(".env.local")) DB = fs.readFileSync(".env.local", "utf8").match(/^DATABASE_URL="?([^"\n]*)"?/m)?.[1];
if (!DB) throw new Error("defina DATABASE_URL ou crie o .env.local");
const sql = (q) => execFileSync("psql", [DB, "-Atc", q]).toString().trim();
const lerCookie = (nome) => fs.readFileSync(`${TMP}/${nome}`, "utf8").trim();
const grupos = (process.argv[2] ?? "auth,participante,app,admin,master,extras").split(",");

const resultados = [];
let grupoAtual = "";
async function passo(nome, fn) {
  // Marca cada erro de console com o passo em que apareceu: sem isso, o
  // "sem erros de console no grupo" não diz de onde veio o erro.
  const inicio = nav.logs.length;
  const marcar = () => {
    for (let i = inicio; i < nav.logs.length; i++) {
      if (!nav.logs[i].startsWith("[")) nav.logs[i] = `[${nome}] ${nav.logs[i]}`;
    }
  };
  try {
    await fn();
    marcar();
    resultados.push({ grupoAtual, nome, ok: true });
    console.log(`  ✅ ${nome}`);
  } catch (e) {
    marcar();
    resultados.push({ grupoAtual, nome, ok: false, erro: e.message });
    console.log(`  ❌ ${nome}\n     ${e.message.split("\n")[0]}`);
  }
}
const igual = (a, b, msg) => {
  if (a !== b) throw new Error(`${msg}: esperado ${JSON.stringify(b)}, veio ${JSON.stringify(a)}`);
};
const verdade = (c, msg) => {
  if (!c) throw new Error(msg);
};
// Emails enviados pelo servidor. Duas fontes:
// - Mailpit (Docker: o SMTP do container cai nele), quando responde em
//   MAILPIT_URL (padrão http://localhost:8025);
// - o log do dev server no host, rodando com SMTP_HOST vazio (src/lib/email.ts
//   imprime o email inteiro). Force com EMAILS=log.
// Os dois devolvem o email como texto (assunto + corpo), do mais novo para o
// mais antigo. Os emails da turma saem em after(), depois da resposta: por
// isso as buscas esperam até 10 s.
const MAILPIT = process.env.MAILPIT_URL ?? "http://localhost:8025";
const usarMailpit =
  process.env.EMAILS !== "log" &&
  (await fetch(`${MAILPIT}/api/v1/info`).then((r) => r.ok).catch(() => false));
const JANELA_LOG = 40000;
const MARCA_EMAIL = "[email não enviado: SMTP_HOST vazio]";
const ORIGEM_EMAILS = usarMailpit ? `Mailpit (${MAILPIT})` : `log do servidor (${LOG})`;
async function emailsRecentes() {
  if (!usarMailpit) {
    // O corte é pela marca do log, e não por linha em branco: o corpo do email
    // tem parágrafos, e quebrar nele cortaria o email no meio.
    return fs.readFileSync(LOG, "utf8").slice(-JANELA_LOG).split(MARCA_EMAIL).reverse();
  }
  const { messages } = await (await fetch(`${MAILPIT}/api/v1/messages?limit=30`)).json();
  return Promise.all(
    messages.map(async (m) => {
      const d = await (await fetch(`${MAILPIT}/api/v1/message/${m.ID}`)).json();
      return `Para: ${m.To.map((t) => t.Address).join(", ")}\nAssunto: ${d.Subject}\n\n${d.Text}`;
    }),
  );
}
async function procurarEmail(achar, descricao) {
  for (let i = 0; i < 20; i++) {
    const r = achar(await emailsRecentes());
    if (r) return r;
    await dormir(500);
  }
  throw new Error(`${descricao} não apareceu no ${ORIGEM_EMAILS}`);
}
const ultimoLink = (parte) =>
  procurarEmail((lista) => {
    for (const e of lista) {
      const l = (e.match(/https?:\/\/[^\s"'<>]+/g) ?? []).filter((x) => x.includes(parte)).at(-1);
      if (l) return l.replace(/&amp;/g, "&");
    }
    return null;
  }, `link com "${parte}"`);
const ultimoEmail = (trecho) =>
  procurarEmail((lista) => lista.find((e) => e.includes(trecho)) ?? null, `email com "${trecho}"`);
const idPadrao = () => sql("select id from catalogos where turma_id is null order by nome limit 1");
// A turma do seed (o código de convite pode ser trocado pelos testes; o email do criador não).
const turmaTeste = () => sql("select id from turmas where criado_por = (select id from usuarios where email='teste-sh@example.invalid') and nome='Sistemas de Informação 2026'");

// Aponta para outro servidor com BASE_URL (ex.: testes em porta paralela).
const nav = await iniciar({ base: process.env.BASE_URL ?? "http://localhost:3000" });
// "Dados do evento" agora é um diálogo ("Editar dados do evento"), não mais
// um painel <details>. Cada nav.abrir recarrega a página, então cada passo que
// preenche esses campos abre o diálogo de novo.
const abrirDadosDoEvento = async () => {
  await nav.clicar("Editar dados do evento", { seletor: "button" });
};
// "Adicionar pergunta" mora no cabeçalho de cada categoria e abre um diálogo.
// O mesmo texto de botão aparece em todas as seções, então o clique é feito
// pelo h2 da categoria dentro do próprio <section>. O retry existe porque
// logo após adicionar uma categoria a página ainda está re-renderizando.
const abrirFormularioDePergunta = async (categoria) => {
  const achar = async () => {
    const alvo = categoria
      ? `[...document.querySelectorAll('section')].find(s => s.querySelector('h2')?.textContent.trim() === ${JSON.stringify(categoria)})`
      : "document.body";
    return nav.ev(
      `(() => { const s = ${alvo};
        const b = s ? [...s.querySelectorAll('button')].find(x => x.textContent.trim() === 'Adicionar pergunta') : null;
        if (!b) return false; b.click(); return true; })()`,
    );
  };
  for (let i = 0; i < 20; i++) {
    if (await achar()) {
      await nav.esperar("!!document.querySelector('[role=dialog]')", 10000, `diálogo de pergunta${categoria ? ` de ${categoria}` : ""}`);
      return;
    }
    await dormir(500);
  }
  throw new Error(`botão "Adicionar pergunta" de "${categoria ?? "(primeira categoria)"}" não apareceu`);
};
const logsDesde = (n) => nav.logs.slice(n);
// Os botões de exclusão abrem um diálogo antes de apagar. Clica no botão,
// confere que o diálogo apareceu e confirma dentro dele.
const excluir = async (texto, { escopo = null, contem = true, seletor = "button" } = {}) => {
  await nav.clicar(texto, { escopo, seletor, contem });
  await nav.esperar("!!document.querySelector('[role=dialog]')", 10000, `diálogo de "${texto}"`);
  await nav.clicar("Sim, excluir", { escopo: "@[role=dialog]", seletor: "button", contem: false });
};
async function grupo(nome, fn) {
  if (!grupos.includes(nome)) return;
  console.log(`\n== ${nome}`);
  grupoAtual = nome;
  const antes = nav.logs.length;
  await fn();
  const novos = logsDesde(antes);
  await passo("sem erros de console no grupo", async () => verdade(novos.length === 0, novos.join(" | ")));
}
// Escopo de um cartão/lista por trecho de texto, ou CSS quando começa com "@".
function expressaoDoEscopo(escopo) {
  return escopo.startsWith("@")
    ? `document.querySelector(${JSON.stringify(escopo.slice(1))})`
    : `[...document.querySelectorAll('[data-slot=card],li,section,details,form,article')].filter(c => c.textContent.includes(${JSON.stringify(escopo)})).sort((a, b) => a.textContent.length - b.textContent.length)[0]`;
}
// Avalia uma expressão dentro do escopo. A página de votações tem dois
// input[name=titulo]: o da edição da pergunta existente e o do formulário de
// adicionar, e o da edição vem antes no documento. Sem escopo, o
// document.querySelector pega o errado e o preenchimento vai parar no campo
// que não é o do teste.
const em = (escopo, expressao) =>
  nav.ev(`(() => { const raiz = ${expressaoDoEscopo(escopo)}; return ${expressao}; })()`);
// Preenche um campo dentro de um cartão/lista identificado por um trecho de texto.
async function preencherEm(escopo, seletor, valor) {
  const ok = await nav.ev(`(() => {
    const raiz = ${expressaoDoEscopo(escopo)};
    const el = raiz?.querySelector(${JSON.stringify(seletor)}); if (!el) return false;
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, ${JSON.stringify(valor)});
    el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  if (!ok) throw new Error(`campo "${seletor}" não encontrado em "${escopo}"`);
}

// As opções não são mais um campo de texto com uma por linha: são linhas com
// input próprio (editor-opcoes.tsx). Preenche a linha i de dentro do diálogo.
async function preencherOpcoes(textos) {
  for (let i = 0; i < textos.length; i++) {
    if (i > 0) {
      await nav.clicar("Adicionar opção", { escopo: "@[role=dialog]", seletor: "button" });
    }
    await preencherEm("@[role=dialog]", `[aria-label='Opção ${i + 1}']`, textos[i]);
  }
}

const NOVO = "teste-novo@example.invalid";

await grupo("auth", async () => {
  await nav.cookie(null);
  // Compila /entrar e o endpoint de login antes do primeiro passo. A primeira
  // requisição de uma rota leva quase 30s com o compilador frio, e o passo
  // abaixo só espera 10s pelo texto de erro: sem este aquecimento ele falha por
  // tempo, não por defeito.
  await nav.abrir("/entrar");
  await nav.preencher("#email", "aquecimento@example.invalid");
  await nav.preencher("#senha", "SenhaAquecimento1");
  await nav.clicar("Entrar", { seletor: "form button[type=submit]" });
  await nav.esperar("document.readyState === 'complete'", 30000, "compilação do login");
  await passo("login com senha errada mostra erro", async () => {
    await nav.abrir("/entrar");
    await nav.preencher("#email", "ninguem@example.invalid");
    await nav.preencher("#senha", "senhaErrada1");
    await nav.clicar("Entrar", { seletor: "form button[type=submit]" });
    await nav.esperarTexto("Email ou senha incorretos.");
  });
  await passo("criar conta mostra o aviso de confirmação", async () => {
    await nav.abrir("/entrar");
    await nav.clicar("Criar conta", { seletor: "button[aria-pressed]" });
    await nav.preencher("#nome", "Novo Teste");
    await nav.preencher("#email", NOVO);
    await nav.preencher("#senha", "SenhaTeste123");
    await nav.clicar("Tenho 18 anos ou mais e aceito", { seletor: "label" });
    await nav.clicar("Criar conta", { seletor: "form button[type=submit]" });
    await nav.esperarTexto("Enviamos um link de confirmação");
    igual(sql(`select "emailVerified" from usuarios where email='${NOVO}'`), "f", "email ainda não confirmado");
    igual(sql(`select (consentimento_em is not null)::int from usuarios where email='${NOVO}'`), "1", "aceite LGPD carimbado");
  });
  await passo("ADR-0011: Termos e Política dizem que a conta é para maiores de 18", async () => {
    await nav.abrir("/termos");
    await nav.esperarTexto("2. Quem pode usar");
    await nav.esperarTexto("Versão 1.1");
    await nav.abrir("/privacidade");
    await nav.esperarTexto("Menores de 18 anos");
  });
  await passo("entrar antes de confirmar o email é bloqueado", async () => {
    await nav.abrir("/entrar");
    await nav.preencher("#email", NOVO);
    await nav.preencher("#senha", "SenhaTeste123");
    await nav.clicar("Entrar", { seletor: "form button[type=submit]" });
    await nav.esperarTexto("Confirme seu email");
  });
  await passo("o link do email confirma a conta e leva ao convite", async () => {
    await dormir(500);
    await nav.abrir(await ultimoLink("verify-email"));
    await nav.esperarUrl("/convite");
    igual(sql(`select "emailVerified" from usuarios where email='${NOVO}'`), "t", "email confirmado");
    // Confirmar o email dispara as boas-vindas logo em seguida.
    verdade((await ultimoEmail("Sua conta no Formandos está pronta")).includes(NOVO), "email de boas-vindas enviado");
  });
  await passo("código de convite inválido mostra erro", async () => {
    await nav.preencher("#codigo", "ZZZZZZZZ");
    await nav.clicar("Entrar na turma", { seletor: "button" });
    await nav.esperarTexto("Código de convite inválido");
  });
  await passo("criar turma leva ao dashboard vazio", async () => {
    await nav.preencher("#nome", "Turma Nova Teste");
    await nav.clicar("Criar turma", { seletor: "button" });
    await nav.esperarUrl("/dashboard");
    await nav.assentar();
    await nav.esperarTexto("A data do evento ainda não foi definida");
    await nav.esperarTexto("Dados do evento");
    await nav.esperarTexto("Nenhum item ainda");
    await nav.foto(`${TMP}/vazio-dashboard.png`);
    sql(`update turmas set codigo_convite='TESTENOVA01' where nome='Turma Nova Teste'`);
  });
  await passo("minha conta: corrigir o nome completo", async () => {
    await nav.abrir("/conta");
    await nav.esperarTexto("Dados");
    // Espaços sobrando e das pontas não podem chegar no nome que a turma lê.
    await nav.preencher("#nome", "  Novo   Teste  da Silva  ");
    await nav.clicar("Salvar nome", { seletor: "button" });
    await nav.esperarTexto("Nome atualizado");
    igual(sql(`select name from usuarios where email='${NOVO}'`), "Novo Teste da Silva", "nome normalizado no banco");
    await nav.abrir("/dashboard");
    verdade(await nav.tem("Novo Teste da Silva"), "o menu lateral mostra o nome novo, não o do cadastro");
    await nav.abrir("/conta");
    await nav.preencher("#nome", "x");
    await nav.clicar("Salvar nome", { seletor: "button" });
    await nav.esperarTexto("pelo menos 2 caracteres");
    igual(sql(`select name from usuarios where email='${NOVO}'`), "Novo Teste da Silva", "nome curto não é gravado");
  });
  for (const [caminho, texto] of [
    ["/tarefas", "Nenhuma tarefa ainda"],
    ["/duvidas", "Nenhuma dúvida ainda"],
    ["/terceiros", "Nenhum fornecedor por aqui"],
  ]) {
    await passo(`estado vazio em ${caminho}`, async () => {
      await nav.abrir(caminho);
      await nav.esperarTexto(texto);
      await nav.foto(`${TMP}/vazio${caminho.replace(/\//g, "-")}.png`);
    });
  }
  await passo("sair da conta volta para a página inicial", async () => {
    await nav.abrir("/dashboard");
    await nav.clicar("Sair", { seletor: "button" });
    await nav.esperar("location.pathname === '/'", 10000, "voltar para /");
    await nav.abrir("/dashboard");
    await nav.esperarUrl("/entrar");
  });
  await passo("entrar com email e senha corretos abre o dashboard", async () => {
    await nav.abrir("/entrar");
    await nav.preencher("#email", NOVO);
    await nav.preencher("#senha", "SenhaTeste123");
    await nav.clicar("Entrar", { seletor: "form button[type=submit]" });
    await nav.esperarUrl("/dashboard");
  });
  await passo("esqueci a senha confirma o envio sem revelar a conta", async () => {
    await nav.cookie(null);
    await nav.abrir("/esqueci-senha");
    await nav.preencher("#email", NOVO);
    await nav.clicar("Enviar link", { seletor: "button" });
    await nav.esperarTexto("Confira o seu email");
    verdade(
      (await ultimoEmail("Defina sua senha no Formandos")).includes("reset-password"),
      "email de redefinição aponta para o link da senha",
    );
  });
  await passo("redefinir a senha pelo link e entrar com a nova", async () => {
    await dormir(500);
    await nav.abrir(await ultimoLink("reset-password"));
    await nav.esperarUrl("/redefinir-senha");
    await nav.preencher("#senha", "OutraSenha456");
    await nav.clicar("Salvar senha", { seletor: "button" });
    await nav.esperarTexto("Senha salva");
    await nav.abrir("/entrar");
    await nav.preencher("#email", NOVO);
    await nav.preencher("#senha", "OutraSenha456");
    await nav.clicar("Entrar", { seletor: "form button[type=submit]" });
    await nav.esperarUrl("/dashboard");
  });
  await passo("excluir minha conta exige o email e apaga a turma em que a pessoa está sozinha", async () => {
    await nav.abrir("/conta");
    await nav.esperarTexto("Excluir minha conta");
    await nav.esperarTexto("Turma Nova Teste");
    await nav.preencher("#confirmacao", "errado@example.invalid");
    await nav.clicar("Excluir minha conta", { seletor: "form button[type=submit]" });
    await nav.esperarTexto("não confere");
    igual(sql(`select count(*) from usuarios where email='${NOVO}'`), "1", "email errado não apaga");
    await nav.preencher("#confirmacao", NOVO);
    await nav.clicar("Excluir minha conta", { seletor: "form button[type=submit]" });
    await nav.esperar("location.pathname === '/'", 10000, "voltar para a página inicial");
    igual(sql(`select count(*) from usuarios where email='${NOVO}'`), "0", "conta apagada");
    igual(sql("select count(*) from turmas where nome='Turma Nova Teste'"), "0", "turma dele apagada junto");
    // O email chega depois da conta cair, então tem de citar as turmas de antes.
    const exclusao = await ultimoEmail("como você pediu");
    verdade(exclusao.includes("Turma Nova Teste"), "email de exclusão cita a turma que ele estava");
    // O texto puro do log é o que a pessoa recebe quando o cliente não mostra
    // HTML; é nele que a irreversibilidade precisa estar escrita.
    verdade(exclusao.includes("Não dá para recuperar"), "email de exclusão avisa que não volta atrás");
    await nav.abrir("/dashboard");
    await nav.esperarUrl("/entrar");
  });
  await passo("link de redefinição inválido mostra a tela de erro", async () => {
    await nav.cookie(null);
    await nav.abrir("/redefinir-senha");
    await nav.esperarTexto("Link inválido ou expirado");
  });
});

await grupo("participante", async () => {
  await nav.cookie(lerCookie("cookie-participante.txt"));
  await passo("participante entra por código já existente após sair da turma", async () => {
    await nav.abrir("/dashboard");
    await nav.clicar("Sair da turma", { seletor: "button" });
    await nav.clicar("Sim, sair", { escopo: "@[role=dialog]", seletor: "button", contem: false });
    await nav.esperarUrl("/convite");
    igual(sql("select count(*) from membros m join usuarios u on u.id=m.usuario_id where u.email='teste-jl@example.invalid'"), "0", "sem turma");
    verdade(
      (await ultimoEmail("Você saiu da turma Sistemas de Informação 2026")).includes("Se mudar de ideia"),
      "email de saída oferece voltar com o código de convite",
    );
    await nav.preencher("#codigo", "TESTESH0001");
    await nav.clicar("Entrar na turma", { seletor: "button" });
    await nav.esperarUrl("/dashboard");
    igual(sql("select papel from membros m join usuarios u on u.id=m.usuario_id where u.email='teste-jl@example.invalid'"), "participante", "papel");
    verdade(
      (await ultimoEmail("Você entrou na turma Sistemas de Informação 2026")).includes("João Lima"),
      "email de entrada saúda pelo nome",
    );
    // Sair limpa a autoria: a tarefa segue na turma, mas sem responsável, como manda a regra.
    igual(
      sql(`select count(*) from tarefas t join usuarios u on u.email='teste-jl@example.invalid' where t.titulo='Fechar o buffet' and t.responsavel_id=u.id`),
      "0",
      "a tarefa ficou sem responsável",
    );
    // O admin reatribui, para os próximos passos terem quem atualize o andamento.
    sql(`update tarefas t set responsavel_id=(select id from usuarios where email='teste-jl@example.invalid')
          where t.titulo='Fechar o buffet' and t.responsavel_id is null`);
  });
  await passo("participante que abre o painel do administrador volta ao dashboard", async () => {
    await nav.abrir("/admin");
    await nav.esperar("location.pathname === '/dashboard'", 10000, "redirecionar para /dashboard");
  });
  await passo("ids da página são únicos (o link de pular e os rótulos dependem disso)", async () => {
    for (const caminho of ["/duvidas", "/tarefas", "/terceiros", "/dashboard"]) {
      await nav.abrir(caminho);
      const repetidos = await nav.ev("(() => { const c = {}; document.querySelectorAll('[id]').forEach(e => c[e.id] = (c[e.id] || 0) + 1); return Object.entries(c).filter(([, n]) => n > 1).map(([id]) => id); })()");
      igual(repetidos.length, 0, `ids repetidos em ${caminho}: ${repetidos}`);
    }
  });
  await passo("participante não vê botões de admin em Terceiros e Tarefas", async () => {
    await nav.abrir("/terceiros");
    verdade(!(await nav.tem("Adicionar fornecedor")) && !(await nav.tem("Remover")), "botões de admin visíveis");
    await nav.abrir("/tarefas");
    verdade(!(await nav.tem("Nova tarefa")) && !(await nav.tem("Gerenciar tarefa")), "botões de admin visíveis");
  });
  await passo("presença: vou com acompanhantes, e talvez zera os acompanhantes", async () => {
    const resposta = () => sql("select status || ':' || acompanhantes || ':' || coalesce(observacao,'') from presencas p join usuarios u on u.id=p.usuario_id where u.email='teste-jl@example.invalid'");
    // A resposta agora mora num diálogo ("Responder"/"Mudar resposta"); cada
    // envio fecha o diálogo, então cada interação reabre.
    const abrirResposta = async () => {
      await nav.abrir("/dashboard");
      await nav.esperarTexto("Você vai ao evento?");
      if (await nav.tem("Mudar resposta")) await nav.clicar("Mudar resposta", { seletor: "button" });
      else await nav.clicar("Responder", { seletor: "button" });
      await nav.esperar("!!document.querySelector('[role=dialog]')", 10000, "diálogo de presença");
    };
    const salvarResposta = async () => {
      await nav.clicar("Salvar resposta", { escopo: "@[role=dialog]", seletor: "button" });
      await nav.esperar("!document.querySelector('[role=dialog]')", 10000, "diálogo fecha ao salvar");
    };
    await abrirResposta();
    await nav.clicar("Vou", { escopo: "@[role=dialog]", seletor: "label", contem: false });
    await preencherEm("@[role=dialog]", "#acompanhantes", "2");
    await preencherEm("@[role=dialog]", "#observacao", "Minha mãe e meu irmão");
    await salvarResposta();
    await dormir(800);
    igual(resposta(), "vou:2:Minha mãe e meu irmão", "vou com acompanhantes");
    await abrirResposta();
    await nav.clicar("Talvez", { escopo: "@[role=dialog]", seletor: "label", contem: false });
    verdade(!(await nav.ev("!!document.querySelector('[role=dialog] #acompanhantes')")), "campo de acompanhantes some com Talvez");
    await salvarResposta();
    await dormir(1800);
    igual(resposta(), "talvez:0:Minha mãe e meu irmão", "talvez zera os acompanhantes");
    // Deixa como "vou" com 2 acompanhantes para o painel do administrador conferir.
    await abrirResposta();
    await nav.clicar("Vou", { escopo: "@[role=dialog]", seletor: "label", contem: false });
    // O navegador já barra valores acima do máximo; tira o limite da tela para provar o do servidor.
    await nav.ev("document.querySelector('[role=dialog] #acompanhantes').removeAttribute('max')");
    await preencherEm("@[role=dialog]", "#acompanhantes", "99");
    await salvarResposta();
    await dormir(1800);
    igual(sql("select acompanhantes from presencas p join usuarios u on u.id=p.usuario_id where u.email='teste-jl@example.invalid'"), "5", "limite de acompanhantes");
    // Recarrega para partir de um estado conhecido, sem depender do que sobrou na tela.
    await abrirResposta();
    await preencherEm("@[role=dialog]", "#acompanhantes", "2");
    await salvarResposta();
    await dormir(1800);
    igual(resposta().split(":").slice(0, 2).join(":"), "vou:2", "vou de novo com 2");
  });
  await passo("participante responsável atualiza o andamento da própria tarefa", async () => {
    await nav.abrir("/tarefas");
    await nav.clicar("Atualizar andamento", { escopo: "Fechar o buffet", seletor: "button" });
    await preencherEm("@[role=dialog]", "select[name=status]", "em_andamento");
    await nav.clicar("Atualizar", { escopo: "@[role=dialog]", seletor: "button" });
    await nav.esperar(`document.querySelector('main')?.innerText.includes('Em andamento')`, 8000);
    await dormir(600);
    igual(sql("select status from tarefas where titulo='Fechar o buffet'"), "em_andamento", "status no banco");
  });
});

await grupo("app", async () => {
  await nav.cookie(lerCookie("cookie-admin.txt"));
  await passo("criar tarefa aparece na lista", async () => {
    await nav.abrir("/tarefas");
    await nav.clicar("Nova tarefa", { seletor: "summary" });
    await nav.preencher("#titulo", "Tarefa E2E");
    await nav.preencher("#descricao", "Criada pelo teste");
    await nav.preencher("#prazo", "2026-12-01");
    await nav.clicar("Criar tarefa", { seletor: "button" });
    await nav.esperarTexto("Tarefa E2E");
    igual(sql("select count(*) from tarefas where titulo='Tarefa E2E'"), "1", "no banco");
  });
  await passo("gerenciar tarefa muda o status e o filtro conta", async () => {
    await nav.clicar("Gerenciar tarefa", { escopo: "Tarefa E2E", seletor: "button" });
    await preencherEm("@[role=dialog]", "select[name=status]", "concluida");
    await nav.clicar("Salvar", { escopo: "@[role=dialog]", seletor: "button", contem: false });
    await dormir(1500);
    igual(sql("select status from tarefas where titulo='Tarefa E2E'"), "concluida", "status no banco");
    await nav.abrir("/tarefas?status=concluida");
    await nav.esperarTexto("Tarefa E2E");
    verdade(!(await nav.tem("Fechar o buffet")), "filtro deveria esconder tarefa não concluída");
  });
  await passo("excluir tarefa", async () => {
    await nav.abrir("/tarefas");
    await excluir("Excluir tarefa", { escopo: "Tarefa E2E" });
    await dormir(1500);
    igual(sql("select count(*) from tarefas where titulo='Tarefa E2E'"), "0", "apagada");
  });
  await passo("salvar voto marca a enquete como respondida", async () => {
    await nav.abrir(`/votacoes/${idPadrao()}`);
    await nav.clicar("Espaço ao Ar Livre / Chácara", { escopo: "Onde vai ser o nosso evento?", seletor: "label" });
    await nav.clicar("Salvar tudo", { seletor: "button" });
    await dormir(1500);
    igual(sql("select o.texto from votos v join opcoes o on o.id=v.opcao_id join usuarios u on u.id=v.usuario_id join enquetes e on e.id=o.enquete_id where u.email='teste-sh@example.invalid' and e.titulo='Onde vai ser o nosso evento?'"), "Espaço ao Ar Livre / Chácara", "voto no banco");
    await nav.esperarTexto("Respondida");
  });
  await passo("catálogo padrão lista o progresso na página de votações", async () => {
    // Conta no banco: o semear.sh já deixa um voto da Maria no catálogo padrão,
    // e o passo anterior responde outra pergunta.
    const [feitas, total] = sql(`select
        (select count(distinct e.id) from votos v join opcoes o on o.id=v.opcao_id join enquetes e on e.id=o.enquete_id
           join categorias ca on ca.id=e.categoria_id
          where ca.catalogo_id='${idPadrao()}' and v.turma_id='${turmaTeste()}'
            and v.usuario_id=(select id from usuarios where email='teste-sh@example.invalid')),
        (select count(*) from enquetes e join categorias ca on ca.id=e.categoria_id where ca.catalogo_id='${idPadrao()}')`).split("|");
    verdade(Number(feitas) >= 2, `a Maria respondeu o voto do semear e o do passo anterior (${feitas})`);
    await nav.abrir("/votacoes");
    await nav.esperarTexto(`${feitas} de ${total} enquetes respondidas`);
  });
  await passo("enviar dúvida e votar nela", async () => {
    await nav.abrir("/duvidas");
    await nav.preencher("#texto-duvida", "Dúvida E2E: tem vaga de estacionamento?");
    await nav.clicar("Enviar dúvida", { seletor: "button" });
    await nav.esperarTexto("Dúvida E2E");
    const idDaDuvida = () => sql("select id from duvidas where conteudo like 'Dúvida E2E%' order by created_at desc limit 1");
    const escopoDuvida = () => `@li[data-duvida='${idDaDuvida()}']`;
    await nav.clicar("Votar nesta dúvida", { escopo: escopoDuvida(), seletor: "button" });
    await dormir(1500);
    igual(sql("select count(*) from duvida_upvotes x join duvidas d on d.id=x.duvida_id where d.conteudo like 'Dúvida E2E%'"), "1", "voto na dúvida");
    await nav.clicar("Remover meu voto", { escopo: escopoDuvida(), seletor: "button" });
    await dormir(1500);
    igual(sql("select count(*) from duvida_upvotes x join duvidas d on d.id=x.duvida_id where d.conteudo like 'Dúvida E2E%'"), "0", "voto removido");
  });
  await passo("filtro Sem resposta lista só as abertas", async () => {
    await nav.abrir("/duvidas?filtro=abertas");
    await nav.esperarTexto("Dúvida E2E");
    verdade(!(await nav.tem("O prazo é dia 20/10")), "resposta apareceu no filtro de abertas");
  });
  await passo("o autor exclui a própria dúvida e o outro membro não pode", async () => {
    await nav.abrir("/duvidas");
    await nav.preencher("#texto-duvida", "Dúvida Excluir E2E: pode repetir o almoço?");
    await nav.clicar("Enviar dúvida", { seletor: "button" });
    await nav.esperarTexto("Dúvida Excluir E2E");
    const id = sql("select id from duvidas where conteudo like 'Dúvida Excluir E2E%'");
    const escopo = `@li[data-duvida='${id}']`;
    // Quem roda aqui é admin (moderação): apaga qualquer dúvida.
    await excluir("Apagar", { escopo });
    await dormir(1800);
    igual(sql("select count(*) from duvidas where conteudo like 'Dúvida Excluir E2E%'"), "0", "excluída");
    await nav.esperarTexto("Dúvida enviada.");
    // A dúvida do participante continua de pé: ninguém além do autor apaga a sua.
    await nav.cookie(lerCookie("cookie-participante.txt"));
    await nav.abrir("/duvidas");
    await nav.esperarTexto("Dúvida E2E");
    verdade(!(await nav.tem("Dúvida Excluir E2E")), "a dúvida excluída voltou");
    await nav.cookie(lerCookie("cookie-admin.txt"));
  });
  await passo("dúvidas paginadas: páginas, filtro mantido e página fora do intervalo", async () => {
    sql(`insert into duvidas (turma_id, autor_id, conteudo)
      select '${turmaTeste()}', u.id, 'Paginação E2E ' || g
        from usuarios u, generate_series(1, 12) g where u.email='teste-jl@example.invalid'`);
    try {
      const itens = () => nav.ev("document.querySelectorAll('ul[data-grupo] > li').length");
      const proximo = () =>
        nav.ev("document.querySelector('nav[aria-label=\"Paginação\"] a[rel=next]')?.getAttribute('href') ?? null");
      await nav.abrir("/duvidas");
      await nav.esperarTexto("Página 1 de 2");
      igual(String(await itens()), "10", "dez dúvidas na página 1");
      igual(await proximo(), "/duvidas?pagina=2", "link da próxima página");
      await nav.abrir("/duvidas?pagina=2");
      await nav.esperarTexto("Página 2 de 2");
      verdade((await itens()) > 0 && (await itens()) < 10, "sobra na página 2");
      verdade((await proximo()) === null, "sem próxima na última página");
      await nav.abrir("/duvidas?filtro=abertas");
      await nav.esperarTexto("Página 1 de 2");
      igual(await proximo(), "/duvidas?filtro=abertas&pagina=2", "o filtro se mantém no link");
      await nav.abrir("/duvidas?pagina=99");
      await nav.esperarTexto("Página 2 de 2");
      await nav.abrir("/duvidas?pagina=abc");
      await nav.esperarTexto("Página 1 de 2");
      await nav.abrir("/duvidas?pagina=2");
      await nav.esperarTexto("Página 2 de 2");
      igual(await proximo(), null, "paginação admin sem próxima na última");
    } finally {
      sql("delete from duvidas where conteudo like 'Paginação E2E%'");
    }
  });
  await passo("adicionar e remover fornecedor", async () => {
    await nav.abrir("/terceiros");
    await nav.clicar("Adicionar fornecedor", { seletor: "summary" });
    await nav.preencher("#nome", "Flores E2E");
    await nav.preencher("#categoria", "Decoração");
    await nav.preencher("#contato", "https://floresE2E.example.com");
    await nav.clicar("Adicionar fornecedor", { seletor: "button" });
    await nav.esperarTexto("Flores E2E");
    igual(sql("select count(*) from fornecedores where nome='Flores E2E'"), "1", "no banco");
    await excluir("Remover", { escopo: "Flores E2E" });
    await dormir(1500);
    igual(sql("select count(*) from fornecedores where nome='Flores E2E'"), "0", "removido");
  });
  await passo("orçamento do fornecedor: status, valor e some para o participante", async () => {
    await nav.abrir("/terceiros");
    await nav.clicar("Adicionar fornecedor", { seletor: "summary" });
    await nav.preencher("#nome", "Espaço Orçamento E2E");
    await nav.preencher("#categoria", "Espaço");
    await nav.clicar("Adicionar fornecedor", { seletor: "button" });
    await nav.esperarTexto("Espaço Orçamento E2E");
    try {
      await nav.clicar("Editar dados", { escopo: "Espaço Orçamento E2E", seletor: "button" });
      await preencherEm("@[role=dialog]", "select[name=status]", "contratado");
      await preencherEm("@[role=dialog]", "input[name=valorOrcado]", "1500,50");
      await nav.clicar("Salvar", { escopo: "@[role=dialog]", seletor: "button" });
      await dormir(1800);
      igual(sql("select status || ':' || valor_orcado from fornecedores where nome='Espaço Orçamento E2E'"), "contratado:1500.50", "salvo no banco");
      await nav.abrir("/terceiros");
      await nav.esperarTexto("Contratado");
      await nav.esperarTexto("1.500,50");
      verdade(await nav.tem("contratado"), "resumo mostra o valor contratado");
      await nav.cookie(lerCookie("cookie-participante.txt"));
      await nav.abrir("/terceiros");
      await nav.esperarTexto("Espaço Orçamento E2E");
      verdade(!(await nav.tem("Orçamento com fornecedores")), "participante não vê o card de orçamento");
      verdade(!(await nav.tem("1.500,50")), "participante não vê o valor");
      verdade(!(await nav.tem("Contratado")), "participante não vê o status");
    } finally {
      await nav.cookie(lerCookie("cookie-admin.txt"));
      sql("delete from fornecedores where nome='Espaço Orçamento E2E'");
    }
  });
  await passo("filtro de categoria em Terceiros", async () => {
    await nav.abrir("/terceiros?categoria=Buffet");
    await nav.esperarTexto("Buffet Sabor & Arte");
    verdade(!(await nav.tem("DJ Marcos Beat")), "outra categoria apareceu");
  });
  await passo("contato vira link de e-mail, telefone e site", async () => {
    await nav.abrir("/terceiros");
    const hrefs = await nav.ev("[...document.querySelectorAll('main a[href^=\"mailto:\"],main a[href^=\"tel:\"],main a[target=_blank]')].map(a => a.getAttribute('href'))");
    verdade(hrefs.some((h) => h.startsWith("mailto:")) && hrefs.some((h) => h.startsWith("tel:")) && hrefs.some((h) => h.startsWith("https://")), `links: ${hrefs}`);
  });
  await passo("mural de avisos: publicar, aparecer no dashboard e ser removido", async () => {
    await nav.abrir("/avisos");
    await nav.preencher("#titulo-aviso", "Aviso E2E");
    await nav.preencher("#conteudo-aviso", "Prazo do pagamento do buffet até dia 20.");
    await nav.clicar("Publicar aviso", { seletor: "button" });
    await nav.esperarTexto("Aviso publicado");
    igual(sql("select count(*) from avisos where titulo='Aviso E2E'"), "1", "no banco");
    await nav.abrir("/dashboard");
    await nav.esperarTexto("Mural da turma");
    await nav.esperarTexto("Aviso E2E");
    await nav.cookie(lerCookie("cookie-participante.txt"));
    await nav.abrir("/avisos");
    await nav.esperarTexto("Aviso E2E");
    verdade(!(await nav.tem("Publicar aviso")), "participante não vê o formulário de publicar");
    verdade(!(await nav.tem("Remover")), "participante não vê o botão de remover");
    await nav.cookie(lerCookie("cookie-admin.txt"));
    await nav.abrir("/avisos");
    await excluir("Remover", { escopo: "Aviso E2E" });
    await dormir(1500);
    igual(sql("select count(*) from avisos where titulo='Aviso E2E'"), "0", "removido");
  });
  await passo("dashboard mostra a contagem regressiva e a programação", async () => {
    await nav.abrir("/dashboard");
    await nav.esperarTexto("Recepção dos convidados");
    await nav.esperarTexto("Chácara Bela Vista, Recife");
    const partes = await nav.ev("[...document.querySelectorAll('main p.vitrine-texto-gradiente')].map(p => p.textContent)");
    igual(partes.length, 3, "três blocos de contagem (sem segundos)");
  });
});

await grupo("admin", async () => {
  await nav.cookie(lerCookie("cookie-admin.txt"));
  await passo("copiar código de convite e a mensagem", async () => {
    await nav.abrir("/admin/membros");
    await nav.cdp("Emulation.setFocusEmulationEnabled", { enabled: true });
    await nav.clicar("Copiar código", { seletor: "button" });
    await nav.esperarTexto("Copiado!");
    await nav.clicar("Copiar mensagem de convite", { seletor: "button" });
    await nav.esperarTexto("Copiado!");
  });
  await passo("gerar novo código troca o código", async () => {
    const antes = sql(`select codigo_convite from turmas where id='${turmaTeste()}'`);
    await nav.clicar("Gerar novo código", { seletor: "button" });
    await nav.clicar("Gerar novo código", { escopo: "@[role=dialog]", seletor: "button" });
    await dormir(1800);
    const depois = sql(`select codigo_convite from turmas where id='${turmaTeste()}'`);
    verdade(depois !== antes, "o código não mudou");
    sql("update turmas set codigo_convite='TESTESH0001' where id='" + turmaTeste() + "'");
  });
  await passo("minha conta: o único administrador de uma turma com membros não pode excluir", async () => {
    // Maria é master nesta execução (e master não exclui a conta), então a checagem usa o João.
    sql(`insert into turmas (nome,codigo_convite,criado_por)
      select 'Bloqueio E2E','TESTEBLQ001',u.id from usuarios u where u.email='teste-jl@example.invalid'
      on conflict do nothing`);
    sql(`insert into membros (turma_id,usuario_id,papel)
      select t.id,u.id,case when u.email='teste-jl@example.invalid' then 'admin' else 'participante' end
        from turmas t, usuarios u
       where t.codigo_convite='TESTEBLQ001' and u.email in ('teste-jl@example.invalid','teste-sh@example.invalid')
      on conflict do nothing`);
    try {
      await nav.cookie(lerCookie("cookie-participante.txt"));
      await nav.abrir("/conta");
      await nav.esperarTexto("único administrador de “Bloqueio E2E”");
      verdade(!(await nav.ev("!!document.querySelector('#confirmacao')")), "campo de confirmação não deveria existir");
    } finally {
      await nav.cookie(lerCookie("cookie-admin.txt"));
      sql("delete from turmas where codigo_convite='TESTEBLQ001'");
    }
  });
  await passo("minha conta: o master não exclui a própria conta (só roda com ADMIN_MASTER_EMAILS incluindo a conta de teste)", async () => {
    await nav.abrir("/master");
    if (!(await nav.tem("Gestão da plataforma"))) return; // conta de teste não é master nesta subida do servidor
    await nav.abrir("/conta");
    await nav.esperarTexto("Contas de administrador master não podem ser excluídas por aqui");
    verdade(!(await nav.ev("!!document.querySelector('#confirmacao')")), "campo de confirmação não deveria existir");
  });
  await passo("promover e rebaixar um membro", async () => {
    await nav.abrir("/admin/membros");
    await nav.clicar("Promover", { escopo: "João Lima", seletor: "button" });
    await nav.clicar("Trocar papel", { escopo: "@[role=dialog]", seletor: "button" });
    await dormir(1800);
    igual(sql("select papel from membros m join usuarios u on u.id=m.usuario_id where u.email='teste-jl@example.invalid'"), "admin", "promovido");
    await nav.abrir("/admin/membros");
    await nav.clicar("Tornar participante", { escopo: "João Lima", seletor: "button" });
    await nav.clicar("Trocar papel", { escopo: "@[role=dialog]", seletor: "button" });
    await dormir(1800);
    igual(sql("select papel from membros m join usuarios u on u.id=m.usuario_id where u.email='teste-jl@example.invalid'"), "participante", "rebaixado");
  });
  await passo("o último administrador não tem botão de rebaixar nem de remover", async () => {
    await nav.abrir("/admin/membros");
    const botoes = await nav.ev("[...document.querySelectorAll('li')].find(li => li.textContent.includes('Maria Souza'))?.innerText");
    verdade(!botoes.includes("Remover") && !botoes.includes("Tornar participante"), botoes);
  });
  await passo("salvar dados do evento", async () => {
    await nav.abrir("/dashboard");
    await abrirDadosDoEvento();
    await nav.preencher("#localEvento", "Salão Novo E2E");
    await nav.clicar("Salvar", { seletor: "button", contem: false });
    await nav.esperarTexto("Salvo").catch(() => {});
    await dormir(1500);
    igual(sql(`select local_evento from turmas where id='${turmaTeste()}'`), "Salão Novo E2E", "local no banco");
  });
  await passo("detalhes do evento: descrição, endereço, mapa e traje aparecem no dashboard", async () => {
    await nav.abrir("/dashboard");
    await abrirDadosDoEvento();
    await nav.preencher("#descricao", "Descrição E2E da festa");
    await nav.preencher("#endereco", "Rua E2E, 100 - Recife");
    await nav.preencher("#traje", "Gala E2E");
    await nav.preencher("#observacoesLocal", "Estacionamento E2E na portaria");
    await nav.preencher("#linkMapa", "http://inseguro.example.com/mapa");
    await nav.clicar("Salvar", { seletor: "button", contem: false });
    await nav.esperarTexto("precisa começar com https://");
    igual(sql(`select coalesce(descricao,'') from turmas where id='${turmaTeste()}'`), "", "nada salvo com link inseguro");
    await nav.preencher("#linkMapa", "https://maps.example.com/mapa-e2e");
    await nav.clicar("Salvar", { seletor: "button", contem: false });
    await nav.esperarTexto("Dados do evento salvos");
    await nav.abrir("/dashboard");
    await nav.esperarTexto("Descrição E2E da festa");
    await nav.esperarTexto("Rua E2E, 100 - Recife");
    await nav.esperarTexto("Gala E2E");
    await nav.esperarTexto("Estacionamento E2E na portaria");
    igual(
      await nav.ev("[...document.querySelectorAll('a')].find((a) => a.textContent.includes('Como chegar'))?.getAttribute('href')"),
      "https://maps.example.com/mapa-e2e",
      "botão Como chegar",
    );
    // Término antes do início é recusado.
    await nav.abrir("/dashboard");
    await abrirDadosDoEvento();
    await nav.preencher("#dataEvento", "2030-05-10T20:00");
    await nav.preencher("#dataFimEvento", "2030-05-10T19:00");
    await nav.clicar("Salvar", { seletor: "button", contem: false });
    await nav.esperarTexto("O término precisa ser depois do início");
    // Limpa os campos de teste para os passos seguintes.
    await nav.abrir("/dashboard");
    await abrirDadosDoEvento();
    for (const id of ["#descricao", "#endereco", "#traje", "#observacoesLocal", "#linkMapa", "#dataFimEvento"]) {
      await nav.preencher(id, "");
    }
    await nav.clicar("Salvar", { seletor: "button", contem: false });
    await nav.esperarTexto("Dados do evento salvos");
    await nav.abrir("/dashboard");
    verdade(!(await nav.tem("Descrição E2E da festa")), "descrição removida");
  });
  await passo("adicionar e remover item da programação", async () => {
    await nav.abrir("/dashboard");
    await nav.clicar("Adicionar item", { seletor: "summary" });
    await nav.preencher("#horario", "2026-12-05T20:00");
    await nav.preencher("#titulo", "Item E2E");
    await nav.clicar("Adicionar", { seletor: "button", contem: false });
    await nav.esperarTexto("Item E2E");
    igual(sql("select count(*) from programacao where titulo='Item E2E'"), "1", "no banco");
    await excluir("Remover", { escopo: "Item E2E" });
    await dormir(1800);
    igual(sql("select count(*) from programacao where titulo='Item E2E'"), "0", "removido");
  });
  await passo("editar item da programação em diálogo", async () => {
    await nav.abrir("/dashboard");
    await nav.clicar("Adicionar item", { seletor: "summary" });
    await nav.preencher("#horario", "2026-12-05T21:00");
    await nav.preencher("#titulo", "Item E2E Editar");
    await nav.clicar("Adicionar", { seletor: "button", contem: false });
    await nav.esperarTexto("Item E2E Editar");
    await nav.clicar("Editar", { escopo: "Item E2E Editar", seletor: "button" });
    await nav.esperarTexto("Editar item");
    igual(
      await nav.ev("document.querySelector('[role=dialog] [name=titulo]')?.value"),
      "Item E2E Editar",
      "diálogo abre preenchido com o item atual",
    );
    igual(
      await nav.ev("document.activeElement?.getAttribute('name')"),
      "horario",
      "foco entra no primeiro campo",
    );
    await nav.preencher("[role=dialog] [name=titulo]", "Item E2E Editado");
    // Sem escopo, o primeiro "Salvar" do documento é o do formulário do evento,
    // que.reporta largura mesmo dentro do <details> recolhido, e o diálogo
    // ficaria aberto sem salvar.
    await nav.clicar("Salvar", { escopo: "@[role=dialog]", seletor: "button", contem: false });
    await dormir(1800);
    verdade(!(await nav.ev("!!document.querySelector('[role=dialog]')")), "diálogo fecha ao salvar");
    igual(sql("select count(*) from programacao where titulo='Item E2E Editado'"), "1", "no banco");
    await excluir("Remover", { escopo: "Item E2E Editado" });
    await dormir(1800);
    igual(sql("select count(*) from programacao where titulo like 'Item E2E%'"), "0", "removido");
  });
  await passo("moderação: responder, destacar, reabrir e apagar dúvida", async () => {
    await nav.abrir("/duvidas");
    await nav.clicar("Responder", { escopo: "Posso levar acompanhante", seletor: "button" });
    await preencherEm("@[role=dialog]", "textarea", "Sim, até 2 pessoas.");
    await nav.clicar("Salvar resposta", { escopo: "@[role=dialog]", seletor: "button" });
    await dormir(1800);
    igual(sql("select respondida from duvidas where conteudo like 'Posso levar%'"), "t", "respondida");
    await nav.abrir("/duvidas");
    await nav.clicar("Destacar", { escopo: "Posso levar acompanhante", seletor: "button", contem: true });
    await nav.clicar("Destacar", { escopo: "@[role=dialog]", seletor: "button", contem: false });
    await dormir(1800);
    igual(sql("select destaque from duvidas where conteudo like 'Posso levar%'"), "t", "destaque");
    await nav.abrir("/duvidas");
    await nav.clicar("Reabrir", { escopo: "Posso levar acompanhante", seletor: "button" });
    await nav.clicar("Reabrir", { escopo: "@[role=dialog]", seletor: "button", contem: false });
    await dormir(1800);
    igual(sql("select respondida from duvidas where conteudo like 'Posso levar%'"), "f", "reaberta");
    await nav.abrir("/duvidas");
    await excluir("Apagar", { escopo: "Posso levar acompanhante" });
    await dormir(1800);
    igual(sql("select count(*) from duvidas where conteudo like 'Posso levar%'"), "0", "apagada");
  });
  await passo("catálogo personalizado: criar, renomear, categoria, pergunta", async () => {
    await nav.abrir("/admin/votacoes/nova");
    await nav.preencher("#nome", "Catálogo E2E");
    await nav.clicar("Criar catálogo", { seletor: "button" });
    await nav.esperarUrl("/admin/votacoes/");
    await nav.assentar();
    await nav.esperarTexto("Catálogo E2E");
    // Renomear é no lugar: abre o input ao lado do nome, salva sem diálogo.
    await nav.clicar("Renomear o catálogo", { seletor: "button" });
    await nav.preencher("input[aria-label='Nome novo do catálogo']", "Catálogo E2E Renomeado");
    await nav.clicar("Salvar novo nome", { seletor: "button" });
    await dormir(1800);
    igual(sql("select count(*) from catalogos where nome='Catálogo E2E Renomeado'"), "1", "renomeado");
    await nav.preencher("#nome-categoria", "Categoria E2E");
    await nav.clicar("Adicionar categoria", { seletor: "button" });
    // A pergunta é criada de dentro da categoria: sem seletor, porque o botão
    // já sabe a que categoria pertence.
    await abrirFormularioDePergunta("Categoria E2E");
    verdade(
      !(await nav.ev("!!document.querySelector('[role=dialog] select[name=categoriaId]')")),
      "sem seletor de categoria: o botão já diz em qual é",
    );
    igual(
      await nav.ev("document.querySelector('[role=dialog] input[name=categoriaId]')?.value"),
      sql("select id from categorias where nome='Categoria E2E'"),
      "categoria fixa é a da seção",
    );
    await preencherEm("@[role=dialog]", "input[name=titulo]", "Qual cor da decoração?");
    await preencherOpcoes(["Azul", "Rosa", "Dourado"]);
    await nav.clicar("Adicionar pergunta", { escopo: "@[role=dialog]", seletor: "button", contem: false });
    await dormir(1800);
    igual(sql("select count(*) from opcoes o join enquetes e on e.id=o.enquete_id where e.titulo='Qual cor da decoração?'"), "3", "três opções");
    igual(
      sql("select k.nome from categorias k join enquetes e on e.categoria_id=k.id where e.titulo='Qual cor da decoração?'"),
      "Categoria E2E",
      "a pergunta foi para a categoria do botão",
    );
    // Duas categorias: cada uma tem o seu botão, e a pergunta vai para a escolhida.
    await nav.preencher("#nome-categoria", "Outra E2E");
    await nav.clicar("Adicionar categoria", { seletor: "button" });
    await dormir(2000);
    await abrirFormularioDePergunta("Outra E2E");
    await preencherEm("@[role=dialog]", "input[name=titulo]", "Qual a música da abertura?");
    await preencherOpcoes(["Samba", "Axé"]);
    await nav.clicar("Adicionar pergunta", { escopo: "@[role=dialog]", seletor: "button", contem: false });
    await dormir(1800);
    igual(
      sql("select k.nome from categorias k join enquetes e on e.categoria_id=k.id where e.titulo='Qual a música da abertura?'"),
      "Outra E2E",
      "a pergunta foi para a categoria escolhida, não para a primeira",
    );
    igual(
      sql("select count(*) from enquetes e join categorias k on k.id=e.categoria_id where k.nome='Categoria E2E' and e.titulo='Qual a música da abertura?'"),
      "0",
      "nada foi parar na primeira categoria",
    );
  });
  await passo("reordenar: categoria e pergunta trocam de lugar", async () => {
    const cat = sql("select id from catalogos where nome='Catálogo E2E Renomeado'");
    const ordem = () =>
      sql(`select string_agg(k.nome, ' > ' order by k.ordem) from categorias k where k.catalogo_id='${cat}'`);
    igual(await ordem(), "Categoria E2E > Outra E2E", "ordem inicial");
    // A primeira categoria não tem "Subir": o botão some na ponta da lista.
    verdade(
      !(await nav.ev("!![...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Subir') && [...document.querySelectorAll('section')].find(s => s.querySelector('h2')?.textContent.includes('Categoria E2E') && [...s.querySelectorAll('button')].some(b => b.getAttribute('aria-label') === 'Subir a categoria Categoria E2E'))")),
      "a primeira categoria não pode subir",
    );
    await nav.clicar("Descer a categoria Categoria E2E", { seletor: "button" });
    await dormir(1800);
    igual(await ordem(), "Outra E2E > Categoria E2E", "categorias trocaram de lugar");
    await nav.clicar("Descer a categoria Outra E2E", { seletor: "button" });
    await dormir(1800);
    igual(await ordem(), "Categoria E2E > Outra E2E", "voltou ao lugar de origem");

    const perguntas = () =>
      sql(`select string_agg(e.titulo, ' > ' order by e.ordem) from enquetes e
             join categorias k on k.id = e.categoria_id where k.nome = 'Outra E2E'`);
    igual(await perguntas(), "Qual a música da abertura?", "uma pergunta só, sem para onde descer");
    verdade(
      !(await nav.ev("!![...document.querySelectorAll('button')].find(b => b.getAttribute('aria-label') === 'Descer a pergunta Qual a música da abertura?')")),
      "a única pergunta da categoria não tem botão de descer",
    );
    await abrirFormularioDePergunta("Outra E2E");
    await preencherEm("@[role=dialog]", "input[name=titulo]", "Segunda pergunta E2E");
    await preencherOpcoes(["Samba", "Axé"]);
    await nav.clicar("Adicionar pergunta", { escopo: "@[role=dialog]", seletor: "button", contem: false });
    await dormir(1800);
    igual(await perguntas(), "Qual a música da abertura? > Segunda pergunta E2E", "pergunta nova vai para o fim");
    await nav.clicar("Subir a pergunta Segunda pergunta E2E", { seletor: "button" });
    await dormir(1800);
    igual(await perguntas(), "Segunda pergunta E2E > Qual a música da abertura?", "perguntas trocaram de lugar");
  });
  await passo("fase E: título repetido, foco na pergunta nova, preview e ações compactas", async () => {
    const cat = sql("select id from catalogos where nome='Catálogo E2E Renomeado'");
    await nav.abrir(`/admin/votacoes/${cat}`);

    // Título repetido: "cATEGORIA e2e" é a mesma categoria que já existe, com
    // outra caixa e espaço sobrando. Comparar só com `=` deixaria passar.
    await nav.preencher("#nome-categoria", "  CATEGORIA e2e  ");
    await nav.clicar("Adicionar categoria", { seletor: "form button[type=submit]" });
    await dormir(1500);
    verdade(
      (await nav.texto()).includes("Já existe uma categoria chamada"),
      "a categoria repetida é recusada com aviso",
    );
    igual(
      sql(`select count(*) from categorias where catalogo_id='${cat}'`),
      "2",
      "nenhuma categoria duplicada foi criada",
    );

    // Renomear para o nome de outra também é recusado, e a categoria mantém o
    // nome antigo. Sem escopo por texto aqui: com o campo aberto o nome vira
    // `value` do input e some do texto do cartão, então o escopo não acha.
    await nav.clicar("Renomear a categoria Outra E2E", { seletor: "button" });
    await nav.esperar("!!document.querySelector('input[name=nome]')", 10000, "campo de renomear");
    await nav.preencher("input[name=nome]", "categoria E2E");
    await nav.clicar("Salvar novo nome", { seletor: "button" });
    await dormir(1500);
    verdade(
      (await nav.texto()).includes("Já existe uma categoria chamada"),
      "renomear para um nome em uso é recusado",
    );
    igual(sql("select nome from categorias where nome='Outra E2E'"), "Outra E2E", "o nome antigo continua");
    // O campo continua aberto depois do erro (a pessoa precisa corrigir), mas
    // com ele aberto o nome da categoria sai do texto do h2. Fecha com o X.
    await nav.clicar("Cancelar renomeação", { seletor: "button" });
    await dormir(800);

    // Pergunta repetida dentro da mesma categoria. "segunda PERGUNTA e2e" é a que
    // já existe em "Outra E2E".
    await abrirFormularioDePergunta("Outra E2E");
    await preencherEm("@[role=dialog]", "input[name=titulo]", "segunda PERGUNTA e2e");
    await preencherOpcoes(["Samba", "Axé"]);
    await nav.clicar("Adicionar pergunta", { escopo: "@[role=dialog]", seletor: "button", contem: false });
    await dormir(1500);
    verdade(
      (await nav.texto()).includes("Já existe uma pergunta com esse texto"),
      "a pergunta repetida é recusada com aviso",
    );
    igual(
      sql("select count(*) from enquetes where titulo ilike 'segunda pergunta e2e'"),
      "1",
      "nenhuma pergunta duplicada foi criada",
    );

    // Agora um título novo: a pergunta entra, a rolagem vai até ela e o foco
    // fica nela — quem usa teclado segue de onde parou.
    await preencherEm("@[role=dialog]", "input[name=titulo]", "Pergunta com foco E2E");
    await nav.clicar("Adicionar pergunta", { escopo: "@[role=dialog]", seletor: "button", contem: false });
    // A rolagem e o foco dependem da revalidação da página, então se espera a
    // condição em vez de dormir um tempo chutado.
    await nav.esperar(
      "!document.querySelector('[role=dialog][data-state=open]')",
      15000,
      "o diálogo fecha depois de criar",
    );
    await nav.esperar(
      "!!document.activeElement?.closest('li[id^=enq-]')?.textContent.includes('Pergunta com foco E2E')",
      15000,
      "o foco vai para a pergunta que acabou de ser criada",
    );
    // A rolagem é suave: esperar terminar a animação em vez de medir o quadro
    // imediatamente após o foco.
    try {
      await nav.esperar(
        "(() => { const li = document.activeElement?.closest('li[id^=enq-]'); if (!li) return false; const r = li.getBoundingClientRect(); return r.top > 0 && r.bottom < window.innerHeight; })()",
        10000,
        "a pergunta nova fica à vista, sem precisar rolar",
      );
    } catch (e) {
      const onde = await nav.ev(
        "(() => { const li = document.activeElement?.closest('li[id^=enq-]'); const r = li?.getBoundingClientRect(); return JSON.stringify({ foco: document.activeElement?.tagName, top: r?.top, bottom: r?.bottom, altura: innerHeight, scrollY }); })()",
      );
      throw new Error(`${e.message} ${onde}`);
    }

    // Preview: a mesma pergunta montada como na tela de votação, com os
    // controles desligados.
    await nav.clicar("Ver como o formando vê", {
      escopo: "Pergunta com foco E2E",
      seletor: "button",
    });
    await nav.esperar("!!document.querySelector('[role=dialog]')", 10000, "diálogo da prévia");
    igual(
      await nav.ev("[...document.querySelectorAll('[role=dialog] label')].map(l => l.textContent.trim()).join('|')"),
      "Samba|Axé",
      "a prévia mostra as opções da pergunta",
    );
    igual(
      await nav.ev("[...document.querySelectorAll('[role=dialog] input')].every(i => i.disabled)"),
      true,
      "nada na prévia responde, os controles estão desligados",
    );
    await nav.clicar("Fechar", { seletor: "button" });
    await dormir(1000);

    // A exclusão é só o ícone: o texto vermelho repetido era o que mais pesava.
    // O nome do botão continua exposto para o leitor de tela.
    const exclusao = await nav.ev(`(() => {
      const b = [...document.querySelectorAll('button')].find(b => b.getAttribute('aria-label') === 'Excluir a pergunta Pergunta com foco E2E');
      return b ? { largura: Math.round(b.getBoundingClientRect().width), rotulo: b.getAttribute('aria-label') } : null;
    })()`);
    verdade(!!exclusao, "o botão de excluir continua presente");
    verdade(exclusao.largura < 60, `o botão de excluir é só o ícone (largura ${exclusao.largura})`);
    igual(exclusao.rotulo, "Excluir a pergunta Pergunta com foco E2E", "o leitor de tela ouve qual pergunta será apagada");
  });
  await passo("ver quem votou em uma pergunta", async () => {
    await nav.abrir(`/admin/votacoes/${idPadrao()}`);
    await nav.clicar("Ver quem votou", { seletor: "a" });
    await nav.esperarUrl("/admin/votacoes/votos/");
    await nav.esperarTexto("Ainda não votaram");
    await nav.esperarTexto("Participação nesta pergunta");
  });
  const enqueteLocal = () => sql("select id from enquetes where titulo='Onde vai ser o nosso evento?'");
  await passo("decisão da turma: fixar, aparecer no dashboard, encerrar a votação e reabrir", async () => {
    // A Chácara precisa ser a mais votada para o Rooftop (sem votos) fugir da
    // regra. O grupo "app" já deixa o voto da Maria nela; rodando só o
    // "admin", o voto entra aqui.
    if (sql(`select count(*) from votos v join opcoes o on o.id=v.opcao_id where o.enquete_id='${enqueteLocal()}' and v.turma_id='${turmaTeste()}'`) === "0") {
      sql(`insert into votos (turma_id,opcao_id,usuario_id)
        select '${turmaTeste()}', o.id, u.id from opcoes o, usuarios u
         where o.enquete_id='${enqueteLocal()}' and o.texto='Espaço ao Ar Livre / Chácara' and u.email='teste-sh@example.invalid'`);
    }
    await nav.abrir(`/admin/votacoes/votos/${enqueteLocal()}`);
    await nav.esperarTexto("Decisão da turma");
    await nav.clicar("Fixar decisão", { seletor: "button" });
    await nav.clicar("Rooftop Urbano", { escopo: "@[role=dialog]", seletor: "label" });
    // ADR-0003: fora da regra (não é a mais votada) a justificativa é obrigatória.
    await nav.esperarTexto("Esta decisão foge da regra combinada.");
    await nav.preencher("#justificativa", "A chácara mais votada não tem a data livre.");
    await nav.clicar("Fixar decisão", { escopo: "@[role=dialog]", seletor: "button" });
    await nav.esperarTexto("Decisão fixada");
    igual(sql(`select o.texto from decisoes d join opcoes o on o.id=d.opcao_id where d.turma_id='${turmaTeste()}' and d.enquete_id='${enqueteLocal()}'`), "Rooftop Urbano", "decisão no banco");
    igual(sql(`select justificativa from decisoes where turma_id='${turmaTeste()}' and enquete_id='${enqueteLocal()}'`), "A chácara mais votada não tem a data livre.", "justificativa no banco");
    await nav.abrir("/dashboard");
    await nav.esperarTexto("Decisões da turma");
    await nav.esperarTexto("Rooftop Urbano");
    await nav.esperarTexto("Fora da regra");
    await nav.esperarTexto("Ver histórico das decisões");
    await nav.abrir(`/votacoes/${idPadrao()}`);
    await nav.esperarTexto("Escolha da turma");
    igual(await nav.ev("[...document.querySelectorAll('label')].find((l) => l.textContent.includes('Escolha da turma')).querySelector('input').matches(':disabled')"), true, "opções desativadas");
    await nav.abrir(`/admin/votacoes/votos/${enqueteLocal()}`);
    await nav.clicar("Reabrir votação", { seletor: "button" });
    await nav.clicar("Reabrir votação", { escopo: "@[role=dialog]", seletor: "button" });
    await dormir(1800);
    igual(sql(`select count(*) from decisoes where turma_id='${turmaTeste()}'`), "0", "votação reaberta");
    // Reabrir não apaga o rastro: fixar e reabrir ficam na auditoria (ADR-0003).
    igual(sql(`select string_agg(acao, ',' order by id) from auditoria where turma_id='${turmaTeste()}' and acao like 'decisao.%'`), "decisao.fixada,decisao.reaberta", "histórico da decisão");
  });
  await passo("decisão fixada por outra aba: o servidor recusa o voto de quem tem a página antiga", async () => {
    sql(`delete from decisoes where turma_id='${turmaTeste()}'`);
    await nav.abrir(`/votacoes/${idPadrao()}`);
    await nav.esperarTexto("Onde vai ser o nosso evento?");
    const antes = sql("select o.texto from votos v join opcoes o on o.id=v.opcao_id join usuarios u on u.id=v.usuario_id join enquetes e on e.id=o.enquete_id where u.email='teste-sh@example.invalid' and e.titulo='Onde vai ser o nosso evento?'");
    sql(`insert into decisoes (turma_id,enquete_id,opcao_id)
      select '${turmaTeste()}', e.id, o.id from enquetes e join opcoes o on o.enquete_id=e.id
       where e.titulo='Onde vai ser o nosso evento?' and o.texto='Rooftop Urbano'`);
    try {
      await nav.clicar("Rooftop Urbano", { escopo: "Onde vai ser o nosso evento?", seletor: "label" });
      await nav.clicar("Salvar tudo", { seletor: "button" });
      await nav.esperarTexto("já decidiu");
      igual(sql("select o.texto from votos v join opcoes o on o.id=v.opcao_id join usuarios u on u.id=v.usuario_id join enquetes e on e.id=o.enquete_id where u.email='teste-sh@example.invalid' and e.titulo='Onde vai ser o nosso evento?'"), antes, "o voto não mudou");
    } finally {
      sql(`delete from decisoes where turma_id='${turmaTeste()}'`);
    }
  });
  await passo("ADR-0003: regra da pergunta, prazo vencido e valor por pessoa", async () => {
    const enq = enqueteLocal();
    const turma = turmaTeste();
    try {
      // Comissão salva prazo e quórum pelo diálogo; a mudança vai para a auditoria.
      await nav.abrir(`/admin/votacoes/${idPadrao()}`);
      await nav.esperarTexto("Onde vai ser o nosso evento?");
      await nav.clicar("Prazo e quórum", { escopo: `@#enq-${enq}`, seletor: "button" });
      await nav.preencher(`#prazo-${enq}`, "2099-12-12T23:59");
      await nav.preencher(`#quorum-${enq}`, "90");
      await nav.clicar("Salvar regra", { escopo: "@[role=dialog]", seletor: "button" });
      await nav.esperarTexto("Regra salva");
      igual(sql(`select quorum_pct from regras_enquete where turma_id='${turma}' and enquete_id='${enq}'`), "90", "quórum no banco");
      igual(sql(`select count(*) from auditoria where turma_id='${turma}' and acao='regra.alterada'`), "1", "regra no histórico");
      await nav.abrir(`/votacoes/${idPadrao()}`);
      await nav.esperarTexto("precisa de 90% da turma");

      // Prazo vencido: a pergunta aparece encerrada e as opções ficam travadas.
      sql(`update regras_enquete set prazo = now() - interval '1 hour' where turma_id='${turma}' and enquete_id='${enq}'`);
      await nav.abrir(`/votacoes/${idPadrao()}`);
      await nav.esperarTexto("O prazo terminou");
      igual(
        await nav.ev("[...document.querySelectorAll('fieldset')].find((f) => f.textContent.includes('Onde vai ser o nosso evento?')).querySelector('input').matches(':disabled')"),
        true,
        "opções travadas depois do prazo",
      );

      // Valor por pessoa numa pergunta do catálogo da turma aparece no voto.
      const cat = sql("select id from catalogos where nome='Catálogo E2E Renomeado'");
      const opcao = sql(`select o.id from opcoes o join enquetes e on e.id=o.enquete_id join categorias ca on ca.id=e.categoria_id where ca.catalogo_id='${cat}' order by e.ordem, o.ordem limit 1`);
      sql(`update opcoes set valor_pessoa = 95, link = 'https://buffet.example.com/menu' where id='${opcao}'`);
      await nav.abrir(`/votacoes/${cat}`);
      await nav.esperarTexto("95,00 por pessoa");
      await nav.esperarTexto("ver detalhes");

      // Mudar o valor depois que já tem voto vai para o histórico da turma.
      const enqCat = sql(`select enquete_id from opcoes where id='${opcao}'`);
      sql(`insert into votos (turma_id,opcao_id,usuario_id) select '${turma}', '${opcao}', id from usuarios where email='teste-jl@example.invalid' on conflict do nothing`);
      await nav.abrir(`/admin/votacoes/${cat}`);
      await nav.clicar("Editar pergunta", { escopo: `@#enq-${enqCat}`, seletor: "button" });
      await nav.esperar(`!!document.querySelector("[role=dialog] [name='valor-${opcao}']")`, 10000, "campo de valor");
      await nav.preencher(`[role=dialog] [name='valor-${opcao}']`, "110");
      await nav.clicar("Salvar", { escopo: "@[role=dialog]", seletor: "button[type=submit]" });
      await dormir(2000);
      igual(sql(`select valor_pessoa from opcoes where id='${opcao}'`), "110.00", "valor novo no banco");
      igual(
        sql(`select detalhe->>'antes' || '>' || (detalhe->>'depois') from auditoria where turma_id='${turma}' and acao='opcao.valor_alterado'`),
        "95>110",
        "mudança de valor no histórico",
      );

      // Diálogo de fixar: empate na escolha única e a regra combinada aparecem antes de confirmar.
      sql(`update regras_enquete set prazo = null, quorum_pct = 90 where turma_id='${turma}' and enquete_id='${enq}'`);
      // Empate: um voto de cada pessoa de teste, em opções diferentes.
      sql(`delete from votos where turma_id='${turma}' and opcao_id in (select id from opcoes where enquete_id='${enq}')`);
      for (const [email, posicao] of [["teste-sh@example.invalid", 0], ["teste-jl@example.invalid", 1]]) {
        sql(`insert into votos (turma_id,opcao_id,usuario_id)
          select '${turma}', (select id from opcoes where enquete_id='${enq}' order by ordem offset ${posicao} limit 1), id
            from usuarios where email='${email}'`);
      }
      await nav.abrir(`/admin/votacoes/votos/${enq}`);
      await nav.clicar("Fixar decisão", { seletor: "button" });
      await nav.esperarTexto("Esta decisão foge da regra combinada.");
      await nav.esperarTexto("empatada com outra");
      // Turma de teste tem 2 membros e os 2 votaram: quórum atingido. O caso
      // "sem quórum" fica no teste de avaliarDecisao (decisao-regras.test.ts).
      await nav.esperarTexto("Votaram 2 de 2 · quórum combinado: 90%");
    } finally {
      sql(`delete from regras_enquete where turma_id='${turma}'`);
      sql(`delete from votos where turma_id='${turma}' and opcao_id in (select id from opcoes where enquete_id='${enq}')`);
    }
  });
  await passo("ADR-0004: mandar para o grupo mostra o texto pronto da pergunta e do aviso", async () => {
    const enq = enqueteLocal();
    const textoDoDialogo = () => nav.ev("document.querySelector('[role=dialog] #texto-grupo')?.value ?? ''");
    await nav.abrir(`/admin/votacoes/${idPadrao()}`);
    await nav.esperarTexto("Onde vai ser o nosso evento?");
    await nav.clicar("Mandar para o grupo", { escopo: `@#enq-${enq}`, seletor: "button" });
    await nav.esperar("!!document.querySelector('[role=dialog] #texto-grupo')", 10000, "prévia do texto");
    const texto = await textoDoDialogo();
    verdade(texto.startsWith("*Votação: Onde vai ser o nosso evento?*"), `primeira linha da votação: ${texto.split("\n")[0]}`);
    verdade(texto.includes(`/votacoes/${idPadrao()}#enquete-${enq}`), "link direto para a pergunta");
    verdade(/Já votaram \d+ de \d+\.|Ninguém votou ainda\./.test(texto), "contagem de votos");
    verdade(!texto.includes("Maria") && !texto.includes("João"), "nenhum nome de membro no texto");
    const link = await nav.ev("document.querySelector('[role=dialog] a[href^=\"https://wa.me/\"]')?.getAttribute('href') ?? ''");
    verdade(link.startsWith("https://wa.me/?text=%2AVota") || link.startsWith("https://wa.me/?text=*Vota"), `link do WhatsApp: ${link.slice(0, 40)}`);

    // Aviso: título, recado e link para /avisos.
    sql(`insert into avisos (turma_id, autor_id, titulo, conteudo)
      select '${turmaTeste()}', id, 'Reunião ADR-0004', 'Sexta às 19h na sala 3.' from usuarios where email='teste-sh@example.invalid'`);
    try {
      await nav.abrir("/avisos");
      await nav.esperarTexto("Reunião ADR-0004");
      await nav.clicar("Mandar para o grupo", { escopo: "Reunião ADR-0004", seletor: "button" });
      await nav.esperar("!!document.querySelector('[role=dialog] #texto-grupo')", 10000, "prévia do aviso");
      const aviso = await textoDoDialogo();
      verdade(aviso.startsWith("*Aviso da comissão: Reunião ADR-0004*\nSexta às 19h na sala 3."), `texto do aviso: ${aviso.slice(0, 60)}`);
      verdade(aviso.trimEnd().endsWith("/avisos"), "link para os avisos");
    } finally {
      sql("delete from avisos where titulo='Reunião ADR-0004'");
    }
  });
  await passo("ADR-0005: tesouraria monta o plano, lança e o formando vê a própria situação", async () => {
    const turma = turmaTeste();
    try {
      // Sem marcação, a tesouraria não aparece nem para admin.
      await nav.abrir("/admin/tesouraria");
      await nav.esperar("location.pathname !== '/admin/tesouraria' && document.readyState === 'complete'", 15000, "admin sem tesouraria não entra");

      // Busca pelo email: com 10 por página, o card dela pode não estar na primeira.
      await nav.abrir("/admin/membros?busca=teste-sh%40");
      await nav.esperarTexto("Maria Souza");
      // Mira pelo email, que só existe no card dela, e espera o botão aparecer.
      try {
        await nav.esperar(
          "[...document.querySelectorAll('li')].some((li) => li.textContent.includes('teste-sh@example.invalid') && li.textContent.includes('Pôr na tesouraria'))",
          15000,
          "botão de tesouraria no card da Maria",
        );
      } catch (e) {
        const card = await nav.ev(
          "[...document.querySelectorAll('li')].find((li) => li.textContent.includes('teste-sh@example.invalid'))?.innerText.replace(/\\s+/g, ' ').slice(0, 300) ?? 'sem card'",
        );
        throw new Error(`${e.message} (tesouraria no banco: ${sql(`select tesouraria from membros m join usuarios u on u.id=m.usuario_id where u.email='teste-sh@example.invalid' and m.turma_id='${turma}'`)}; card: ${card})`);
      }
      await nav.clicar("Pôr na tesouraria", { escopo: "teste-sh@example.invalid", seletor: "button" });
      await nav.esperarTexto("Tirar da tesouraria");
      igual(sql(`select tesouraria from membros m join usuarios u on u.id=m.usuario_id where m.turma_id='${turma}' and u.email='teste-sh@example.invalid'`), "t", "marcada no banco");

      await nav.abrir("/admin/tesouraria");
      await nav.esperarTexto("Ainda não há plano");
      await nav.clicar("Montar plano", { seletor: "button" });
      await nav.preencher("#plano-quantidade", "3");
      await nav.preencher("#plano-valor", "100");
      await nav.preencher("#plano-primeira", "2026-10-10");
      await nav.clicar("Salvar plano", { escopo: "@[role=dialog]", seletor: "button" });
      await nav.esperarTexto("3 parcelas, R$\u00a0300,00 por pessoa");
      igual(sql(`select string_agg(to_char(vencimento,'DD/MM'), ',' order by numero) from parcelas where turma_id='${turma}'`), "10/10,10/11,10/12", "plano no banco");

      // Parcela e meia de uma vez, paga pela mãe: cobre a 1ª e metade da 2ª.
      // O diálogo "Montar plano" também tem campo "valor": espera ele fechar,
      // senão o teste preenche o diálogo errado.
      await nav.esperar("!document.querySelector('[role=dialog]')", 10000, "diálogo do plano fechar");
      await nav.clicar("Lançar", { escopo: "@li[data-membro='João Lima']", seletor: "button" });
      await nav.esperar(
        "[...document.querySelectorAll('[role=dialog]')].some((d) => d.textContent.includes('Lançar para João Lima'))",
        10000,
        "formulário de lançamento",
      );
      await nav.preencher("[role=dialog] [name=valor]", "150");
      await nav.preencher("[role=dialog] [name=pagoPor]", "mãe");
      await nav.clicar("Lançar", { escopo: "@[role=dialog]", seletor: "button[type=submit]" });
      // Espera o banco, e não um tempo fixo: no Docker o envio às vezes passa de 2 s.
      const lancado = () => sql(`select valor || ' ' || status || ' ' || pago_por from pagamentos where turma_id='${turma}'`);
      for (let i = 0; i < 20 && !lancado(); i++) await dormir(500);
      igual(lancado(), "150.00 confirmado mãe", "lançamento no banco");
      igual(sql(`select count(*) from auditoria where turma_id='${turma}' and acao in ('papel.tesouraria','plano.alterado','pagamento.lancado')`), "3", "tudo na auditoria");

      // O formando vê a própria situação.
      await nav.cookie(lerCookie("cookie-participante.txt"));
      await nav.abrir("/minha-situacao");
      await nav.esperarTexto("Você pagou");
      await nav.esperarTexto("150,00"); // "R$" vem com espaço não separável
      await nav.esperarTexto("300,00");
      await nav.esperarTexto("Pago por mãe");
      await nav.esperarTexto("Tesouraria: Maria Souza");
      // E não entra na tesouraria.
      await nav.abrir("/admin/tesouraria");
      await nav.esperar("location.pathname === '/dashboard'", 15000, "participante volta ao dashboard");
    } finally {
      await nav.cookie(lerCookie("cookie-admin.txt"));
      sql(`delete from pagamentos where turma_id='${turma}'`);
      sql(`delete from parcelas where turma_id='${turma}'`);
      sql(`update membros set tesouraria=false where turma_id='${turma}'`);
    }
  });
  await passo("ADR-0005 parte 2: já paguei, a tesouraria confirma ou recusa", async () => {
    const turma = turmaTeste();
    const estados = () => sql(`select string_agg(valor || ':' || status, ',' order by created_at) from pagamentos where turma_id='${turma}'`);
    sql(`update membros set tesouraria=true where turma_id='${turma}' and usuario_id=(select id from usuarios where email='teste-sh@example.invalid')`);
    for (let i = 1; i <= 3; i++) {
      sql(`insert into parcelas (turma_id,numero,valor,vencimento) values ('${turma}',${i},100,date '2026-10-10' + ${i - 1} * interval '1 month')`);
    }
    try {
      // O formando informa um pagamento.
      await nav.cookie(lerCookie("cookie-participante.txt"));
      await nav.abrir("/minha-situacao");
      await nav.clicar("Já paguei", { seletor: "button" });
      await nav.esperar("!!document.querySelector('[role=dialog] [name=valor]')", 10000, "formulário do informe");
      igual(await nav.ev("!!document.querySelector('[role=dialog] [name=tipo]')"), false, "formando não escolhe o tipo");
      await nav.preencher("[role=dialog] [name=valor]", "120");
      await nav.preencher("[role=dialog] [name=referencia]", "E999");
      await nav.clicar("Informar pagamento", { escopo: "@[role=dialog]", seletor: "button[type=submit]" });
      await dormir(2000);
      igual(estados(), "120.00:informado", "informe no banco");
      await nav.abrir("/minha-situacao");
      await nav.esperarTexto("Aguardando confirmação");

      // A tesouraria confirma.
      await nav.cookie(lerCookie("cookie-admin.txt"));
      await nav.abrir("/admin/tesouraria");
      await nav.esperarTexto("Aguardando sua confirmação");
      await nav.clicar("Confirmar", { escopo: "@li[data-informe='João Lima']", seletor: "button" });
      await dormir(2000);
      igual(estados(), "120.00:confirmado", "confirmado no banco");

      // Outro informe, recusado com motivo.
      sql(`insert into pagamentos (turma_id,usuario_id,valor,pago_em,status,lancado_por)
        select '${turma}', id, 80, current_date, 'informado', id from usuarios where email='teste-jl@example.invalid'`);
      await nav.abrir("/admin/tesouraria");
      await nav.esperarTexto("Aguardando sua confirmação");
      await nav.clicar("Recusar", { escopo: "@li[data-informe='João Lima']", seletor: "button" });
      await nav.esperar("!!document.querySelector('[role=dialog] [name=motivo]')", 10000, "motivo da recusa");
      await nav.preencher("[role=dialog] [name=motivo]", "não achei no extrato");
      await nav.clicar("Recusar", { escopo: "@[role=dialog]", seletor: "button[type=submit]" });
      await dormir(2000);
      igual(estados(), "120.00:confirmado,80.00:recusado", "recusado no banco");

      await nav.cookie(lerCookie("cookie-participante.txt"));
      await nav.abrir("/minha-situacao");
      await nav.esperarTexto("Motivo da tesouraria: não achei no extrato");
      await nav.esperarTexto("120,00");
      igual(
        sql(`select count(*) from auditoria where turma_id='${turma}' and acao in ('pagamento.informado','pagamento.confirmado','pagamento.recusado')`),
        "3",
        "informe, confirmação e recusa na auditoria",
      );
    } finally {
      await nav.cookie(lerCookie("cookie-admin.txt"));
      sql(`delete from pagamentos where turma_id='${turma}'`);
      sql(`delete from parcelas where turma_id='${turma}'`);
      sql(`update membros set tesouraria=false where turma_id='${turma}'`);
    }
  });
  await passo("ADR-0005 parte 3: caixa, regras, mudanças no plano e saída da turma", async () => {
    const turma = turmaTeste();
    const idDe = (email) => `(select id from usuarios where email='${email}')`;
    sql(`update membros set tesouraria=true where turma_id='${turma}' and usuario_id=${idDe("teste-sh@example.invalid")}`);
    for (let i = 1; i <= 2; i++) {
      sql(`insert into parcelas (turma_id,numero,valor,vencimento) values ('${turma}',${i},100,date '2026-10-10' + ${i - 1} * interval '1 month')`);
    }
    // Pessoa temporária com um pagamento confirmado e um informe pendente.
    sql(`insert into usuarios (name,email,"emailVerified") values ('Temporário E2E','teste-tmp@example.invalid',true) on conflict do nothing`);
    sql(`insert into membros (turma_id,usuario_id,papel) values ('${turma}',${idDe("teste-tmp@example.invalid")},'participante')`);
    sql(`insert into pagamentos (turma_id,usuario_id,valor,pago_em,status) values
      ('${turma}',${idDe("teste-jl@example.invalid")},100,current_date,'confirmado'),
      ('${turma}',${idDe("teste-tmp@example.invalid")},40,current_date,'confirmado'),
      ('${turma}',${idDe("teste-tmp@example.invalid")},10,current_date,'informado')`);
    try {
      // Tesouraria escreve as regras e ajusta uma parcela.
      await nav.abrir("/admin/tesouraria");
      await nav.esperarTexto("Caixa e regras");
      await nav.clicar("Escrever regras do dinheiro", { seletor: "button" });
      await nav.preencher("#regras-dinheiro", "Desistência até 31/03 devolve tudo.");
      await nav.clicar("Salvar regras", { escopo: "@[role=dialog]", seletor: "button" });
      await dormir(2000);
      igual(sql(`select regras_dinheiro from turmas where id='${turma}'`), "Desistência até 31/03 devolve tudo.", "regras no banco");
      await nav.abrir("/admin/tesouraria");
      await nav.clicar("Ajustar", { seletor: "button" });
      await nav.esperar("!!document.querySelector('[role=dialog] [name=valor]')", 10000, "ajuste da parcela");
      await nav.preencher("[role=dialog] [name=valor]", "120");
      await nav.clicar("Salvar parcela", { escopo: "@[role=dialog]", seletor: "button" });
      await dormir(2000);
      igual(sql(`select valor from parcelas where turma_id='${turma}' and numero=1`), "120.00", "parcela ajustada");

      // Remover alguém com pagamento: o diálogo avisa, o confirmado fica sem nome, o informe some.
      await nav.abrir("/admin/membros");
      await nav.esperarTexto("Temporário E2E");
      await nav.clicar("Remover", { escopo: "Temporário E2E", seletor: "button" });
      await nav.esperarTexto("Pagou R$\u00a040,00");
      await nav.clicar("Sim, excluir", { escopo: "@[role=dialog]", seletor: "button", contem: false });
      // Espera a remoção no banco (ela também manda email, e no Docker passa de 2 s).
      const aindaMembro = () =>
        sql(`select count(*) from membros where turma_id='${turma}' and usuario_id=${idDe("teste-tmp@example.invalid")}`);
      for (let i = 0; i < 30 && aindaMembro() !== "0"; i++) await dormir(500);
      igual(aindaMembro(), "0", "membro removido");
      igual(
        sql(`select string_agg(valor || ':' || status || ':' || coalesce(usuario_id::text,'sem nome'), ',' order by valor) from pagamentos where turma_id='${turma}' and valor in (10,40)`),
        "40.00:confirmado:sem nome",
        "confirmado fica sem nome, informe some",
      );

      // O formando vê o caixa (com o pagamento de quem saiu), as regras e a mudança no plano.
      await nav.cookie(lerCookie("cookie-participante.txt"));
      await nav.abrir("/minha-situacao");
      await nav.esperarTexto("Caixa da turma");
      // Arrecadado 140 (100 + 40 de quem saiu); previsto (120 + 100) × 2 membros = 440.
      await nav.esperarTexto("140,00");
      await nav.esperarTexto("440,00");
      await nav.esperarTexto("Desistência até 31/03 devolve tudo.");
      await nav.clicar("Mudanças no plano", { seletor: "summary" });
      await nav.esperarTexto("ajustou a parcela 1");
      verdade(!(await nav.tem("Temporário E2E")), "nome de quem saiu não aparece");
    } finally {
      await nav.cookie(lerCookie("cookie-admin.txt"));
      sql(`delete from pagamentos where turma_id='${turma}'`);
      sql(`delete from parcelas where turma_id='${turma}'`);
      sql(`update turmas set regras_dinheiro=null where id='${turma}'`);
      sql(`update membros set tesouraria=false where turma_id='${turma}'`);
      sql("delete from usuarios where email='teste-tmp@example.invalid'");
    }
  });
  await passo("ADR-0006: emails de decisão, mudança no evento e prazo, sem repetir", async () => {
    // Os emails do Docker caem no Mailpit. Fora do Docker (sem Mailpit), o passo não se aplica.
    const MAILPIT = process.env.MAILPIT_URL ?? "http://localhost:8025";
    const caixa = async () => {
      const r = await fetch(`${MAILPIT}/api/v1/messages?limit=200`);
      const d = await r.json();
      return d.messages.map((m) => ({ para: m.To[0].Address, assunto: m.Subject }));
    };
    const doJoao = async (trecho) =>
      (await caixa()).filter((m) => m.para === "teste-jl@example.invalid" && m.assunto.includes(trecho)).length;
    try {
      await fetch(`${MAILPIT}/api/v1/messages`, { method: "DELETE" });
    } catch {
      verdade(false, `Mailpit fora do ar em ${MAILPIT}: rode no Docker ou defina MAILPIT_URL`);
    }
    const turma = turmaTeste();
    const enq = enqueteLocal();
    const segredo = fs.readFileSync(".env.local", "utf8").match(/^CRON_SECRET="?([^"\n]*)"?/m)?.[1];
    try {
      // Decisão fixada: email "Decidido" para a turma (menos quem fixou).
      await nav.abrir(`/admin/votacoes/votos/${enq}`);
      await nav.clicar("Fixar decisão", { seletor: "button" });
      await nav.esperar("!!document.querySelector('[role=dialog] #justificativa')", 10000, "diálogo de fixar");
      // Sem votos, nenhuma opção vem marcada: escolhe uma (o rádio é obrigatório).
      await nav.clicar("Salão Clássico", { escopo: "@[role=dialog]", seletor: "label" });
      await nav.preencher("#justificativa", "Teste do email da ADR-0006.");
      await nav.clicar("Fixar decisão", { escopo: "@[role=dialog]", seletor: "button" });
      await nav.esperarTexto("Decisão fixada");
      for (let i = 0; i < 20 && (await doJoao("Decidido: Onde vai ser o nosso evento?")) === 0; i++) await dormir(500);
      igual(await doJoao("Decidido: Onde vai ser o nosso evento?"), 1, "email de decisão para o participante");
      igual(
        (await caixa()).filter((m) => m.para === "teste-sh@example.invalid" && m.assunto.startsWith("Decidido")).length,
        0,
        "quem fixou não recebe",
      );

      // Mudança de local: email "Mudou".
      await nav.abrir("/dashboard");
      await abrirDadosDoEvento();
      await nav.preencher("#localEvento", "Salão Email E2E");
      await nav.clicar("Salvar", { seletor: "button", contem: false });
      for (let i = 0; i < 20 && (await doJoao("Mudou: local da formatura")) === 0; i++) await dormir(500);
      igual(await doJoao("Mudou: local da formatura"), 1, "email de mudança no evento");

      // Quem desligou não recebe.
      sql("update usuarios set receber_emails=false where email='teste-jl@example.invalid'");
      await nav.abrir("/dashboard");
      await abrirDadosDoEvento();
      await nav.preencher("#localEvento", "Salão Email E2E 2");
      await nav.clicar("Salvar", { seletor: "button", contem: false });
      await dormir(4000);
      igual(await doJoao("Mudou: local da formatura"), 1, "desligado não recebe outro");
      sql("update usuarios set receber_emails=true where email='teste-jl@example.invalid'");

      // Lembrete de prazo: duas chamadas, um email só.
      if (segredo) {
        sql(`delete from decisoes where turma_id='${turma}'`);
        sql(`insert into regras_enquete (turma_id,enquete_id,prazo) values ('${turma}','${enq}', now() + interval '20 hours')
             on conflict (turma_id,enquete_id) do update set prazo = excluded.prazo`);
        const base = process.env.BASE_URL ?? "http://localhost:3000";
        for (let i = 0; i < 2; i++) {
          const r = await fetch(`${base}/api/cron/lembretes`, { headers: { Authorization: `Bearer ${segredo}` } });
          igual(r.status, 200, "rota de lembretes");
        }
        const semSenha = await fetch(`${base}/api/cron/lembretes`);
        igual(semSenha.status, 401, "rota sem senha recusa");
        await dormir(1500);
        igual(await doJoao("Prazo: votação"), 1, "lembrete de votação uma vez só");
      }
    } finally {
      sql("update usuarios set receber_emails=true where email like 'teste-%@example.invalid'");
      sql(`delete from decisoes where turma_id='${turma}'`);
      sql(`delete from regras_enquete where turma_id='${turma}'`);
      sql(`delete from lembretes_enviados where turma_id='${turma}'`);
    }
  });
  await passo("ADR-0007: planilha, registro da turma e convite por lista", async () => {
    const turma = turmaTeste();
    const base = process.env.BASE_URL ?? "http://localhost:3000";
    const baixar = (tipo, cookie) =>
      fetch(`${base}/admin/turma/exportar?tipo=${tipo}`, {
        headers: { cookie: `better-auth.session_token=${lerCookie(cookie)}` },
        redirect: "manual",
      });
    try {
      // Planilha de membros: BOM, ";" e auditoria do download.
      const r = await baixar("membros", "cookie-admin.txt");
      igual(r.status, 200, "planilha de membros");
      verdade((r.headers.get("content-disposition") ?? "").includes(".csv"), "baixa como .csv");
      // text() descarta o BOM ao decodificar: confere nos bytes.
      const bytes = new Uint8Array(await r.arrayBuffer());
      verdade(bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf, "começa com BOM UTF-8");
      const csv = new TextDecoder().decode(bytes);
      verdade(csv.startsWith("Nome;Email;Papel"), `cabeçalho: ${csv.slice(0, 40)}`);
      verdade(csv.includes("João Lima;teste-jl@example.invalid;participante"), "linha do participante");
      igual(sql(`select count(*) from auditoria where turma_id='${turma}' and acao='turma.exportada'`), "1", "download na auditoria");
      // Pagamentos só para a tesouraria; participante não baixa nada.
      igual((await baixar("pagamentos", "cookie-admin.txt")).status, 403, "pagamentos sem ser tesouraria");
      igual((await baixar("membros", "cookie-participante.txt")).status === 200, false, "participante não baixa");

      // Registro da turma: seções e nenhum email de membro.
      await nav.abrir("/admin/turma/registro");
      await nav.esperarTexto("Resultado das votações");
      await nav.esperarTexto("Fornecedores contratados");
      verdade(!(await nav.tem("teste-jl@example.invalid")), "registro sem email de membro");

      // Convite por lista: prévia, envio, email no Mailpit 
      await fetch("http://localhost:8025/api/v1/messages", { method: "DELETE" }).catch(() => {});
      await nav.abrir("/admin/membros");
      await nav.preencher("#lista-convites", "Nova Pessoa; teste-nova@example.invalid\nteste-jl@example.invalid\nlixo sem email");
      await nav.clicar("Ver prévia", { seletor: "button" });
      await nav.esperarTexto("1 convite novo, 1 já é membro, 1 sem email válido");
      await nav.clicar("Enviar convites", { seletor: "button" });
      await nav.esperarTexto("Convites enviados");
      igual(sql(`select nome || ' ' || email from convites_email where turma_id='${turma}'`), "Nova Pessoa teste-nova@example.invalid", "convite gravado");
      let chegou = 0;
      for (let i = 0; i < 20 && !chegou; i++) {
        await dormir(500);
        const d = await (await fetch("http://localhost:8025/api/v1/messages")).json().catch(() => ({ messages: [] }));
        chegou = d.messages.filter((m) => m.To[0].Address === "teste-nova@example.invalid" && m.Subject.startsWith("Convite:")).length;
      }
      igual(chegou, 1, "email de convite no Mailpit");
      await nav.abrir("/admin/membros");
      await nav.esperarTexto("Convidados que ainda não entraram (1)");
    } finally {
      sql(`delete from convites_email where turma_id='${turma}'`);
      sql("delete from usuarios where email='teste-nova@example.invalid'");
    }
  });
  await passo("ADR-0008: página pública do evento, mudança visível e histórico da comissão", async () => {
    const turma = turmaTeste();
    const token = () => sql(`select coalesce(token_publico,'') from turmas where id='${turma}'`);
    try {
      // A comissão cria o link.
      await nav.abrir("/dashboard");
      await nav.clicar("Criar link para família e convidados", { seletor: "button" });
      for (let i = 0; i < 20 && !token(); i++) await dormir(500);
      const t1 = token();
      verdade(/^[A-Za-z0-9_-]{22}$/.test(t1), `código de 22 caracteres: ${t1}`);

      // Sem login: vê o evento, não vê ninguém da turma.
      await nav.cookie(null);
      await nav.abrir(`/evento/${t1}`);
      await nav.esperarTexto("Sistemas de Informação 2026");
      await nav.esperarTexto("Como chegar");
      verdade(!(await nav.tem("Maria Souza")) && !(await nav.tem("João Lima")), "sem nome de membro");
      igual(
        await nav.ev("document.querySelector('meta[name=robots]')?.content ?? ''"),
        "noindex, nofollow",
        "fora da busca",
      );

      // Mudança de horário: fica no histórico e aparece na página pública.
      const alterado = () => sql(`select count(*) from auditoria where turma_id='${turma}' and acao='evento.alterado'`);
      const antes = alterado();
      await nav.cookie(lerCookie("cookie-admin.txt"));
      await nav.abrir("/dashboard");
      await abrirDadosDoEvento();
      const atual = await nav.ev("document.querySelector('#dataEvento').value");
      const novo = `${atual.slice(0, 11)}${atual.slice(11, 13) === "19" ? "18" : "19"}:00`;
      await nav.preencher("#dataEvento", novo);
      await nav.clicar("Salvar", { seletor: "button", contem: false });
      // Passos anteriores também mudam o evento: conta só o que este passo fez.
      for (let i = 0; i < 20 && alterado() === antes; i++) await dormir(500);
      igual(Number(alterado()) - Number(antes), 1, "mudança do evento na auditoria");
      await nav.cookie(null);
      await nav.abrir(`/evento/${t1}`);
      await nav.esperarTexto("Mudou em");
      await nav.esperarTexto(`agora é ${novo.slice(11)}`);

      // Gerar outro link: o antigo dá 404.
      await nav.cookie(lerCookie("cookie-admin.txt"));
      await nav.abrir("/dashboard");
      await nav.clicar("Gerar outro link", { seletor: "button" });
      for (let i = 0; i < 20 && token() === t1; i++) await dormir(500);
      verdade(token() !== t1 && token() !== "", "link trocado");
      await nav.cookie(null);
      await nav.abrir(`/evento/${t1}`);
      await nav.esperarTexto("Este link não existe ou foi desligado");

      // Histórico da comissão: mostra o evento, esconde pagamento de quem não é tesouraria.
      sql(`insert into auditoria (usuario_id,turma_id,acao,entidade,detalhe)
           select id,'${turma}','pagamento.lancado','pagamento','{"valor":123,"tipo":"pagamento"}'
             from usuarios where email='teste-sh@example.invalid'`);
      await nav.cookie(lerCookie("cookie-admin.txt"));
      await nav.abrir("/admin/turma/historico");
      await nav.esperarTexto("mudou o evento: horário");
      await nav.esperarTexto("criou o link público do evento");
      verdade(!(await nav.tem("123,00")), "comissão sem tesouraria não vê pagamento");
    } finally {
      await nav.cookie(lerCookie("cookie-admin.txt"));
      sql(`update turmas set token_publico=null where id='${turma}'`);
      sql(`delete from auditoria where turma_id='${turma}' and acao='pagamento.lancado' and detalhe->>'valor'='123'`);
    }
  });
  await passo("relatório: vários catálogos e empate no topo", async () => {
    // Monta o empate aqui: o passo da ADR-0003 apaga os votos desta pergunta
    // no fim, então não dá para contar com o voto da Maria do grupo "app".
    const turma = turmaTeste();
    sql(`delete from votos where turma_id='${turma}' and opcao_id in (select id from opcoes where enquete_id='${enqueteLocal()}')`);
    for (const [email, opcao] of [["teste-sh@example.invalid", "Espaço ao Ar Livre / Chácara"], ["teste-jl@example.invalid", "Salão Clássico"]]) {
      sql(`insert into votos (turma_id,opcao_id,usuario_id)
        select '${turma}', o.id, u.id from usuarios u, opcoes o
         where u.email='${email}' and o.enquete_id='${enqueteLocal()}' and o.texto='${opcao}'`);
    }
    await nav.abrir("/votacoes/relatorio");
    await nav.esperarTexto("Catálogo E2E Renomeado");
    await nav.esperarTexto("Empate no topo");
    await nav.foto(`${TMP}/relatorio-empate.png`);
  });
  await passo("excluir pergunta, categoria e catálogo", async () => {
    const cat = sql("select id from catalogos where nome='Catálogo E2E Renomeado'");
    await nav.abrir(`/admin/votacoes/${cat}`);
    // O diálogo mostra o nome do item e o cancelamento não apaga nada.
    await nav.clicar("Excluir pergunta", { seletor: "button" });
    await nav.esperar("!!document.querySelector('[role=dialog]')", 10000, "diálogo de confirmação");
    verdade(
      (await nav.ev("document.querySelector('[role=dialog]')?.textContent ?? ''")).includes("Qual cor da decoração?"),
      "o diálogo nomeia a pergunta que vai ser apagada",
    );
    await nav.clicar("Cancelar", { escopo: "@[role=dialog]", seletor: "button", contem: false });
    await dormir(1200);
    igual(sql("select count(*) from enquetes where titulo='Qual cor da decoração?'"), "1", "cancelar não apaga a pergunta");
    await excluir("Excluir pergunta", { seletor: "button" });
    await dormir(1800);
    igual(sql("select count(*) from enquetes where titulo='Qual cor da decoração?'"), "0", "pergunta");
    await nav.abrir(`/admin/votacoes/${cat}`);
    await excluir("Excluir categoria", { seletor: "button" });
    await dormir(1800);
    igual(sql("select count(*) from categorias where nome='Categoria E2E'"), "0", "categoria");
    await nav.abrir(`/admin/votacoes/${cat}`);
    await excluir("Excluir catálogo", { seletor: "button" });
    await nav.esperar("location.pathname === '/admin/votacoes'", 10000, "voltar à lista");
    igual(sql("select count(*) from catalogos where nome='Catálogo E2E Renomeado'"), "0", "catálogo");
  });
  await passo("catálogo a partir de modelo: copia categorias e perguntas, e some ao excluir", async () => {
    await nav.abrir("/admin/votacoes/nova");
    await nav.clicar("Usar este modelo", { escopo: "Educação Infantil e ABC", seletor: "button" });
    await nav.esperarUrl("/admin/votacoes/");
    await nav.assentar();
    await nav.esperarTexto("Educação Infantil e ABC");
    // Filtra pela turma do teste: outras turmas podem ter cópia do mesmo modelo.
    igual(sql(`select count(*) from categorias ca join catalogos c on c.id=ca.catalogo_id where c.nome='Educação Infantil e ABC' and c.turma_id='${turmaTeste()}'`), "5", "categorias copiadas");
    igual(sql(`select count(*) from enquetes e join categorias ca on ca.id=e.categoria_id join catalogos c on c.id=ca.catalogo_id where c.nome='Educação Infantil e ABC' and c.turma_id='${turmaTeste()}'`), "10", "perguntas copiadas");
    await nav.esperar("[...document.querySelectorAll('button')].some((b) => b.textContent.includes('Excluir catálogo'))", 10000, "botão Excluir catálogo");
    await excluir("Excluir catálogo", { seletor: "button" });
    await nav.esperar("location.pathname === '/admin/votacoes'", 10000, "voltar à lista");
    igual(sql(`select count(*) from catalogos where nome='Educação Infantil e ABC' and turma_id='${turmaTeste()}'`), "0", "catálogo");
  });
  await passo("catálogo padrão ligado ou desligado pela turma", async () => {
    const votos = sql(`select count(*) from votos where turma_id='${turmaTeste()}'`);
    await nav.abrir("/admin/votacoes");
    await nav.esperarTexto("Catálogo padrão");
    await nav.clicar("Editar uso do catálogo padrão", { seletor: "button" });
    await preencherEm("@[role=dialog]", "#usar", "nao");
    await nav.clicar("Salvar", { escopo: "@[role=dialog]", seletor: "button", contem: false });
    await dormir(2000);
    igual(sql(`select usar_catalogo_padrao from turmas where id='${turmaTeste()}'`), "f", "desligado no banco");
    await nav.abrir("/votacoes");
    verdade(!(await nav.tem("Catálogo Padrão")), "o padrão sumiu das votações");
    // Link guardado de antes não abre mais: nem para o admin.
    await nav.abrir(`/admin/votacoes/${idPadrao()}`);
    await nav.esperarTexto("Página não encontrada");
    await nav.abrir(`/votacoes/${idPadrao()}`);
    await nav.esperarTexto("Página não encontrada");
    // Nada foi apagado: os votos continuam guardados para quando a turma religar.
    igual(sql(`select count(*) from votos where turma_id='${turmaTeste()}'`), votos, "votos intactos");
    await nav.abrir("/admin/votacoes");
    await nav.clicar("Editar uso do catálogo padrão", { seletor: "button" });
    await preencherEm("@[role=dialog]", "#usar", "sim");
    await nav.clicar("Salvar", { escopo: "@[role=dialog]", seletor: "button", contem: false });
    await dormir(2000);
    igual(sql(`select usar_catalogo_padrao from turmas where id='${turmaTeste()}'`), "t", "religado");
    await nav.abrir("/votacoes");
    await nav.esperarTexto("Catálogo Padrão");
  });
  await passo("membros: busca sem acento, total da turma fixo e páginas", async () => {
    const proximo = () =>
      nav.ev("document.querySelector('nav[aria-label=\"Paginação\"] a[rel=next]')?.getAttribute('href') ?? null");
    const nomes = () => nav.ev("[...document.querySelectorAll('ul[data-grupo] > li')].map((li) => li.innerText).join('|')");
    sql(`insert into usuarios (name,email,"emailVerified")
      select 'Membro Paginação ' || g, 'teste-pm-' || g || '@example.invalid', true from generate_series(1, 25) g
      on conflict do nothing`);
    sql(`insert into membros (turma_id,usuario_id,papel)
      select '${turmaTeste()}', u.id, 'participante' from usuarios u where u.email like 'teste-pm-%@example.invalid'
      on conflict do nothing`);
    try {
      // 10 por página (POR_PAGINA_MEMBROS, src/lib/admin.ts).
      const total = sql(`select count(*) from membros where turma_id='${turmaTeste()}'`);
      const paginas = Math.ceil(Number(total) / 10);
      await nav.abrir("/admin/membros");
      await nav.esperarTexto(`${total} membros na turma`);
      await nav.esperarTexto(`Página 1 de ${paginas}`);
      igual(await proximo(), "/admin/membros?pagina=2", "link da próxima página");
      await nav.abrir("/admin/membros?busca=joao");
      await nav.esperarTexto("1 membro encontrado");
      verdade((await nomes()).includes("João Lima"), "busca sem acento acha João");
      verdade(!(await nomes()).includes("Maria Souza"), "busca não traz outros");
      await nav.esperarTexto(`${total} membros na turma`);
      verdade(!(await nav.tem("Página 1 de")), "uma página só não mostra paginação");
      await nav.abrir("/admin/membros?busca=" + encodeURIComponent("PAGINAÇÃO"));
      await nav.esperarTexto("25 membros encontrados");
      await nav.esperarTexto("Página 1 de 3");
      igual(await proximo(), "/admin/membros?busca=PAGINA%C3%87%C3%83O&pagina=2", "a busca se mantém no link");
      await nav.abrir("/admin/membros?busca=teste-pm-7%40");
      await nav.esperarTexto("1 membro encontrado");
      await nav.abrir("/admin/membros?busca=%25");
      await nav.esperarTexto("Nenhum membro encontrado");
      await nav.abrir("/admin/membros?busca=zzzz");
      await nav.esperarTexto("Nenhum membro encontrado");
      await nav.abrir("/admin/membros?pagina=99");
      await nav.esperarTexto(`Página ${paginas} de ${paginas}`);
    } finally {
      sql("delete from usuarios where email like 'teste-pm-%@example.invalid'");
    }
  });
  await passo("arquivar turma: faixa, campos desativados e o servidor recusa alterações", async () => {
    await nav.abrir("/admin/turma");
    await nav.clicar("Arquivar turma", { seletor: "button" });
    await nav.clicar("Arquivar", { escopo: "@[role=dialog]", seletor: "button", contem: false });
    await dormir(1800);
    igual(sql(`select arquivada_em is not null from turmas where id='${turmaTeste()}'`), "t", "arquivada");
    await nav.abrir("/duvidas");
    await nav.esperarTexto("Turma arquivada em");
    igual(await nav.ev("document.querySelector('#texto-duvida').matches(':disabled')"), true, "campo desativado");
    // Simula uma aba antiga ou um envio forjado: reabilita o campo e envia mesmo assim.
    await nav.ev("document.querySelector('fieldset').disabled = false");
    await nav.preencher("#texto-duvida", "Dúvida arquivada E2E");
    await nav.clicar("Enviar dúvida", { seletor: "button" });
    await dormir(2000);
    igual(sql("select count(*) from duvidas where conteudo like 'Dúvida arquivada E2E%'"), "0", "o servidor recusou");
    await nav.abrir("/admin/turma");
    await nav.esperarTexto("Turma arquivada");
    igual(await nav.ev("[...document.querySelectorAll('button')].find((b) => b.textContent.includes('Desarquivar turma')).matches(':disabled')"), false, "desarquivar funciona");
  });
  await passo("desarquivar volta a permitir alterações", async () => {
    await nav.abrir("/admin/turma");
    await nav.clicar("Desarquivar turma", { seletor: "button" });
    await nav.clicar("Desarquivar", { escopo: "@[role=dialog]", seletor: "button", contem: false });
    await dormir(1800);
    igual(sql(`select arquivada_em is null from turmas where id='${turmaTeste()}'`), "t", "desarquivada");
    await nav.abrir("/duvidas");
    await nav.esperarTexto("Envie a sua dúvida");
    igual(await nav.ev("document.querySelector('#texto-duvida').matches(':disabled')"), false, "campo liberado");
    verdade(!(await nav.tem("Turma arquivada em")), "faixa sumiu");
  });
  await passo("ADR-0009: arquivar com data, avisos por email e exclusão no prazo só depois do aviso", async () => {
    const MAILPIT = process.env.MAILPIT_URL ?? "http://localhost:8025";
    const segredo = fs.readFileSync(".env.local", "utf8").match(/^CRON_SECRET="?([^"\n]*)"?/m)?.[1];
    verdade(segredo, "CRON_SECRET no .env.local");
    const caixa = async () =>
      (await (await fetch(`${MAILPIT}/api/v1/messages?limit=200`)).json()).messages.map((m) => ({
        para: m.To[0].Address,
        assunto: m.Subject,
      }));
    const recebeu = async (email, trecho) => (await caixa()).filter((m) => m.para === email && m.assunto.includes(trecho)).length;
    const esperarEmail = async (email, trecho) => {
      for (let i = 0; i < 20 && (await recebeu(email, trecho)) === 0; i++) await dormir(500);
      return recebeu(email, trecho);
    };
    const cron = async () => {
      const r = await fetch(`${process.env.BASE_URL ?? "http://localhost:3000"}/api/cron/lembretes`, {
        headers: { Authorization: `Bearer ${segredo}` },
      });
      igual(r.status, 200, "rota de lembretes");
      return r.json();
    };
    const id = () => sql("select coalesce((select id::text from turmas where codigo_convite='TESTEFIM001'),'')");
    const somar = (dias) => sql(`select to_char((now() at time zone 'America/Sao_Paulo')::date + ${dias}, 'YYYY-MM-DD')`);
    await fetch(`${MAILPIT}/api/v1/messages`, { method: "DELETE" });
    sql(`insert into turmas (nome,codigo_convite,criado_por)
      select 'Fim E2E','TESTEFIM001',u.id from usuarios u where u.email='teste-sh@example.invalid' on conflict do nothing`);
    sql(`insert into membros (turma_id,usuario_id,papel)
      select t.id,u.id,case when u.email='teste-sh@example.invalid' then 'admin' else 'participante' end
        from turmas t, usuarios u
       where t.codigo_convite='TESTEFIM001' and u.email in ('teste-sh@example.invalid','teste-jl@example.invalid')
      on conflict do nothing`);
    // O aviso chega mesmo a quem desligou os emails da turma.
    sql("update usuarios set receber_emails=false where email='teste-jl@example.invalid'");
    const turma = id();
    try {
      await nav.abrir("/dashboard");
      await nav.clicar("Fim E2E", { seletor: "button" });
      await nav.assentar();

      // Arquivar com 30 dias: data gravada, email para o participante e não para quem arquivou.
      await nav.abrir("/admin/turma");
      await nav.clicar("Arquivar turma", { seletor: "button" });
      await nav.esperar("!!document.querySelector('[role=dialog] #dias')", 10000, "campo do prazo");
      await nav.preencher("#dias", "30");
      await nav.esperarTexto(`excluída em ${somar(30).split("-").reverse().join("/")}`);
      await nav.clicar("Arquivar", { escopo: "@[role=dialog]", seletor: "button", contem: false });
      for (let i = 0; i < 20 && sql(`select coalesce(excluir_em::text,'') from turmas where id='${turma}'`) === ""; i++) await dormir(500);
      igual(sql(`select excluir_em::text from turmas where id='${turma}'`), somar(30), "data de exclusão em 30 dias");
      igual(await esperarEmail("teste-jl@example.invalid", "Turma Fim E2E arquivada: exclusão em"), 1, "aviso ao arquivar");
      igual(await recebeu("teste-sh@example.invalid", "arquivada: exclusão"), 0, "quem arquivou não recebe");
      await nav.abrir("/dashboard");
      await nav.esperarTexto("Tudo será excluído em");

      // Mudar a data para 60 dias: auditoria e email "Nova data".
      await nav.abrir("/admin/turma");
      await nav.esperarTexto("faltam 30 dias");
      await nav.clicar("Mudar a data de exclusão", { seletor: "button" });
      await nav.esperar("!!document.querySelector('[role=dialog] #dias')", 10000, "campo do prazo");
      await nav.preencher("#dias", "60");
      await nav.clicar("Mudar a data", { escopo: "@[role=dialog]", seletor: "button", contem: false });
      for (let i = 0; i < 20 && sql(`select excluir_em::text from turmas where id='${turma}'`) !== somar(60); i++) await dormir(500);
      igual(sql(`select excluir_em::text from turmas where id='${turma}'`), somar(60), "data nova");
      igual(sql(`select count(*) from auditoria where turma_id='${turma}' and acao='turma.prazo_exclusao'`), "1", "mudança na auditoria");
      igual(await esperarEmail("teste-jl@example.invalid", "Nova data: a turma Fim E2E"), 1, "aviso da data nova");

      // Data vencida sem o aviso de 7 dias: a rodada manda o aviso e NÃO exclui.
      sql(`update turmas set excluir_em = current_date - 1 where id='${turma}'`);
      const r1 = await cron();
      verdade(r1.rodou, "rodada rodou");
      igual(id(), turma, "sem aviso de 7 dias, a turma fica");
      igual(await esperarEmail("teste-jl@example.invalid", "Prazo: a turma Fim E2E será excluída"), 1, "aviso de 7 dias");
      await cron();
      igual(await recebeu("teste-jl@example.invalid", "Prazo: a turma Fim E2E"), 1, "aviso não se repete");

      // Aviso com mais de 7 dias: a rodada exclui e só sobra turma.excluida.
      sql(`update lembretes_enviados set created_at = now() - interval '8 days' where tipo='exclusao' and turma_id='${turma}'`);
      const r2 = await cron();
      igual(r2.excluidas, 1, "uma turma excluída");
      igual(id(), "", "turma excluída no prazo");
      igual(
        sql(`select string_agg(acao || ':' || coalesce(detalhe->>'por',''), ',') from auditoria where entidade_id='${turma}' or turma_id='${turma}'`),
        "turma.excluida:prazo",
        "só sobra a prova da exclusão",
      );
      await nav.abrir("/dashboard");
      await nav.esperarTexto("Sistemas de Informação 2026");
    } finally {
      sql("update usuarios set receber_emails=true where email='teste-jl@example.invalid'");
      sql("delete from turmas where codigo_convite='TESTEFIM001'");
      if (turma) sql(`delete from auditoria where entidade_id='${turma}'`);
    }
  });
  await passo("excluir turma pelo admin exige o nome e leva a outra turma", async () => {
    sql(`insert into turmas (nome,codigo_convite,criado_por)
      select 'Excluir E2E','TESTEDEL001',u.id from usuarios u where u.email='teste-sh@example.invalid'
      on conflict do nothing`);
    sql(`insert into membros (turma_id,usuario_id,papel)
      select t.id,u.id,'admin' from turmas t, usuarios u
       where t.codigo_convite='TESTEDEL001' and u.email='teste-sh@example.invalid' on conflict do nothing`);
    await nav.abrir("/dashboard");
    await nav.clicar("Excluir E2E", { seletor: "button" });
    await nav.assentar();
    await nav.abrir("/admin/turma");
    await nav.esperarTexto("Digite o nome da turma");
    await nav.preencher("#confirmacao", "errado");
    await nav.clicar("Excluir turma", { seletor: "button" });
    await dormir(1800);
    igual(sql("select count(*) from turmas where codigo_convite='TESTEDEL001'"), "1", "nome errado não apaga");
    await nav.preencher("#confirmacao", "Excluir E2E");
    await nav.clicar("Excluir turma", { seletor: "button" });
    await nav.esperarUrl("/dashboard");
    await dormir(1500);
    igual(sql("select count(*) from turmas where codigo_convite='TESTEDEL001'"), "0", "apagada");
    await nav.abrir("/dashboard");
    await nav.esperarTexto("Sistemas de Informação 2026");
  });
  await passo("presença no painel do administrador: total, filtros e resumo", async () => {
    await nav.abrir("/admin/presenca");
    await nav.esperarTexto("Pessoas esperadas");
    await nav.esperarTexto("1 membro confirmado + 2 acompanhantes");
    await nav.esperarTexto("Minha mãe e meu irmão");
    await nav.abrir("/admin/presenca?filtro=pendente");
    await nav.esperarTexto("Maria Souza");
    verdade(!(await nav.tem("João Lima")), "quem respondeu não aparece em Sem resposta");
    await nav.abrir("/dashboard");
    await nav.esperarTexto("Presença confirmada");
  });
  await passo("limite de acompanhantes escolhido pelo admin corta as respostas acima", async () => {
    await nav.abrir("/admin/presenca");
    await nav.esperarTexto("Limite de acompanhantes");
    await nav.clicar("Editar limite de acompanhantes", { seletor: "button" });
    await preencherEm("@[role=dialog]", "#maxAcompanhantes", "1");
    await nav.clicar("Salvar limite", { escopo: "@[role=dialog]", seletor: "button" });
    await dormir(2000);
    igual(sql(`select max_acompanhantes from turmas where id='${turmaTeste()}'`), "1", "limite no banco");
    igual(
      sql(`select p.acompanhantes from presencas p join membros m on m.turma_id=p.turma_id and m.usuario_id=p.usuario_id
            join usuarios u on u.id=p.usuario_id
           where u.email='teste-jl@example.invalid' and p.turma_id='${turmaTeste()}'`),
      "1",
      "resposta cortada para o novo limite",
    );
    // O participante vê o limite novo na hora (dentro do diálogo de resposta).
    await nav.cookie(lerCookie("cookie-participante.txt"));
    await nav.abrir("/dashboard");
    await nav.clicar("Mudar resposta", { seletor: "button" });
    await nav.esperarTexto("De 0 a 1, sem contar você.");
    await nav.cookie(lerCookie("cookie-admin.txt"));
    await nav.abrir("/admin/presenca");
    await nav.clicar("Editar limite de acompanhantes", { seletor: "button" });
    await preencherEm("@[role=dialog]", "#maxAcompanhantes", "5");
    await nav.clicar("Salvar limite", { escopo: "@[role=dialog]", seletor: "button" });
    await dormir(2000);
    igual(sql(`select max_acompanhantes from turmas where id='${turmaTeste()}'`), "5", "limite restaurado");
  });
  await passo("remover um membro apaga o que ele deixou na turma", async () => {
    const rastro = (tabela, coluna) =>
      sql(`select count(*) from ${tabela} where turma_id='${turmaTeste()}' and ${coluna}=(select id from usuarios where email='teste-jl@example.invalid')`);
    verdade(Number(rastro("votos", "usuario_id")) > 0, "o teste precisa de um voto do participante para provar a limpeza");
    verdade(Number(rastro("presencas", "usuario_id")) > 0, "o teste precisa da presença do participante");
    await nav.abrir("/admin/membros");
    await excluir("Remover", { escopo: "João Lima" });
    await dormir(1800);
    igual(sql("select count(*) from membros m join usuarios u on u.id=m.usuario_id where u.email='teste-jl@example.invalid'"), "0", "removido");
    // Saiu por decisão do admin: o email tem de dizer isso, não "você saiu".
    verdade(
      (await ultimoEmail("Você foi removido da turma Sistemas de Informação 2026")).includes(
        "Um administrador removeu você da turma",
      ),
      "email de remoção diz que foi decisão do admin",
    );
    for (const [tabela, coluna] of [
      ["votos", "usuario_id"],
      ["presencas", "usuario_id"],
      ["duvidas", "autor_id"],
      ["tarefas", "responsavel_id"],
    ]) {
      igual(rastro(tabela, coluna), "0", `${tabela} sem o participante`);
    }
    igual(
      sql(`select count(*) from duvida_upvotes x join duvidas d on d.id=x.duvida_id
            where d.turma_id='${turmaTeste()}' and x.usuario_id=(select id from usuarios where email='teste-jl@example.invalid')`),
      "0",
      "upvotes dados por ele",
    );
    sql(`insert into membros (turma_id,usuario_id,papel) select '${turmaTeste()}', id, 'participante' from usuarios where email='teste-jl@example.invalid' on conflict do nothing`);
  });
});

await grupo("master", async () => {
  await nav.cookie(lerCookie("cookie-admin.txt"));
  const ehMaster = async () => {
    await nav.abrir("/master");
    return await nav.tem("Gestão da plataforma");
  };
  if (!(await ehMaster())) {
    await passo("conta de teste é master (suba o dev com ADMIN_MASTER_EMAILS)", async () => {
      throw new Error("/master respondeu 404: reinicie o servidor com ADMIN_MASTER_EMAILS=teste-sh@example.invalid");
    });
    return;
  }
  await passo("usuários do master paginados", async () => {
    sql(`insert into usuarios (name,email,"emailVerified")
      select 'Zz Paginação ' || g, 'teste-pg-' || g || '@example.invalid', true from generate_series(1, 21) g
      on conflict do nothing`);
    try {
      // 10 por página (POR_PAGINA_MASTER, src/lib/plataforma.ts).
      const total = Number(sql("select count(*) from usuarios"));
      const paginas = String(Math.ceil(total / 10));
      await nav.abrir("/master/usuarios");
      await nav.esperarTexto(`Página 1 de ${paginas}`);
      await nav.esperarTexto(`${total} usuários cadastrados`);
      igual(
        await nav.ev("document.querySelector('nav[aria-label=\"Paginação\"] a[rel=next]')?.getAttribute('href') ?? null"),
        "/master/usuarios?pagina=2",
        "link da próxima página",
      );
      await nav.abrir("/master/usuarios?pagina=99");
      await nav.esperarTexto(`Página ${paginas} de ${paginas}`);
      await nav.abrir("/master/turmas");
      verdade(!(await nav.tem("Página 2")), "poucas turmas não paginam");
    } finally {
      sql("delete from usuarios where email like 'teste-pg-%@example.invalid'");
    }
  });
  await passo("alterar papel de um membro pela turma", async () => {
    await nav.abrir(`/master/turmas/${turmaTeste()}`);
    await nav.clicar("Promover", { escopo: "João Lima", seletor: "button" });
    await nav.clicar("Trocar papel", { escopo: "@[role=dialog]", seletor: "button" });
    await dormir(1800);
    igual(sql("select papel from membros m join usuarios u on u.id=m.usuario_id where u.email='teste-jl@example.invalid'"), "admin", "promovido");
    await nav.abrir(`/master/turmas/${turmaTeste()}`);
    await nav.clicar("Tornar participante", { escopo: "João Lima", seletor: "button" });
    await nav.clicar("Trocar papel", { escopo: "@[role=dialog]", seletor: "button" });
    await dormir(1800);
    igual(sql("select papel from membros m join usuarios u on u.id=m.usuario_id where u.email='teste-jl@example.invalid'"), "participante", "rebaixado");
  });
  await passo("excluir usuário exige o email de confirmação", async () => {
    sql(`insert into usuarios (name,email,"emailVerified") values ('Apagar Teste','teste-del@example.invalid',true) on conflict do nothing`);
    await nav.abrir("/master/usuarios");
    await nav.clicar("Excluir usuário", { escopo: "Apagar Teste", seletor: "button" });
    await preencherEm("@[role=dialog]", "input[name=confirmacao]", "errado@example.invalid");
    await nav.clicar("Sim, excluir", { escopo: "@[role=dialog]", seletor: "button", contem: false });
    await dormir(1800);
    igual(sql("select count(*) from usuarios where email='teste-del@example.invalid'"), "1", "confirmação errada não apaga");
    await preencherEm("@[role=dialog]", "input[name=confirmacao]", "teste-del@example.invalid");
    await nav.clicar("Sim, excluir", { escopo: "@[role=dialog]", seletor: "button", contem: false });
    await dormir(1800);
    igual(sql("select count(*) from usuarios where email='teste-del@example.invalid'"), "0", "apagado");
    // Mesmo assunto da exclusão pedida pela própria pessoa; o corpo é que diz
    // que veio de um administrador.
    verdade(
      (await ultimoEmail("Um administrador excluiu sua conta")).includes("Um administrador excluiu sua conta"),
      "email de exclusão pelo master diz quem excluiu",
    );
  });
  await passo("excluir turma exige o nome de confirmação", async () => {
    sql(`insert into turmas (nome,codigo_convite) values ('Turma Apagar Teste','TESTEDEL001')`);
    const id = sql("select id from turmas where codigo_convite='TESTEDEL001'");
    await nav.abrir(`/master/turmas/${id}`);
    await nav.clicar("Excluir turma", { seletor: "button" });
    await preencherEm("@[role=dialog]", "input[name=confirmacao]", "nome errado");
    await nav.clicar("Sim, excluir", { escopo: "@[role=dialog]", seletor: "button", contem: false });
    await dormir(1800);
    igual(sql("select count(*) from turmas where codigo_convite='TESTEDEL001'"), "1", "confirmação errada não apaga");
    await preencherEm("@[role=dialog]", "input[name=confirmacao]", "Turma Apagar Teste");
    await nav.clicar("Sim, excluir", { escopo: "@[role=dialog]", seletor: "button", contem: false });
    await nav.esperar("location.pathname === '/master/turmas'", 10000, "voltar à lista de turmas");
    igual(sql("select count(*) from turmas where codigo_convite='TESTEDEL001'"), "0", "apagada");
  });
  // Fica no fim do grupo de propósito: tira o João Lima da turma do seed, e os
  // grupos seguintes já não dependem da presença dele.
  await passo("master remove membro da turma e avisa por email", async () => {
    await nav.abrir(`/master/turmas/${turmaTeste()}`);
    await nav.clicar("Remover", { escopo: "João Lima", seletor: "button" });
    await nav.clicar("Sim, remover", { escopo: "@[role=dialog]", seletor: "button", contem: false });
    await dormir(1800);
    igual(
      sql("select count(*) from membros m join usuarios u on u.id=m.usuario_id where u.email='teste-jl@example.invalid'"),
      "0",
      "removido da turma pelo master",
    );
    verdade(
      (await ultimoEmail("Você foi removido da turma Sistemas de Informação 2026")).includes(
        "Um administrador removeu você da turma",
      ),
      "email de remoção pelo master",
    );
  });
});

await grupo("extras", async () => {
  await nav.cookie(lerCookie("cookie-admin.txt"));
  await passo("id inexistente mostra a página não encontrada dentro do app", async () => {
    await nav.abrir("/votacoes/00000000-0000-0000-0000-000000000000");
    await nav.esperarTexto("Página não encontrada");
  });
  await passo("tela de erro do app: mensagem, código e tentar de novo", async () => {
    const pasta = "src/app/(app)/teste-erro";
    fs.mkdirSync(pasta, { recursive: true });
    fs.writeFileSync(`${pasta}/page.tsx`, 'export default function P() { throw new Error("erro de teste"); }\n');
    try {
      // O dev server só passa a conhecer a rota depois de notar o arquivo novo;
      // nesse intervalo a resposta é 404 e a tela de erro não aparece. Cada
      // navegação também aquece o compilador, que a frio leva mais de dez
      // segundos quando a suíte já percorreu o app inteiro. Por isso o passo
      // espera a rota existir em vez de rezar num sleep fixo.
      for (let tentativa = 0; tentativa < 20; tentativa++) {
        await nav.abrir("/teste-erro");
        if (!(await nav.tem("Página não encontrada"))) break;
        await dormir(1000);
      }
      await nav.esperarTexto("Algo deu errado", 30000);
      await nav.esperarTexto("Tentar de novo", 30000);
      await nav.foto(`${TMP}/tela-de-erro.png`);
      await nav.clicar("Tentar de novo", { seletor: "button" });
      await dormir(1500);
      verdade(await nav.tem("Algo deu errado"), "deveria continuar na tela de erro");
    } finally {
      // Sai da página de teste antes de apagá-la, para o recarregamento automático
      // do dev server não atropelar a próxima navegação.
      await nav.abrir("/entrar").catch(() => {});
      fs.rmSync(pasta, { recursive: true, force: true });
      await dormir(2500);
      // o erro da página de teste é esperado
      nav.logs.length = 0;
    }
  });
  await passo("a animação de entrada acontece de fato (opacidade e contador)", async () => {
    // Abre uma vez antes de gravar: na primeira carga o dev server ainda
    // compila, a montagem passa de 3 s e o timer de segurança do SCRIPT_TEMA
    // desliga a animação (data-sem-animacao), como deve fazer.
    await nav.abrir("/dashboard");
    await nav.assentar();
    // Um gravador roda desde o início do documento e anota, a cada quadro, a opacidade
    // dos primeiros blocos da página e o texto do primeiro contador.
    const { identifier } = await nav.cdp("Page.addScriptToEvaluateOnNewDocument", {
      source: `window.__rec = []; (function loop() { const w = document.querySelector('[data-animar]');
        if (w) { const b = [...w.querySelectorAll(':scope > * > *')].slice(0, 3);
          window.__rec.push({ o: b.map(x => +getComputedStyle(x).opacity), c: document.querySelector('[data-contar]')?.textContent }); }
        requestAnimationFrame(loop); })();`,
    });
    try {
      await nav.abrir("/dashboard");
      await dormir(1500);
      const rec = await nav.ev("window.__rec");
      const todas = rec.flatMap((r) => r.o);
      verdade(todas.length > 20, `poucas amostras: ${todas.length} (quadros gravados: ${rec.length}, url: ${await nav.url()})`);
      verdade(todas.some((o) => o === 0), "no começo os blocos deveriam estar escondidos");
      verdade(todas.some((o) => o > 0.05 && o < 0.95), "nenhum quadro com opacidade intermediária");
      igual(todas.at(-1), 1, "no fim os blocos ficam visíveis");
      const contadores = [...new Set(rec.map((r) => r.c).filter((c) => c !== undefined && c !== null))];
      verdade(contadores.length >= 2, `o contador não contou: ${contadores}`);
    } finally {
      await nav.cdp("Page.removeScriptToEvaluateOnNewDocument", { identifier });
    }
  });
  await passo("foco por teclado tem contorno visível", async () => {
    await nav.abrir("/entrar");
    for (let i = 0; i < 3; i++) {
      await nav.cdp("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
      await nav.cdp("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
    }
    const f = await nav.ev("(() => { const e = document.activeElement; const s = getComputedStyle(e); return { tag: e.tagName, largura: s.outlineWidth, estilo: s.outlineStyle, sombra: s.boxShadow !== 'none' }; })()");
    verdade((f.estilo !== "none" && f.largura !== "0px") || f.sombra, `sem indicação de foco: ${JSON.stringify(f)}`);
  });
  await passo("celular: a sidebar vira gaveta; computador, tablet e TV já vêm com ela aberta", async () => {
    // Celular (<768px): a sidebar do shadcn vira uma gaveta (Sheet), fechada por padrão.
    const dialogAberto = () => nav.ev("!!document.querySelector('[role=dialog]')");
    await nav.tamanho(390, 800, true);
    await nav.abrir("/dashboard");
    igual(await dialogAberto(), false, "gaveta começa fechada no celular");
    await nav.clicar("Alternar menu", { seletor: "button" });
    await nav.esperar("!!document.querySelector('[role=dialog]')", 5000, "gaveta abriu");
    await nav.tem("Tarefas"); // link da navegação visível dentro da gaveta
    await nav.clicar("Tarefas", { seletor: "a" });
    await nav.esperarUrl("/tarefas");
    await dormir(400);
    igual(await dialogAberto(), false, "navegar pelo link fecha a gaveta sozinha");
    await nav.clicar("Alternar menu", { seletor: "button" });
    await nav.esperar("!!document.querySelector('[role=dialog]')", 5000, "reabre");
    await nav.cdp("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
    await nav.cdp("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
    await dormir(400);
    igual(await dialogAberto(), false, "Esc fecha a gaveta");

    // Computador, tablet e TV (768px+): a sidebar já vem aberta, sem precisar
    // clicar em nada; o mesmo botão só recolhe para só ícones (não esconde).
    const estado = () => nav.ev("document.querySelector('[data-slot=sidebar]:not([data-mobile])')?.dataset.state");
    for (const [largura, altura] of [[768, 1024], [1280, 900], [1920, 1080]]) {
      await nav.tamanho(largura, altura, false);
      await nav.abrir("/dashboard");
      igual(await estado(), "expanded", `sidebar já aberta, sem precisar abrir (${largura}px)`);
      await nav.tem("Tarefas");
      await nav.clicar("Alternar menu", { seletor: "button" });
      await dormir(300);
      igual(await estado(), "collapsed", `recolhe para só ícones (${largura}px)`);
      await nav.clicar("Alternar menu", { seletor: "button" });
      await dormir(300);
      igual(await estado(), "expanded", `abre de novo (${largura}px)`);
    }
    await nav.tamanho(1280, 900, false);
  });
  await passo("Minhas turmas recolhe e expande dentro da sidebar", async () => {
    await nav.abrir("/dashboard");
    const aberta = () => nav.ev("document.querySelector('[data-slot=collapsible]')?.dataset.state");
    igual(await aberta(), "open", "começa aberta");
    await nav.tem("Outra turma");
    await nav.clicar("Minhas turmas", { seletor: "button" });
    await dormir(300);
    igual(await aberta(), "closed", "recolhe ao clicar");
    verdade(!(await nav.tem("Outra turma")), "as turmas somem");
    await nav.clicar("Minhas turmas", { seletor: "button" });
    await dormir(300);
    igual(await aberta(), "open", "expande de novo");
    await nav.tem("Outra turma");
  });
  await passo("celular: menu, cabeçalho e formulário cabem na tela com toque", async () => {
    await nav.tamanho(390, 800, true);
    await nav.abrir("/tarefas");
    const sw = await nav.ev("document.documentElement.scrollWidth");
    igual(sw, 390, "sem rolagem horizontal");
    await nav.clicar("Nova tarefa", { seletor: "summary" });
    const alturaInput = await nav.ev("document.querySelector('#titulo').getBoundingClientRect().height");
    verdade(alturaInput >= 40, `campo com ${alturaInput}px de altura no toque`);
    await nav.tamanho(1280, 900, false);
  });
  await passo("TV: fonte da raiz e largura do conteúdo escalam", async () => {
    await nav.tamanho(1920, 1080);
    await nav.abrir("/dashboard");
    igual(await nav.ev("getComputedStyle(document.documentElement).fontSize"), "18px", "fonte em 1920");
    await nav.tamanho(2560, 1440);
    await nav.abrir("/dashboard");
    igual(await nav.ev("getComputedStyle(document.documentElement).fontSize"), "24px", "fonte em 2560");
    await nav.tamanho(1280, 900);
  });
});

await nav.fechar();
const ruins = resultados.filter((r) => !r.ok);
console.log(`\n${resultados.length - ruins.length}/${resultados.length} passos ok`);
if (ruins.length) {
  console.log("Falharam:");
  for (const r of ruins) console.log(` - [${r.grupoAtual}] ${r.nome}: ${r.erro.split("\n")[0]}`);
  process.exit(1);
}
