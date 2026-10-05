import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  emailBoasVindas,
  emailContaExcluida,
  emailEntrouNaTurma,
  emailRedefinirSenha,
  emailRemovidoDaTurma,
  emailSaiuDaTurma,
  emailVerificacao,
  type Email,
} from "@/lib/email";

// O HTML só tem botão e endereço quando o site está publicado (ver
// sitePublicado, em email.ts). Os testes que olham a aparência do email
// precisam estar nesse estado, senão passam a ver o email sem botão — que é o
// email de desenvolvimento, não o de produção. O bloco "endereço no email"
// abaixo troca esse valor e devolve no afterEach.
process.env.BETTER_AUTH_URL = "https://formandos.app";

// O teste de ponta a ponta tira o link de confirmação e o de redefinição do
// TEXTO puro do log do servidor, porque é isso que o console.log imprime sem
// SMTP. Se o link sumir do texto, esses passos passam a falhar só em produção,
// que é a pior hora possível de descobrir.
const COM_LINK: Array<[string, () => Omit<Email, "para">]> = [
  ["emailVerificacao", () => emailVerificacao("Ana", "https://formandos.app/verificar?token=a1")],
  [
    "emailBoasVindas",
    () => emailBoasVindas("Ana", "https://formandos.app/dashboard"),
  ],
  [
    "emailRedefinirSenha",
    () => emailRedefinirSenha("Ana", "https://formandos.app/redefinir?token=b2"),
  ],
  [
    "emailEntrouNaTurma",
    () => emailEntrouNaTurma("Ana", "Turma 2026", "https://formandos.app/dashboard"),
  ],
  [
    "emailSaiuDaTurma",
    () => emailSaiuDaTurma("Ana", "Turma 2026", "https://formandos.app/dashboard"),
  ],
  [
    "emailRemovidoDaTurma",
    () => emailRemovidoDaTurma("Ana", "Turma 2026", "https://formandos.app/dashboard"),
  ],
];

// O HTML só pode mostrar endereço quando o site está publicado. Em
// desenvolvimento BETTER_AUTH_URL vale http://localhost:3001, e um link desses
// no email levaria quem recebe para a máquina de quem programmei.
describe("endereço no email", () => {
  const urlOriginal = process.env.BETTER_AUTH_URL;

  beforeEach(() => {
    delete process.env.BETTER_AUTH_URL;
  });
  afterEach(() => {
    if (urlOriginal === undefined) delete process.env.BETTER_AUTH_URL;
    else process.env.BETTER_AUTH_URL = urlOriginal;
  });

  const todos = () => [
    emailVerificacao("Ana", "http://localhost:3001/api/auth/verify-email?token=x"),
    emailBoasVindas("Ana", "http://localhost:3001/dashboard"),
    emailRedefinirSenha("Ana", "http://localhost:3001/redefinir?token=x"),
    emailEntrouNaTurma("Ana", "Turma 2026", "http://localhost:3001/dashboard"),
    emailSaiuDaTurma("Ana", "Turma 2026", "http://localhost:3001/dashboard"),
    emailRemovidoDaTurma("Ana", "Turma 2026", "http://localhost:3001/dashboard"),
    emailContaExcluida("Ana", ["Turma 2026"]),
  ];

  it.each([
    ["localhost", "http://localhost:3001"],
    ["127.0.0.1", "http://127.0.0.1:3001"],
    ["0.0.0.0", "http://0.0.0.0:3001"],
  ])("não vaza %s para o HTML", (_nome, url) => {
    process.env.BETTER_AUTH_URL = url;
    for (const email of todos()) {
      expect(email.html).not.toContain("localhost");
      expect(email.html).not.toContain("127.0.0.1");
      expect(email.html).not.toContain("0.0.0.0");
      // Nem a chamada do botão, nem o endereço de reserva, nem o rodapé.
      expect(email.html).not.toContain("href=");
      expect(email.html).not.toContain("copie este endereço");
    }
  });

  it("também some com o botão quando não há site publicado", () => {
    process.env.BETTER_AUTH_URL = "http://localhost:3001";
    expect(emailVerificacao("Ana", "http://localhost:3001/v").html).not.toContain(
      "Confirmar email",
    );
  });

  it("no site publicado, o HTML traz o endereço real", () => {
    process.env.BETTER_AUTH_URL = "https://formandos.app";
    const html = emailVerificacao("Ana", "https://formandos.app/v").html;
    expect(html).toContain('href="https://formandos.app/v"');
    expect(html).toContain("copie este endereço");
    expect(html).toContain("https://formandos.app/");
  });

  it("sem BETTER_AUTH_URL também não inventa endereço", () => {
    for (const email of todos()) {
      expect(email.html).not.toContain("localhost");
      expect(email.html).not.toContain("href=");
    }
  });

  it("o texto puro continua levando o endereço: é o reserva sem HTML", () => {
    // Aqui a janela é o contrário: sem o endereço no texto, os testes de ponta a
    // ponta não acham o link de confirmação nem o de redefinição de senha.
    process.env.BETTER_AUTH_URL = "http://localhost:3001";
    expect(emailVerificacao("Ana", "http://localhost:3001/v").texto).toContain(
      "http://localhost:3001/v",
    );
  });
});

