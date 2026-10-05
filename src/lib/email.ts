// Sem `import "server-only"` aqui de propósito: o script de migração
// (npm run db:migrate, roda no build da Vercel) carrega src/lib/auth.ts fora do
// Next, e esse pacote lança erro quando não está no runtime "react-server".
// A proteção continua nos módulos que tocam o banco; este só monta texto e
// envia email.
import nodemailer from "nodemailer";

// Envio de emails por SMTP (funciona com Gmail usando "senha de app").
// Sem SMTP_HOST configurado, o email é escrito no terminal do servidor.
// Isso permite desenvolver sem provedor de email, e o link de verificação
// aparece no log.

const smtpConfigurado = Boolean(process.env.SMTP_HOST);

const transporte = smtpConfigurado
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      // Porta 465 usa TLS direto; a 587 começa aberta e sobe para TLS.
      secure: Number(process.env.SMTP_PORT ?? 587) === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    })
  : null;

export type Email = { para: string; assunto: string; texto: string; html: string };

export async function enviarEmail({ para, assunto, texto, html }: Email) {
  if (!transporte) {
    // O texto puro vai inteiro para o log de propósito: é dele que os testes de
    // ponta a ponta tiram o link de confirmação e o de redefinição de senha.
    console.log(`\n[email não enviado: SMTP_HOST vazio]\nPara: ${para}\nAssunto: ${assunto}\n${texto}\n`);
    return;
  }
  await transporte.sendMail({
    from: process.env.EMAIL_FROM ?? process.env.SMTP_USER,
    to: para,
    subject: assunto,
    text: texto,
    html,
  });
}

// Falha no envio não pode derrubar o fluxo que disparou o email: a pessoa já
// fez a ação na tela, e perder o email é melhor do que desfazer a ação. Vários
// desses fluxos terminam em redirect(), que lança por dentro — um erro aqui
// impediria o redirect de acontecer.
export function enviarEmailSilencioso(email: Email) {
  return enviarEmail(email).catch((e) =>
    console.error(`[email] falha ao enviar "${email.assunto}" para ${email.para}`, e),
  );
}

// ---------------------------------------------------------------------------
// Aparência
//
// Email não carrega o CSS do site, então a paleta vai aqui trocada pelo hex
// equivalente de src/app/globals.css. Os dois ficam juntos de propósito: mexer
// na marca é mexer nos dois lugares.
//   --primary           oklch(0.511 0.262 276.966) -> #4f46e5
//   --vitrine-b         oklch(0.673 0.182 276.935) -> #818cf8
//   --foreground        oklch(0.145 0 0)          -> #252525
//   --muted             oklch(0.97 0 0)           -> #f5f5f5
//   --muted-foreground  oklch(0.556 0 0)          -> #8e8e8e
//   --border            oklch(0.922 0 0)          -> #e5e5e5
//   --destructive       oklch(0.577 0.245 27.325) -> #dc2626
const TINTA = {
  marca: "#4f46e5",
  marcaClara: "#818cf8",
  titulo: "#252525",
  texto: "#525252",
  // Única cor que NÃO copia o site: o --muted-foreground dele dá 3,3:1 no
  // branco e reprova o contraste mínimo da WCAG (4,5:1). No navegador o apagado
  // nunca passa de 14px; aqui ele é de 12 e 13px, dentro de um cliente que
  // costuma aumentar o zoom. #6b6b6b é a mesma família de cinza e sobe para
  // 5,3:1. src/lib/email.test.ts trava o número.
  apagado: "#6b6b6b",
  fundo: "#f5f5f5",
  borda: "#e5e5e5",
  aviso: "#dc2626",
  avisoClara: "#f87171",
} as const;

// Geist é webfont e webfont não roda em cliente de email. Esta é a pilha de
// sistema mais próxima do que o site usa.
const FONTE =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

