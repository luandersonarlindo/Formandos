// Testes de fluxo no navegador de verdade (Chrome headless): preenche
// formulários, clica em botões e confere o resultado na tela e no banco.
//
// Precisa do dev server com SMTP desligado (o email vai para o log, e nenhum
// email real é enviado) e, para o grupo "master", com a conta fictícia como master:
//   SMTP_HOST= ADMIN_MASTER_EMAILS="teste-sh@example.invalid" npm run dev > scripts/teste/.tmp/dev.log 2>&1
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
  try {
    await fn();
    resultados.push({ grupoAtual, nome, ok: true });
    console.log(`  ✅ ${nome}`);
  } catch (e) {
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
const ultimoLink = (parte) => {
  const links = fs.readFileSync(LOG, "utf8").slice(-20000).match(/https?:\/\/[^\s"'<>]+/g) ?? [];
  const l = links.filter((x) => x.includes(parte)).at(-1);
  if (!l) throw new Error(`link com "${parte}" não apareceu no log do servidor (${LOG})`);
  return l.replace(/&amp;/g, "&");
};
const idPadrao = () => sql("select id from catalogos where turma_id is null order by nome limit 1");
// A turma do seed (o código de convite pode ser trocado pelos testes; o email do criador não).
const turmaTeste = () => sql("select id from turmas where criado_por = (select id from usuarios where email='teste-sh@example.invalid') and nome='Sistemas de Informação 2026'");

const nav = await iniciar();
const logsDesde = (n) => nav.logs.slice(n);
async function grupo(nome, fn) {
  if (!grupos.includes(nome)) return;
  console.log(`\n== ${nome}`);
  grupoAtual = nome;
  const antes = nav.logs.length;
  await fn();
  const novos = logsDesde(antes);
  await passo("sem erros de console no grupo", async () => verdade(novos.length === 0, novos.join(" | ")));
}
// Preenche um campo dentro de um cartão/lista identificado por um trecho de texto.
async function preencherEm(escopo, seletor, valor) {
  const ok = await nav.ev(`(() => {
    const raiz = [...document.querySelectorAll('[data-slot=card],li,section,details,form,article')].filter(c => c.textContent.includes(${JSON.stringify(escopo)})).sort((a, b) => a.textContent.length - b.textContent.length)[0];
    const el = raiz?.querySelector(${JSON.stringify(seletor)}); if (!el) return false;
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, ${JSON.stringify(valor)});
    el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  if (!ok) throw new Error(`campo "${seletor}" não encontrado em "${escopo}"`);
}

const NOVO = "teste-novo@example.invalid";

await grupo("auth", async () => {
  await nav.cookie(null);
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
    await nav.clicar("Criar conta", { seletor: "form button[type=submit]" });
    await nav.esperarTexto("Enviamos um link de confirmação");
    igual(sql(`select "emailVerified" from usuarios where email='${NOVO}'`), "f", "email ainda não confirmado");
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
    await nav.abrir(ultimoLink("verify-email"));
    await nav.esperarUrl("/convite");
    igual(sql(`select "emailVerified" from usuarios where email='${NOVO}'`), "t", "email confirmado");
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
    await nav.esperarTexto("A programação ainda não foi divulgada");
    await nav.foto(`${TMP}/vazio-dashboard.png`);
    sql(`update turmas set codigo_convite='TESTENOVA01' where nome='Turma Nova Teste'`);
  });
  for (const [caminho, texto] of [
    ["/tarefas", "Nenhuma tarefa ainda"],
    ["/duvidas", "Nenhuma dúvida ainda"],
    ["/terceiros", "Nenhum fornecedor por aqui"],
    ["/admin/duvidas", "Nenhuma dúvida enviada ainda"],
    ["/admin/evento", "Nenhum item ainda"],
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
  });
  await passo("redefinir a senha pelo link e entrar com a nova", async () => {
    await dormir(500);
    await nav.abrir(ultimoLink("reset-password"));
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
    await nav.esperarUrl("/convite");
    igual(sql("select count(*) from membros m join usuarios u on u.id=m.usuario_id where u.email='teste-jl@example.invalid'"), "0", "sem turma");
    await nav.preencher("#codigo", "TESTESH0001");
    await nav.clicar("Entrar na turma", { seletor: "button" });
    await nav.esperarUrl("/dashboard");
    igual(sql("select papel from membros m join usuarios u on u.id=m.usuario_id where u.email='teste-jl@example.invalid'"), "participante", "papel");
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
    await nav.abrir("/dashboard");
    await nav.esperarTexto("Você vai ao evento?");
    await nav.clicar("Vou", { escopo: "Você vai ao evento?", seletor: "label", contem: false });
    await nav.preencher("#acompanhantes", "2");
    await nav.preencher("#observacao", "Minha mãe e meu irmão");
    await nav.clicar("Salvar resposta", { seletor: "button" });
    await nav.esperarTexto("Resposta salva");
    igual(resposta(), "vou:2:Minha mãe e meu irmão", "vou com acompanhantes");
    await nav.clicar("Talvez", { escopo: "Você vai ao evento?", seletor: "label", contem: false });
    verdade(!(await nav.tem("Quantos acompanhantes")), "campo de acompanhantes some com Talvez");
    await nav.clicar("Salvar resposta", { seletor: "button" });
    await dormir(1800);
    igual(resposta(), "talvez:0:Minha mãe e meu irmão", "talvez zera os acompanhantes");
    // Deixa como "vou" com 2 acompanhantes para o painel do administrador conferir.
    await nav.clicar("Vou", { escopo: "Você vai ao evento?", seletor: "label", contem: false });
    // O navegador já barra valores acima do máximo; tira o limite da tela para provar o do servidor.
    await nav.ev("document.querySelector('#acompanhantes').removeAttribute('max')");
    await nav.preencher("#acompanhantes", "99");
    await nav.clicar("Salvar resposta", { seletor: "button" });
    await dormir(1800);
    igual(sql("select acompanhantes from presencas p join usuarios u on u.id=p.usuario_id where u.email='teste-jl@example.invalid'"), "5", "limite de acompanhantes");
    // Recarrega para partir de um estado conhecido, sem depender do que sobrou na tela.
    await nav.abrir("/dashboard");
    await nav.esperarTexto("Você vai ao evento?");
    await nav.preencher("#acompanhantes", "2");
    await nav.clicar("Salvar resposta", { seletor: "button" });
    await dormir(1800);
    igual(resposta().split(":").slice(0, 2).join(":"), "vou:2", "vou de novo com 2");
  });
  await passo("participante responsável atualiza o andamento da própria tarefa", async () => {
    await nav.abrir("/tarefas");
    await preencherEm("Fechar o buffet", "select[name=status]", "em_andamento");
    await nav.clicar("Atualizar", { escopo: "Fechar o buffet", seletor: "button" });
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
    await nav.clicar("Gerenciar tarefa", { escopo: "Tarefa E2E", seletor: "summary" });
    await preencherEm("Tarefa E2E", "select[name=status]", "concluida");
    await nav.clicar("Salvar", { escopo: "Tarefa E2E", seletor: "button", contem: false });
    await dormir(1500);
    igual(sql("select status from tarefas where titulo='Tarefa E2E'"), "concluida", "status no banco");
    await nav.abrir("/tarefas?status=concluida");
    await nav.esperarTexto("Tarefa E2E");
    verdade(!(await nav.tem("Fechar o buffet")), "filtro deveria esconder tarefa não concluída");
  });
  await passo("excluir tarefa", async () => {
    await nav.abrir("/tarefas");
    await nav.clicar("Gerenciar tarefa", { escopo: "Tarefa E2E", seletor: "summary" });
    await nav.clicar("Excluir tarefa", { escopo: "Tarefa E2E", seletor: "button" });
    await dormir(1500);
    igual(sql("select count(*) from tarefas where titulo='Tarefa E2E'"), "0", "apagada");
  });
  await passo("salvar voto marca a enquete como respondida", async () => {
    await nav.abrir(`/votacoes/${idPadrao()}`);
    await nav.clicar("Espaço ao Ar Livre / Chácara", { escopo: "Onde vai ser o nosso evento?", seletor: "label" });
    await nav.clicar("Salvar voto", { escopo: "Onde vai ser o nosso evento?", seletor: "button" });
    await dormir(1500);
    igual(sql("select o.texto from votos v join opcoes o on o.id=v.opcao_id join usuarios u on u.id=v.usuario_id join enquetes e on e.id=o.enquete_id where u.email='teste-sh@example.invalid' and e.titulo='Onde vai ser o nosso evento?'"), "Espaço ao Ar Livre / Chácara", "voto no banco");
    await nav.esperarTexto("Respondida");
  });
  await passo("catálogo padrão lista o progresso na página de votações", async () => {
    await nav.abrir("/votacoes");
    await nav.esperarTexto("1 de 23 enquetes respondidas");
  });
  await passo("enviar dúvida e votar nela", async () => {
    await nav.abrir("/duvidas");
    await nav.preencher("#texto-duvida", "Dúvida E2E: tem vaga de estacionamento?");
    await nav.clicar("Enviar dúvida", { seletor: "button" });
    await nav.esperarTexto("Dúvida E2E");
    await nav.clicar("Votar nesta dúvida", { escopo: "Dúvida E2E", seletor: "button" });
    await dormir(1500);
    igual(sql("select count(*) from duvida_upvotes x join duvidas d on d.id=x.duvida_id where d.conteudo like 'Dúvida E2E%'"), "1", "voto na dúvida");
    await nav.clicar("Remover meu voto", { escopo: "Dúvida E2E", seletor: "button" });
    await dormir(1500);
    igual(sql("select count(*) from duvida_upvotes x join duvidas d on d.id=x.duvida_id where d.conteudo like 'Dúvida E2E%'"), "0", "voto removido");
  });
  await passo("filtro Sem resposta lista só as abertas", async () => {
    await nav.abrir("/duvidas?filtro=abertas");
    await nav.esperarTexto("Dúvida E2E");
    verdade(!(await nav.tem("O prazo é dia 20/10")), "resposta apareceu no filtro de abertas");
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
      await nav.abrir("/admin/duvidas?pagina=2");
      await nav.esperarTexto("Página 2 de 2");
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
    await nav.clicar("Remover", { escopo: "Flores E2E", seletor: "button" });
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
      await preencherEm("Espaço Orçamento E2E", "select[name=status]", "contratado");
      await preencherEm("Espaço Orçamento E2E", "input[name=valorOrcado]", "1500,50");
      await nav.clicar("Salvar", { escopo: "Espaço Orçamento E2E", seletor: "button" });
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
    await nav.clicar("Remover", { escopo: "Aviso E2E", seletor: "button" });
    await dormir(1500);
    igual(sql("select count(*) from avisos where titulo='Aviso E2E'"), "0", "removido");
  });
  await passo("dashboard mostra a contagem regressiva e a programação", async () => {
    await nav.abrir("/dashboard");
    await nav.esperarTexto("Recepção dos convidados");
    await nav.esperarTexto("Chácara Bela Vista, Recife");
    const partes = await nav.ev("[...document.querySelectorAll('main p.vitrine-texto-gradiente')].map(p => p.textContent)");
    igual(partes.length, 4, "quatro blocos de contagem");
  });
});

await grupo("admin", async () => {
  await nav.cookie(lerCookie("cookie-admin.txt"));
  await passo("copiar código de convite e a mensagem", async () => {
    await nav.abrir("/admin/convite");
    await nav.cdp("Emulation.setFocusEmulationEnabled", { enabled: true });
    await nav.clicar("Copiar código", { seletor: "button" });
    await nav.esperarTexto("Copiado!");
    await nav.clicar("Copiar mensagem de convite", { seletor: "button" });
    await nav.esperarTexto("Copiado!");
  });
  await passo("gerar novo código troca o código", async () => {
    const antes = sql(`select codigo_convite from turmas where id='${turmaTeste()}'`);
    await nav.clicar("Gerar novo código", { seletor: "button" });
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
    await dormir(1800);
    igual(sql("select papel from membros m join usuarios u on u.id=m.usuario_id where u.email='teste-jl@example.invalid'"), "admin", "promovido");
    await nav.abrir("/admin/membros");
    await nav.clicar("Tornar participante", { escopo: "João Lima", seletor: "button" });
    await dormir(1800);
    igual(sql("select papel from membros m join usuarios u on u.id=m.usuario_id where u.email='teste-jl@example.invalid'"), "participante", "rebaixado");
  });
  await passo("o último administrador não tem botão de rebaixar nem de remover", async () => {
    await nav.abrir("/admin/membros");
    const botoes = await nav.ev("[...document.querySelectorAll('li')].find(li => li.textContent.includes('Maria Souza'))?.innerText");
    verdade(!botoes.includes("Remover") && !botoes.includes("Tornar participante"), botoes);
  });
  await passo("salvar dados do evento", async () => {
    await nav.abrir("/admin/evento");
    await nav.preencher("#localEvento", "Salão Novo E2E");
    await nav.clicar("Salvar", { seletor: "button", contem: false });
    await nav.esperarTexto("Salvo").catch(() => {});
    await dormir(1500);
    igual(sql(`select local_evento from turmas where id='${turmaTeste()}'`), "Salão Novo E2E", "local no banco");
  });
  await passo("detalhes do evento: descrição, endereço, mapa e traje aparecem no dashboard", async () => {
    await nav.abrir("/admin/evento");
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
    await nav.abrir("/admin/evento");
    await nav.preencher("#dataEvento", "2030-05-10T20:00");
    await nav.preencher("#dataFimEvento", "2030-05-10T19:00");
    await nav.clicar("Salvar", { seletor: "button", contem: false });
    await nav.esperarTexto("O término precisa ser depois do início");
    // Limpa os campos de teste para os passos seguintes.
    await nav.abrir("/admin/evento");
    for (const id of ["#descricao", "#endereco", "#traje", "#observacoesLocal", "#linkMapa", "#dataFimEvento"]) {
      await nav.preencher(id, "");
    }
    await nav.clicar("Salvar", { seletor: "button", contem: false });
    await nav.esperarTexto("Dados do evento salvos");
    await nav.abrir("/dashboard");
    verdade(!(await nav.tem("Descrição E2E da festa")), "descrição removida");
  });
  await passo("adicionar e remover item da programação", async () => {
    await nav.abrir("/admin/evento");
    await nav.clicar("Adicionar item", { seletor: "summary" });
    await nav.preencher("#horario", "2026-12-05T20:00");
    await nav.preencher("#titulo", "Item E2E");
    await nav.clicar("Adicionar", { seletor: "button", contem: false });
    await nav.esperarTexto("Item E2E");
    igual(sql("select count(*) from programacao where titulo='Item E2E'"), "1", "no banco");
    await nav.clicar("Remover", { escopo: "Item E2E", seletor: "button" });
    await dormir(1800);
    igual(sql("select count(*) from programacao where titulo='Item E2E'"), "0", "removido");
  });
  await passo("moderação: responder, destacar, reabrir e apagar dúvida", async () => {
    await nav.abrir("/admin/duvidas");
    await preencherEm("Posso levar acompanhante", "textarea", "Sim, até 2 pessoas.");
    await nav.clicar("Salvar resposta", { escopo: "Posso levar acompanhante", seletor: "button" });
    await dormir(1800);
    igual(sql("select respondida from duvidas where conteudo like 'Posso levar%'"), "t", "respondida");
    await nav.abrir("/admin/duvidas");
    await nav.clicar("Destacar", { escopo: "Posso levar acompanhante", seletor: "button", contem: true });
    await dormir(1800);
    igual(sql("select destaque from duvidas where conteudo like 'Posso levar%'"), "t", "destaque");
    await nav.abrir("/admin/duvidas");
    await nav.clicar("Reabrir", { escopo: "Posso levar acompanhante", seletor: "button" });
    await dormir(1800);
    igual(sql("select respondida from duvidas where conteudo like 'Posso levar%'"), "f", "reaberta");
    await nav.abrir("/admin/duvidas");
    await nav.clicar("Apagar", { escopo: "Posso levar acompanhante", seletor: "button" });
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
    await nav.preencher("input[aria-label='Nome do catálogo']", "Catálogo E2E Renomeado");
    await nav.clicar("Renomear", { seletor: "button" });
    await dormir(1800);
    igual(sql("select count(*) from catalogos where nome='Catálogo E2E Renomeado'"), "1", "renomeado");
    await nav.preencher("#nome-categoria", "Categoria E2E");
    await nav.clicar("Adicionar categoria", { seletor: "button" });
    await nav.esperarTexto("Adicionar pergunta em Categoria E2E");
    await nav.clicar("Adicionar pergunta em Categoria E2E", { seletor: "summary" });
    await preencherEm("Adicionar pergunta em Categoria E2E", "input[name=titulo]", "Qual cor da decoração?");
    await preencherEm("Adicionar pergunta em Categoria E2E", "textarea[name=opcoes]", "Azul\nRosa\nDourado");
    await nav.clicar("Adicionar pergunta", { escopo: "Adicionar pergunta em Categoria E2E", seletor: "button", contem: false });
    await nav.esperarTexto("Qual cor da decoração?");
    igual(sql("select count(*) from opcoes o join enquetes e on e.id=o.enquete_id where e.titulo='Qual cor da decoração?'"), "3", "três opções");
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
    await nav.abrir(`/admin/votacoes/votos/${enqueteLocal()}`);
    await nav.esperarTexto("Decisão da turma");
    await nav.clicar("Espaço ao Ar Livre / Chácara", { seletor: "label", escopo: "Opção escolhida" });
    await nav.clicar("Fixar decisão", { seletor: "button" });
    await nav.esperarTexto("Decisão fixada");
    igual(sql(`select o.texto from decisoes d join opcoes o on o.id=d.opcao_id where d.turma_id='${turmaTeste()}' and d.enquete_id='${enqueteLocal()}'`), "Espaço ao Ar Livre / Chácara", "decisão no banco");
    await nav.abrir("/dashboard");
    await nav.esperarTexto("Decisões da turma");
    await nav.esperarTexto("Espaço ao Ar Livre / Chácara");
    await nav.abrir(`/votacoes/${idPadrao()}`);
    await nav.esperarTexto("Escolha da turma");
    igual(await nav.ev("[...document.querySelectorAll('label')].find((l) => l.textContent.includes('Escolha da turma')).querySelector('input').matches(':disabled')"), true, "opções desativadas");
    await nav.abrir(`/admin/votacoes/votos/${enqueteLocal()}`);
    await nav.clicar("Reabrir votação", { seletor: "button" });
    await dormir(1800);
    igual(sql(`select count(*) from decisoes where turma_id='${turmaTeste()}'`), "0", "votação reaberta");
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
      await nav.clicar("Salvar voto", { escopo: "Onde vai ser o nosso evento?", seletor: "button" });
      await nav.esperarTexto("já decidiu");
      igual(sql("select o.texto from votos v join opcoes o on o.id=v.opcao_id join usuarios u on u.id=v.usuario_id join enquetes e on e.id=o.enquete_id where u.email='teste-sh@example.invalid' and e.titulo='Onde vai ser o nosso evento?'"), antes, "o voto não mudou");
    } finally {
      sql(`delete from decisoes where turma_id='${turmaTeste()}'`);
    }
  });
  await passo("relatório: vários catálogos e empate no topo", async () => {
    sql(`insert into votos (turma_id,opcao_id,usuario_id)
      select '${turmaTeste()}', o.id, u.id from usuarios u, opcoes o join enquetes e on e.id=o.enquete_id
       where u.email='teste-jl@example.invalid' and e.titulo='Onde vai ser o nosso evento?' and o.texto='Salão Clássico' on conflict do nothing`);
    await nav.abrir("/votacoes/relatorio");
    await nav.esperarTexto("Catálogo E2E Renomeado");
    await nav.esperarTexto("Empate no topo");
    await nav.foto(`${TMP}/relatorio-empate.png`);
  });
  await passo("excluir pergunta, categoria e catálogo", async () => {
    const cat = sql("select id from catalogos where nome='Catálogo E2E Renomeado'");
    await nav.abrir(`/admin/votacoes/${cat}`);
    await nav.clicar("Excluir pergunta", { seletor: "button" });
    await dormir(1800);
    igual(sql("select count(*) from enquetes where titulo='Qual cor da decoração?'"), "0", "pergunta");
    await nav.abrir(`/admin/votacoes/${cat}`);
    await nav.clicar("Excluir categoria", { seletor: "button" });
    await dormir(1800);
    igual(sql("select count(*) from categorias where nome='Categoria E2E'"), "0", "categoria");
    await nav.abrir(`/admin/votacoes/${cat}`);
    await nav.clicar("Excluir catálogo", { seletor: "button" });
    await nav.esperar("location.pathname === '/admin/votacoes'", 10000, "voltar à lista");
    igual(sql("select count(*) from catalogos where nome='Catálogo E2E Renomeado'"), "0", "catálogo");
  });
  await passo("catálogo a partir de modelo: copia categorias e perguntas, e some ao excluir", async () => {
    await nav.abrir("/admin/votacoes/nova");
    await nav.clicar("Usar este modelo", { escopo: "Educação Infantil e ABC", seletor: "button" });
    await nav.esperarUrl("/admin/votacoes/");
    await nav.assentar();
    await nav.esperarTexto("Educação Infantil e ABC");
    igual(sql("select count(*) from categorias ca join catalogos c on c.id=ca.catalogo_id where c.nome='Educação Infantil e ABC' and c.turma_id is not null"), "5", "categorias copiadas");
    igual(sql("select count(*) from enquetes e join categorias ca on ca.id=e.categoria_id join catalogos c on c.id=ca.catalogo_id where c.nome='Educação Infantil e ABC' and c.turma_id is not null"), "10", "perguntas copiadas");
    await nav.esperar("[...document.querySelectorAll('button')].some((b) => b.textContent.includes('Excluir catálogo'))", 10000, "botão Excluir catálogo");
    await nav.clicar("Excluir catálogo", { seletor: "button" });
    await nav.esperar("location.pathname === '/admin/votacoes'", 10000, "voltar à lista");
    igual(sql("select count(*) from catalogos where nome='Educação Infantil e ABC'"), "0", "catálogo");
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
      const total = sql(`select count(*) from membros where turma_id='${turmaTeste()}'`);
      await nav.abrir("/admin/membros");
      await nav.esperarTexto(`${total} membros na turma`);
      await nav.esperarTexto("Página 1 de 2");
      igual(await proximo(), "/admin/membros?pagina=2", "link da próxima página");
      await nav.abrir("/admin/membros?busca=joao");
      await nav.esperarTexto("1 membro encontrado");
      verdade((await nomes()).includes("João Lima"), "busca sem acento acha João");
      verdade(!(await nomes()).includes("Maria Souza"), "busca não traz outros");
      await nav.esperarTexto(`${total} membros na turma`);
      verdade(!(await nav.tem("Página 1 de")), "uma página só não mostra paginação");
      await nav.abrir("/admin/membros?busca=" + encodeURIComponent("PAGINAÇÃO"));
      await nav.esperarTexto("25 membros encontrados");
      await nav.esperarTexto("Página 1 de 2");
      igual(await proximo(), "/admin/membros?busca=PAGINA%C3%87%C3%83O&pagina=2", "a busca se mantém no link");
      await nav.abrir("/admin/membros?busca=teste-pm-7%40");
      await nav.esperarTexto("1 membro encontrado");
      await nav.abrir("/admin/membros?busca=%25");
      await nav.esperarTexto("Nenhum membro encontrado");
      await nav.abrir("/admin/membros?busca=zzzz");
      await nav.esperarTexto("Nenhum membro encontrado");
      await nav.abrir("/admin/membros?pagina=99");
      await nav.esperarTexto("Página 2 de 2");
    } finally {
      sql("delete from usuarios where email like 'teste-pm-%@example.invalid'");
    }
  });
  await passo("arquivar turma: faixa, campos desativados e o servidor recusa alterações", async () => {
    await nav.abrir("/admin/turma");
    await nav.clicar("Arquivar turma", { seletor: "button" });
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
    await dormir(1800);
    igual(sql(`select arquivada_em is null from turmas where id='${turmaTeste()}'`), "t", "desarquivada");
    await nav.abrir("/duvidas");
    await nav.esperarTexto("Envie a sua dúvida");
    igual(await nav.ev("document.querySelector('#texto-duvida').matches(':disabled')"), false, "campo liberado");
    verdade(!(await nav.tem("Turma arquivada em")), "faixa sumiu");
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
    await nav.abrir("/admin");
    await nav.esperarTexto("Presença confirmada");
  });
  await passo("remover um membro", async () => {
    await nav.abrir("/admin/membros");
    await nav.clicar("Remover", { escopo: "João Lima", seletor: "button" });
    await dormir(1800);
    igual(sql("select count(*) from membros m join usuarios u on u.id=m.usuario_id where u.email='teste-jl@example.invalid'"), "0", "removido");
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
      const total = Number(sql("select count(*) from usuarios"));
      const paginas = String(Math.ceil(total / 20));
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
    await dormir(1800);
    igual(sql("select papel from membros m join usuarios u on u.id=m.usuario_id where u.email='teste-jl@example.invalid'"), "admin", "promovido");
    await nav.abrir(`/master/turmas/${turmaTeste()}`);
    await nav.clicar("Tornar participante", { escopo: "João Lima", seletor: "button" });
    await dormir(1800);
    igual(sql("select papel from membros m join usuarios u on u.id=m.usuario_id where u.email='teste-jl@example.invalid'"), "participante", "rebaixado");
  });
  await passo("excluir usuário exige o email de confirmação", async () => {
    sql(`insert into usuarios (name,email,"emailVerified") values ('Apagar Teste','teste-del@example.invalid',true) on conflict do nothing`);
    await nav.abrir("/master/usuarios");
    await nav.clicar("Excluir usuário", { escopo: "Apagar Teste", seletor: "summary" });
    await preencherEm("Apagar Teste", "input[name=confirmacao]", "errado@example.invalid");
    await nav.clicar("Excluir usuário", { escopo: "Apagar Teste", seletor: "button" });
    await dormir(1800);
    igual(sql("select count(*) from usuarios where email='teste-del@example.invalid'"), "1", "confirmação errada não apaga");
    await preencherEm("Apagar Teste", "input[name=confirmacao]", "teste-del@example.invalid");
    await nav.clicar("Excluir usuário", { escopo: "Apagar Teste", seletor: "button" });
    await dormir(1800);
    igual(sql("select count(*) from usuarios where email='teste-del@example.invalid'"), "0", "apagado");
  });
  await passo("excluir turma exige o nome de confirmação", async () => {
    sql(`insert into turmas (nome,codigo_convite) values ('Turma Apagar Teste','TESTEDEL001')`);
    const id = sql("select id from turmas where codigo_convite='TESTEDEL001'");
    await nav.abrir(`/master/turmas/${id}`);
    await nav.preencher("#confirmacao", "nome errado");
    await nav.clicar("Excluir turma", { seletor: "button" });
    await dormir(1800);
    igual(sql("select count(*) from turmas where codigo_convite='TESTEDEL001'"), "1", "confirmação errada não apaga");
    await nav.preencher("#confirmacao", "Turma Apagar Teste");
    await nav.clicar("Excluir turma", { seletor: "button" });
    await nav.esperar("location.pathname === '/master/turmas'", 10000, "voltar à lista de turmas");
    igual(sql("select count(*) from turmas where codigo_convite='TESTEDEL001'"), "0", "apagada");
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
      await dormir(2500);
      await nav.abrir("/teste-erro");
      await nav.esperarTexto("Algo deu errado");
      await nav.esperarTexto("Tentar de novo");
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