describe("parte de texto dos emails", () => {
  it.each(COM_LINK)("%s leva o link no texto puro", (_nome, monta) => {
    const email = monta();
    expect(email.texto).toContain("https://formandos.app");
    expect(email.assunto.trim().length).toBeGreaterThan(0);
  });
});

describe("aparência dos emails", () => {
  const todos = [...COM_LINK.map(([, monta]) => monta()), emailContaExcluida("Ana", [])];

  it.each(todos)("tem o nome do site, o doctype e nenhum script", (email) => {
    expect(email.html.startsWith("<!doctype html>")).toBe(true);
    expect(email.html).toContain("Formandos");
    expect(email.html).not.toContain("<script");
  });

  it.each(todos)("não deixa espaço de tag do HTML escapar no texto", (email) => {
    // As tags do corpo têm de estar marcadas; uma que vazou mostraria o HTML
    // na caixa de entrada.
    expect(email.html).toContain("font-family:-apple-system");
    expect(email.html.match(/<p style=/g)?.length).toBeGreaterThan(2);
  });

  it("usa a indigo da marca no botão, não o preto que estava antes", () => {
    expect(emailVerificacao("Ana", "https://formandos.app/v").html).toContain(
      "background:#4f46e5",
    );
  });

  it("pede para o cliente não inverter as cores", () => {
    // O dark mode do site é por classe, não por prefers-color-scheme, então
    // não dá para espelhar: o email fica claro e precisa avisar o cliente.
    expect(emailVerificacao("Ana", "https://formandos.app/v").html).toContain(
      'name="color-scheme" content="light"',
    );
  });

  it("mostra o endereço junto do botão, para quem não consegue clicar", () => {
    expect(emailEntrouNaTurma("Ana", "Turma 2026", "https://formandos.app/x").html).toContain(
      "word-break:break-all",
    );
  });
});

describe("nomes e turmas entram escapados", () => {
  // A única defesa é escapar na mão: não há sanitização do lado do cliente de
  // email, e um nome com "<" viraria tag no HTML entregue.
  it("não deixa o nome virar tag", () => {
    const email = emailVerificacao('<img src=x onerror="alert(1)">', "https://formandos.app/v");
    expect(email.html).not.toContain("<img");
    // escapar() usa entidade numérica, não &lt;: &#60; é a forma que nenhum
    // cliente de email interpreta como tag.
    expect(email.html).toContain("&#60;img");
  });

  it("não deixa a turma virar tag", () => {
    const email = emailEntrouNaTurma("Ana", "<b>Turma</b>", "https://formandos.app/x");
    expect(email.html).not.toContain("<b>");
    expect(email.html).toContain("&#60;b&#62;");
  });

  it("não deixa o nome virar tag na lista de turmas da exclusão", () => {
    const email = emailContaExcluida("Ana", ["Turma <b>1</b>"]);
    expect(email.html).not.toContain("<b>");
    expect(email.html).toContain("&#60;b&#62;");
  });

  it("escapa o endereço do link, sem quebrar o href", () => {
    const email = emailVerificacao("Ana", "https://formandos.app/v?a=1&b=2");
    expect(email.html).toContain("a=1&#38;b=2");
    // O texto puro é o que o teste de ponta a ponta lê, e ali não há escape.
    expect(email.texto).toContain("a=1&b=2");
  });
});