// O site tem dark mode por classe, não por prefers-color-scheme (globals.css:5),
// então não há como espelhar. Fica claro fixo e as duas meta tags abaixo pedem
// ao cliente para não inverter as cores por conta própria.
const CABECALO_META = `<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">`;

export function urlDoSite(caminho = "") {
  return `${process.env.BETTER_AUTH_URL ?? "http://localhost:3000"}${caminho}`;
}

function escapar(s: string) {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

const p = (conteudo: string) =>
  `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:${TINTA.texto}">${conteudo}</p>`;

const pApagado = (conteudo: string) =>
  `<p style="margin:0 0 14px;font-size:13px;line-height:1.6;color:${TINTA.apagado}">${conteudo}</p>`;

// Tabelas e CSS inline porque o Outlook não entende flex nem grid, e rounded
// ele simplesmente descarta: o card fica quadrado lá, e isso é o preço de
// funcionar no cliente mais corporativo.
// acento "aviso" pinta a barrinha do topo de vermelho: é o que separa "você
// saiu" de "um administrador te removeu" e "sua conta foi apagada" antes mesmo
// de a pessoa ler a primeira linha.
function caixaEmail({
  preheader,
  titulo,
  motivo,
  corpo,
  acento = "marca",
}: {
  preheader: string;
  titulo: string;
  motivo: string;
  corpo: string;
  acento?: "marca" | "aviso";
}): string {
  const site = urlDoSite("/");
  const corA = acento === "aviso" ? TINTA.aviso : TINTA.marca;
  const corB = acento === "aviso" ? TINTA.avisoClara : TINTA.marcaClara;
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
${CABECALO_META}
<title>${escapar(titulo)}</title>
</head>
<body style="margin:0;padding:0;background:${TINTA.fundo};font-family:${FONTE}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapar(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${TINTA.fundo}">
<tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border:1px solid ${TINTA.borda};border-radius:12px">
<tr><td style="height:4px;font-size:0;line-height:0;background:linear-gradient(90deg,${corA},${corB})">&nbsp;</td></tr>
<tr><td style="padding:26px 32px 0">
<p style="margin:0;font-size:18px;font-weight:600;letter-spacing:-0.02em;color:${TINTA.titulo}">Formandos <span style="color:${TINTA.marca}">&#127891;</span></p>
</td></tr>
<tr><td style="padding:18px 32px 26px">
<h1 style="margin:0 0 16px;font-size:20px;line-height:1.3;font-weight:600;color:${TINTA.titulo}">${escapar(titulo)}</h1>
${corpo}
</td></tr>
<tr><td style="padding:18px 32px 26px;border-top:1px solid ${TINTA.borda}">
<p style="margin:0 0 6px;font-size:12px;line-height:1.6;color:${TINTA.apagado}">${escapar(motivo)}</p>
<p style="margin:0;font-size:12px;line-height:1.6;color:${TINTA.apagado}">Formandos &middot; <a href="${escapar(site)}" style="color:${TINTA.marca};text-decoration:none">${escapar(site)}</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function botao(url: string, rotulo: string) {
  return `<p style="margin:22px 0"><a href="${escapar(url)}" style="display:inline-block;padding:12px 22px;background:${TINTA.marca};color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px">${escapar(rotulo)}</a></p>`;
}

// Botão é ignorado por uma parte boa dos clientes e por metade das contas,
// então o endereço cru vai sempre junto, visível.
function linkCru(url: string) {
  return pApagado(
    `Se o botão não funcionar, copie este endereço:<br><span style="color:${TINTA.texto};word-break:break-all">${escapar(url)}</span>`,
  );
}

function listaDeTurmas(turmas: string[]) {
  if (turmas.length === 0) return p("Você não estava em nenhuma turma.");
  return p(
    `As turmas em que você estava: <strong>${turmas.map((t) => escapar(t)).join(", ")}</strong>.`,
  );
}

// ---------------------------------------------------------------------------
// Conta

export function emailVerificacao(nome: string, url: string): Omit<Email, "para"> {
  return {
    assunto: "Confirme seu email no Formandos",
    texto: `Olá, ${nome}! Confirme seu email abrindo este link: ${url}\n\nSe não foi você, ignore esta mensagem.`,
    html: caixaEmail({
      preheader: "Um clique e o acesso ao Formandos fica liberado.",
      titulo: "Confirme seu email",
      motivo: "Você recebe este email porque acabou de criar uma conta no Formandos.",
      corpo:
        p(`Olá, <strong>${escapar(nome)}</strong>! Falta um clique para confirmar este email e liberar o seu acesso.`) +
        botao(url, "Confirmar email") +
        linkCru(url) +
        pApagado("Se você não criou esta conta, pode ignorar este email: nada acontece."),
    }),
  };
}

export function emailBoasVindas(nome: string, url: string): Omit<Email, "para"> {
  return {
    assunto: "Sua conta no Formandos está pronta",
    texto: `Parabéns, ${nome}! Sua conta no Formandos está pronta. Entre com o código de convite da sua turma: ${url}`,
    html: caixaEmail({
      preheader: "Conta confirmada. Falta entrar na turma.",
      titulo: "Sua conta está pronta",
      motivo: "Você recebe este email porque acabou de confirmar seu email no Formandos.",
      corpo:
        p(`Parabéns, <strong>${escapar(nome)}</strong>! A sua conta no Formandos já funciona.`) +
        p(`O próximo passo é entrar na turma da formatura com o código de convite que a comissão te passou. Depois disso aparecem os avisos, as tarefas e as enquetes.`) +
        botao(url, "Abrir o Formandos") +
        linkCru(url),
    }),
  };
}

export function emailRedefinirSenha(nome: string, url: string): Omit<Email, "para"> {
  return {
    assunto: "Defina sua senha no Formandos",
    texto: `Olá, ${nome}! Use este link para definir uma nova senha (vale por 1 hora): ${url}\n\nSe não foi você, ignore esta mensagem.`,
    html: caixaEmail({
      preheader: "O link vale por 1 hora.",
      titulo: "Defina uma nova senha",
      motivo: "Você recebe este email porque pediu para redefinir a senha da sua conta.",
      corpo:
        p(`Olá, <strong>${escapar(nome)}</strong>! Use o botão abaixo para escolher uma nova senha. O link vale por 1 hora.`) +
        botao(url, "Definir senha") +
        linkCru(url) +
        pApagado('Se você não pediu isso, ignore este email: sua senha continua como está.'),
    }),
  };
}

// ---------------------------------------------------------------------------
// Turma

export function emailEntrouNaTurma(nome: string, turma: string, url: string): Omit<Email, "para"> {
  return {
    assunto: `Você entrou na turma ${turma}`,
    texto: `Olá, ${nome}! Você entrou na turma ${turma} no Formandos. Avisos, tarefas e enquetes já estão esperando: ${url}`,
    html: caixaEmail({
      preheader: `A turma ${turma} já tem você lá dentro.`,
      titulo: `Você entrou na turma ${turma}`,
      motivo: "Você recebe este email porque acabou de entrar numa turma no Formandos.",
      corpo:
        p(`Oi, <strong>${escapar(nome)}</strong>! O código de convite funcionou e você já faz parte da turma <strong>${escapar(turma)}</strong>.`) +
        p(`A partir de agora dá para conferir avisos, responder enquetes, enviar dúvidas e marcar as tarefas que caem para você.`) +
        botao(url, "Ver a turma") +
        linkCru(url),
    }),
  };
}

export function emailSaiuDaTurma(
  nome: string,
  turma: string,
  url: string,
  { turmaApagada = false }: { turmaApagada?: boolean } = {},
): Omit<Email, "para"> {
  return {
    assunto: `Você saiu da turma ${turma}`,
    texto: [
      `Olá, ${nome}! Você saiu da turma ${turma} no Formandos.`,
      turmaApagada
        ? `Você era o último membro, então a turma também foi encerrada.`
        : `Se mudar de ideia, dá para entrar de novo com o código de convite.`,
      url,
    ].join("\n\n"),
    html: caixaEmail({
      preheader: `Você saiu de ${turma}.`,
      titulo: `Você saiu da turma ${turma}`,
      motivo: "Você recebe este email porque saiu de uma turma no Formandos.",
      corpo:
        p(`Oi, <strong>${escapar(nome)}</strong>! Você saiu da turma <strong>${escapar(turma)}</strong>.`) +
        p(`Os seus votos, dúvidas, presenças e tarefas naquela turma foram apagados junto.`) +
        // Sem outro membro a turma morre junto, e o email precisa dizer, senão
        // a pessoa acha que ainda dá para voltar com o mesmo código.
        (turmaApagada
          ? p(`Você era o único membro, então a turma <strong>${escapar(turma)}</strong> também foi encerrada e o código de convite dela não funciona mais.`)
          : p(`Mudou de ideia? O mesmo código de convite traz você de volta, com o histórico do zero.`)) +
        botao(url, "Abrir o Formandos") +
        linkCru(url),
    }),
  };
}

export function emailRemovidoDaTurma(
  nome: string,
  turma: string,
  url: string,
): Omit<Email, "para"> {
  return {
    assunto: `Você foi removido da turma ${turma}`,
    texto: `Olá, ${nome}! Um administrador removeu você da turma ${turma} no Formandos. Entre em contato com a comissão se achar errado: ${url}`,
    html: caixaEmail({
      preheader: `Um administrador removeu você de ${turma}.`,
      titulo: `Você foi removido da turma ${turma}`,
      motivo: "Você recebe este email porque foi removido de uma turma no Formandos.",
      acento: "aviso",
      corpo:
        p(`Oi, <strong>${escapar(nome)}</strong>! Um administrador da turma <strong>${escapar(turma)}</strong> removeu você da lista de membros.`) +
        p(`O que você tinha naquela turma — votos, dúvidas, presenças e tarefas — foi removido junto.`) +
        pApagado("Se isso não foi de verdade, fale com a comissão da turma: só um administrador pode desfazer.") +
        botao(url, "Abrir o Formandos") +
        linkCru(url),
    }),
  };
}

// ---------------------------------------------------------------------------
// Exclusão de conta

export function emailContaExcluida(
  nome: string,
  turmas: string[],
  { porAdmin = false }: { porAdmin?: boolean } = {},
): Omit<Email, "para"> {
  const site = urlDoSite("/");
  const titulo = porAdmin ? "Sua conta foi excluída por um administrador" : "Sua conta foi excluída";
  return {
    assunto: "Sua conta no Formandos foi excluída",
    texto: [
      `Olá, ${nome}!`,
      porAdmin
        ? `Um administrador excluiu sua conta do Formandos.`
        : `Sua conta no Formandos foi excluída, como você pediu.`,
      turmas.length > 0 ? `Turmas em que você estava: ${turmas.join(", ")}.` : "",
      `Não dá para recuperar nada disso.`,
      site,
    ]
      .filter(Boolean)
      .join("\n\n"),
    html: caixaEmail({
      preheader: "O que foi apagado não volta.",
      titulo,
      acento: "aviso",
      motivo: porAdmin
        ? "Você recebe este email porque um administrador excluiu sua conta no Formandos."
        : "Você recebe este email porque acabou de excluir sua conta no Formandos.",
      corpo:
        p(`Oi, <strong>${escapar(nome)}</strong>! ${porAdmin ? "Um administrador excluiu sua conta" : "Sua conta foi excluída, como você pediu"}.`) +
        listaDeTurmas(turmas) +
        p("A conta e tudo o que dependia dela saíram do ar: sessões, participação, votos, dúvidas e tarefas. <strong>Não há como recuperar.</strong>") +
        pApagado("Se você não pediu isso, entre em contato com quem administra a sua turma."),
    }),
  };
}