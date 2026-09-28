import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { pool } from "./db";
import {
  emailBoasVindas,
  emailRedefinirSenha,
  emailVerificacao,
  enviarEmail,
} from "./email";

type UsuarioEmail = { name: string; email: string };

function enviarBoasVindas(usuario: UsuarioEmail) {
  const url = `${process.env.BETTER_AUTH_URL ?? ""}/dashboard`;
  // Falha no envio não pode derrubar o cadastro: só registra no log.
  return enviarEmail({ para: usuario.email, ...emailBoasVindas(usuario.name, url) }).catch(
    (e) => console.error("Falha ao enviar email de boas-vindas", e),
  );
}

// Sem as credenciais, o login com Google fica desligado e só o email/senha vale.
export const googleConfigurado = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
);

export const auth = betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL,
  // Sem isso, acessar pelo IP da rede local (celular, tablet, TV) faz o
  // Better Auth recusar login e sessão: por padrão só confia na origem de
  // BETTER_AUTH_URL (localhost). Ver LAN_ORIGIN em .env.example.
  trustedOrigins: process.env.LAN_ORIGIN ? [process.env.LAN_ORIGIN] : undefined,
  // A tabela de usuários do Better Auth se chama `usuarios` (e não `user`,
  // que é palavra reservada no PostgreSQL).
  user: { modelName: "usuarios" },
  advanced: { database: { generateId: "uuid" } },
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
