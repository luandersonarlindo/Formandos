import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { pool } from "./db";

export const auth = betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL,
  // A tabela de usuários do Better Auth se chama `usuarios` (e não `user`,
  // que é palavra reservada no PostgreSQL).
  user: { modelName: "usuarios" },
  advanced: { database: { generateId: "uuid" } },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  // Deve ser o último plugin: grava os cookies de sessão nas Server Actions.
  plugins: [nextCookies()],
});
