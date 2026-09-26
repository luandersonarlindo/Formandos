import type { Metadata } from "next";
import { AnimarPagina } from "@/components/animacao/animar-pagina";
import { redirect } from "next/navigation";
import { BotaoGoogle } from "@/components/features/botao-google";
import { FormEmailSenha } from "@/components/features/form-email-senha";
import { googleConfigurado } from "@/lib/auth";
import { getSessao } from "@/lib/dal";

export const metadata: Metadata = { title: "Entrar" };

export default async function EntrarPage() {
  if (await getSessao()) redirect("/dashboard");

  return (
    <main id="conteudo" className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <AnimarPagina className="flex flex-col items-center gap-6">
        <h1 className="text-3xl font-semibold tracking-tight">Entrar</h1>
        {googleConfigurado && (
          <>
            <p className="max-w-sm text-muted-foreground">
              Acesse com a sua conta Google. Não é preciso criar senha.
            </p>
            <BotaoGoogle />
            <p className="text-sm text-muted-foreground">ou use email e senha</p>
          </>
        )}
        <FormEmailSenha />
      </AnimarPagina>
    </main>
  );
}
