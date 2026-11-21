import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { FormEmailSenha } from "@/components/features/form-email-senha";
import { LayoutAuth } from "@/components/features/layout-auth";
import { googleConfigurado } from "@/lib/auth";
import { codigoDoLink, COOKIE_CONVITE } from "@/lib/convite-link";
import { getSessao } from "@/lib/dal";
import { destinoSeguro } from "@/lib/redirecionamento";

export const metadata: Metadata = { title: "Entrar" };

export default async function EntrarPage(props: PageProps<"/entrar">) {
  // `?voltar=` vem do proxy (página protegida aberta sem login) ou de um link
  // de convite. Só caminhos internos passam (ADR-0002).
  const { voltar } = await props.searchParams;
  const destino = destinoSeguro(typeof voltar === "string" ? voltar : null);

  if (await getSessao()) redirect(destino);

  // Quem chega por um link de convite vem com `voltar=/convite?codigo=…` ou,
  // se o `voltar` se perdeu, com o cookie de reserva do proxy. Só muda o
  // texto da tela; o destino continua sendo o `voltar`.
  const convite =
    new URL(destino, "http://formandos.local").pathname === "/convite" ||
    codigoDoLink((await cookies()).get(COOKIE_CONVITE)?.value) !== null;

  return (
    <LayoutAuth>
      <FormEmailSenha destino={destino} google={googleConfigurado} convite={convite} />
    </LayoutAuth>
  );
}
