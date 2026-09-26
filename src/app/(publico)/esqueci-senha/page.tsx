import type { Metadata } from "next";
import { FormPedirSenha } from "@/components/features/form-senha";

export const metadata: Metadata = { title: "Definir senha" };

export default function EsqueciSenhaPage() {
  return (
    <main id="conteudo" className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Definir senha</h1>
      <p className="max-w-sm text-muted-foreground">
        Esqueceu a senha? Ou entrou com o Google e quer também entrar com email e senha? Informe o email da conta e enviamos um link. É a mesma conta, com os mesmos dados.
      </p>
      <FormPedirSenha />
    </main>
  );
}
