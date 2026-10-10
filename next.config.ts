import type { NextConfig } from "next";

// CSP permissiva onde precisa, dura onde dá:
// - `unsafe-inline` em script: exigido pelo script de tema (`layout.tsx`) e
//   pelos scripts inline do próprio Next.
// - `unsafe-eval` SÓ em dev: o dev do Next avalia código em runtime; em
//   produção (build) não há eval e a diretiva some.
// - `unsafe-inline` em style: Radix/anime.js usam estilos inline.
// - `frame-ancestors 'none'` aposenta o X-Frame-Options (mantido por
//   compatibilidade com leitor antigo).
// - HSTS em http/localhost é ignorado pelo navegador; em produção (TLS da
//   Vercel) passa a valer.
const emProducao = process.env.NODE_ENV === "production";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${emProducao ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join("; ");

const cabecalhosDeSeguranca = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  { key: "Content-Security-Policy", value: csp },
];

// Acesso pelo IP da rede local (celular, tablet, TV): defina LAN_ORIGIN no
// .env.local (ex. "http://SEU-IP-LOCAL:3000", o IP muda a cada pessoa/rede).
// Sem isso o Next bloqueia, em desenvolvimento, os assets e as Server
// Actions vindos de um host que não seja "localhost" (proteção contra DNS
// rebinding).
const origemDaRede = process.env.LAN_ORIGIN ? new URL(process.env.LAN_ORIGIN) : null;

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  ...(origemDaRede && {
    allowedDevOrigins: [origemDaRede.hostname],
    experimental: {
      serverActions: {
        allowedOrigins: [origemDaRede.host],
      },
    },
  }),
  async headers() {
    return [{ source: "/:path*", headers: cabecalhosDeSeguranca }];
  },
};

export default nextConfig;