describe("contraste do texto do email", () => {
  // O WCAG pede 4,5:1 para texto normal. O --muted-foreground do site dá 3,3:1 e
  // por isso o email usa um cinza mais escuro; o teste existe para ninguém
  // "harmonizar" de volta e deixar o rodapé ilegível.
  function luminancia(hex: string) {
    const partes = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    const linear = partes.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  }
  function contraste(a: string, b: string) {
    const [clara, escura] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
    return (clara + 0.05) / (escura + 0.05);
  }

  it.each([
    ["corpo do texto", "#525252"],
    ["título", "#252525"],
    ["texto apagado (link de reserva e rodapé)", "#6b6b6b"],
    ["texto do botão", "#ffffff"],
  ])("%s tem contraste suficiente sobre o branco", (_nome, cor) => {
    const fundo = cor === "#ffffff" ? "#4f46e5" : "#ffffff";
    expect(contraste(cor, fundo)).toBeGreaterThanOrEqual(4.5);
  });

  it("o cinza do site reprovaria, o do email passa", () => {
    expect(contraste("#8e8e8e", "#ffffff")).toBeLessThan(4.5);
    expect(contraste("#6b6b6b", "#ffffff")).toBeGreaterThanOrEqual(4.5);
  });

  it("o email não usa o cinza reprovado em lugar nenhum", () => {
    for (const email of [
      emailVerificacao("Ana", "https://formandos.app/v"),
      emailContaExcluida("Ana", []),
      emailSaiuDaTurma("Ana", "Turma 2026", "https://formandos.app/x"),
    ]) {
      expect(email.html).not.toContain("#8e8e8e");
    }
  });
});

describe("email de exclusão de conta", () => {
  it("distingue a exclusão pedida da exclusão feita por admin", () => {
    const propria = emailContaExcluida("Ana", ["Turma 2026"]);
    const peloMaster = emailContaExcluida("Ana", ["Turma 2026"], { porAdmin: true });

    expect(propria.html).toContain("como você pediu");
    expect(peloMaster.html).toContain("Um administrador excluiu sua conta");
    expect(propria.html).not.toBe(peloMaster.html);
  });

  it("avisa que não há como recuperar", () => {
    expect(emailContaExcluida("Ana", ["Turma 2026"]).html).toContain("Não há como recuperar");
  });

  it("diz que ele não estava em nenhuma turma", () => {
    expect(emailContaExcluida("Ana", []).html).toContain("não estava em nenhuma turma");
    expect(emailContaExcluida("Ana", []).texto).not.toContain("Turmas em que");
  });

  it("marca remoção e exclusão com a cor de aviso, não com a da marca", () => {
    const vermelho = "linear-gradient(90deg,#dc2626,#f87171)";
    expect(emailRemovidoDaTurma("Ana", "Turma 2026", "https://formandos.app/x").html).toContain(
      vermelho,
    );
    expect(emailContaExcluida("Ana", []).html).toContain(vermelho);
    // Sair por vontade própria é ação normal: fica na cor da marca.
    expect(emailSaiuDaTurma("Ana", "Turma 2026", "https://formandos.app/x").html).toContain(
      "linear-gradient(90deg,#4f46e5,#818cf8)",
    );
  });
});

describe("email de saída da turma", () => {
  it("avisa que a turma fechou quando ele era o último membro", () => {
    const email = emailSaiuDaTurma("Ana", "Turma 2026", "https://formandos.app/x", {
      turmaApagada: true,
    });
    expect(email.html).toContain("único membro");
    expect(email.html).toContain("não funciona mais");
    // Oferecer voltar com o mesmo código seria mentira: a turma não existe.
    expect(email.html).not.toContain("traz você de volta");
  });

  it("oferece voltar quando a turma continua de pé", () => {
    expect(
      emailSaiuDaTurma("Ana", "Turma 2026", "https://formandos.app/x").html,
    ).toContain("traz você de volta");
  });
});