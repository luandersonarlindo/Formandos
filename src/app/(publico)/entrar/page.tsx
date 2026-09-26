import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BotaoGoogle } from "@/components/features/botao-google";
import { FormEmailSenha } from "@/components/features/form-email-senha";
import { LayoutAuth } from "@/components/features/layout-auth";
import { googleConfigurado } from "@/lib/auth";
import { getSessao } from "@/lib/dal";

export const metadata: Metadata = { title: "Entrar" };

export default async function EntrarPage() {
  if (await getSessao()) redirect("/dashboard");

  return (
    <LayoutAuth>
      <FormEmailSenha google={googleConfigurado ? <BotaoGoogle /> : null} />
    </LayoutAuth>
  );
}
