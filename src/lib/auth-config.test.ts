import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

async function carregarAuth() {
  vi.resetModules();
  const mod = await import("@/lib/auth");
  return mod;
}

const base = {
  GOOGLE_CLIENT_ID: "x.apps.googleusercontent.com",
  GOOGLE_CLIENT_SECRET: "y",
  BETTER_AUTH_SECRET: "s",
  BETTER_AUTH_URL: "https://formandos.vercel.app",
  DATABASE_URL: "postgresql://luan@localhost/formandos?host=/var/run/postgresql",
};

describe("config do auth por ambiente da Vercel", () => {
  const original = { ...process.env };

  beforeEach(() => {
    for (const k of Object.keys(process.env)) if (k in base || k === "VERCEL_ENV") delete process.env[k];
    Object.assign(process.env, base);
  });

  afterEach(() => {
    process.env = { ...original };
  });

  it("mantem o Google ligado fora da Vercel (dev local)", async () => {
    delete process.env.VERCEL_ENV;
    const { googleConfigurado, auth } = await carregarAuth();
    expect(googleConfigurado).toBe(true);
    expect(Object.keys(auth.options.socialProviders ?? {})).toContain("google");
  });

  it("desliga o Google em preview (o redirect URI so existe em producao)", async () => {
    process.env.VERCEL_ENV = "preview";
    const { googleConfigurado, auth } = await carregarAuth();
    expect(googleConfigurado).toBe(false);
    expect(auth.options.socialProviders).toEqual({});
  });

  it("mantem o Google em producao", async () => {
    process.env.VERCEL_ENV = "production";
    const { googleConfigurado } = await carregarAuth();
    expect(googleConfigurado).toBe(true);
  });

  it("inclui *.vercel.app em preview e nunca em producao", async () => {
    process.env.VERCEL_ENV = "preview";
    const { auth } = await carregarAuth();
    expect(auth.options.trustedOrigins).toContain("*.vercel.app");

    process.env.VERCEL_ENV = "production";
    const prod = await carregarAuth();
    expect(prod.auth.options.trustedOrigins).not.toContain("*.vercel.app");
  });

  it("soma as origens em vez de substituir a lista", async () => {
    process.env.VERCEL_ENV = "production";
    process.env.LAN_ORIGIN = "http://192.0.2.10:3000";
    const { auth } = await carregarAuth();
    const origens = auth.options.trustedOrigins as string[];
    // A origem de LAN_ORIGIN não pode apagar o localhost, que é o default do dev.
    expect(origens).toContain("http://localhost:3000");
    expect(origens).toContain("http://192.0.2.10:3000");
  });

  it("confia no proxy da Vercel para enxergar o host publico", async () => {
    process.env.VERCEL_ENV = "production";
    const { auth } = await carregarAuth();
    expect(auth.options.advanced?.trustedProxyHeaders).toBe(true);
  });
});