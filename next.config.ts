import type { NextConfig } from "next";

const cabecalhosDeSeguranca = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

// Acesso pelo IP da rede local (celular, tablet, TV): defina LAN_ORIGIN no
// .env.local (ex. "http://10.0.0.112:3000", o IP muda a cada pessoa/rede).
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
