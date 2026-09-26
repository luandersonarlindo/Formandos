import "server-only";
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

type Email = { para: string; assunto: string; texto: string; html: string };

export async function enviarEmail({ para, assunto, texto, html }: Email) {
  if (!transporte) {
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

function escapar(s: string) {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function botao(url: string, rotulo: string) {
  return `<p><a href="${escapar(url)}" style="display:inline-block;padding:10px 18px;background:#111;color:#fff;border-radius:6px;text-decoration:none">${escapar(rotulo)}</a></p>`;
}

export function emailVerificacao(nome: string, url: string): Omit<Email, "para"> {
  return {
    assunto: "Confirme seu email no Formandos",
    texto: `Olá, ${nome}! Confirme seu email abrindo este link: ${url}\n\nSe não foi você, ignore esta mensagem.`,
    html: `<p>Olá, ${escapar(nome)}!</p><p>Confirme seu email para ativar a conta no Formandos:</p>${botao(url, "Confirmar email")}<p>Se não foi você, ignore esta mensagem.</p>`,
  };
}

export function emailRedefinirSenha(nome: string, url: string): Omit<Email, "para"> {
  return {
    assunto: "Defina sua senha no Formandos",
    texto: `Olá, ${nome}! Use este link para definir uma nova senha (vale por 1 hora): ${url}\n\nSe não foi você, ignore esta mensagem.`,
    html: `<p>Olá, ${escapar(nome)}!</p><p>Use o botão abaixo para definir uma nova senha. O link vale por 1 hora.</p>${botao(url, "Definir senha")}<p>Se não foi você, ignore esta mensagem.</p>`,
  };
}

export function emailBoasVindas(nome: string, url: string): Omit<Email, "para"> {
  return {
    assunto: "Parabéns, sua conta no Formandos foi criada!",
    texto: `Parabéns, ${nome}! Sua conta no Formandos está pronta. Entre com o código de convite da sua turma: ${url}`,
    html: `<p>Parabéns, ${escapar(nome)}! 🎓</p><p>Sua conta no Formandos está pronta. Agora é só entrar na sua turma com o código de convite.</p>${botao(url, "Abrir o Formandos")}`,
  };
}
