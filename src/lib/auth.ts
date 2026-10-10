import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { pool } from "./db";
import {
  emailBoasVindas,
  emailRedefinirSenha,
  emailVerificacao,
  enviarEmail,
  enviarEmailSilencioso,
  urlDoSite,
} from "./email";
import { validarEmailCadastro } from "./email-validacao";

type UsuarioEmail = { name: string; email: string };

function enviarBoasVindas(usuario: UsuarioEmail) {
  // Falha no envio não pode derrubar o cadastro: só registra no log.
  return enviarEmailSilencioso({
    para: usuario.email,
    ...emailBoasVindas(usuario.name, urlDoSite("/dashboard")),
  });
}

// A Vercel publica cada preview num endereço novo (formandos-abc123.vercel.app).
// O Google só devolve o código para o redirect URI cadastrado no Console, que é
// o de produção, então em preview o botão do Google quebraria com
// "Error 400: redirect_uri_mismatch". Fora de produção o login com Google fica
// desligado e o email/senha segue valendo.
const emProducao = process.env.VERCEL_ENV
  ? process.env.VERCEL_ENV === "production"
  : true;

// Sem as credenciais, o login com Google fica desligado e só o email/senha vale.
export const googleConfigurado = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
) && emProducao;

// Sem isso o Better Auth recusa a origem e devolve 403 Invalid origin em toda
// chamada autenticada por cookie. A lista SOMA à origem de BETTER_AUTH_URL (que
// o Better Auth já inclui por conta própria): substituir a lista deixaria de fora
// justamente a origem pública do deploy.
const origensConfiaveis = [
  // Preview da Vercel: o curinga cobre os endereços trocados a cada commit.
  process.env.VERCEL_ENV === "production" ? null : "*.vercel.app",
  // Acesso pelo IP da rede local (celular, tablet, TV). Ver LAN_ORIGIN.
  process.env.LAN_ORIGIN,
  // O IP da rede muda a cada casa; abrir pelo localhost tem de continuar
  // funcionando sem mexer em nada.
  "http://localhost:3000",
].filter((origem): origem is string => Boolean(origem));

export const auth = betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: origensConfiaveis,
  // A Vercel encerra o TLS no proxy e repassa o host público em
  // x-forwarded-host. Sem isto o Better Auth não enxerga a origem pública.
  advanced: {
    trustedProxyHeaders: true,
    database: { generateId: "uuid" },
  },
  // A tabela de usuários do Better Auth se chama `usuarios` (e não `user`,
  // que é palavra reservada no PostgreSQL).
  user: { modelName: "usuarios" },
  // Alternativa ao Google: conta própria do app, com senha própria (a senha
  // do Google nunca passa por aqui). O email só vale depois de confirmado pelo
  // link enviado; sem isso não há login. Quem entrou pelo Google cria a senha
  // pelo "Esqueci a senha": o link prova que o email é dela e o Better Auth
  // grava a senha na MESMA conta (mesmo `usuarios.id`, mesmos dados).
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await enviarEmail({ para: user.email, ...emailRedefinirSenha(user.name, url) });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await enviarEmail({ para: user.email, ...emailVerificacao(user.name, url) });
    },
    // Cadastro por email: parabéns só depois de confirmar que o email existe.
    afterEmailVerification: async (user) => {
      await enviarBoasVindas(user);
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Barreira de servidor: retorna false e o usuário nem é criado.
        // O cliente já valida antes (mensagem específica); aqui o erro que
        // sobe é genérico. Google não cai aqui na prática (Google nunca
        // emite domínio descartável nem com erro de digitação).
        before: async (user) => {
          if (!validarEmailCadastro(user.email).ok) return false;
        },
        // Cadastro pelo Google: o email já nasce verificado.
        after: async (user) => {
          if (user.emailVerified) await enviarBoasVindas(user);
        },
      },
    },
  },
  socialProviders: googleConfigurado
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
      }
    : {},
  // Deve ser o último plugin: grava os cookies de sessão nas Server Actions.
  plugins: [nextCookies()],
});
