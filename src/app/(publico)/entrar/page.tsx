import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BotaoGoogle } from "@/components/features/botao-google";
import { FormEmailSenha } from "@/components/features/form-email-senha";
import { LayoutAuth } from "@/components/features/layout-auth";
import { googleConfigurado } from "@/lib/auth";
import { getSessao } from "@/lib/dal";
import { destinoSeguro } from "@/lib/redirecionamento";

export const metadata: Metadata = { title: "Entrar" };

export default async function EntrarPage(props: PageProps<"/entrar">) {
  // `?voltar=` vem do proxy (página protegida aberta sem login) ou de um link
  // de convite. Só caminhos internos passam (ADR-0002).
  const { voltar } = await props.searchParams;
  const destino = destinoSeguro(typeof voltar === "string" ? voltar : null);

  if (await getSessao()) redirect(destino);

  return (
    <LayoutAuth>
      <FormEmailSenha
        destino={destino}
        google={googleConfigurado ? <BotaoGoogle destino={destino} /> : null}
      />
    </LayoutAuth>
  );
}
