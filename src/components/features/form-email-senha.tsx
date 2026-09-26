"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function FormEmailSenha() {
  const router = useRouter();
  const [criando, setCriando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const dados = new FormData(e.currentTarget);
    const email = String(dados.get("email") ?? "").trim();
    const senha = String(dados.get("senha") ?? "");
    const nome = String(dados.get("nome") ?? "").trim();

    setCarregando(true);
    setErro(null);
    setAviso(null);
    const { error } = criando
      ? await authClient.signUp.email({
          name: nome,
          email,
          password: senha,
          callbackURL: "/dashboard",
        })
      : await authClient.signIn.email({
          email,
          password: senha,
          callbackURL: "/dashboard",
        });

    if (error) {
      setErro(traduzir(error.code, criando));
      setCarregando(false);
      return;
    }
    if (criando) {
      // O login só vale depois de confirmar o email pelo link enviado.
      setAviso(`Enviamos um link de confirmação para ${email}. Abra o email e clique no link para ativar a conta.`);
      setCarregando(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={enviar} className="flex w-full max-w-sm flex-col gap-3 text-left">
      {criando && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nome">Nome</Label>
          <Input id="nome" name="nome" autoComplete="name" required />
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="senha">Senha</Label>
        <Input
          id="senha"
          name="senha"
          type="password"
          autoComplete={criando ? "new-password" : "current-password"}
          minLength={criando ? 8 : undefined}
          required
        />
        {criando && (
          <p className="text-xs text-muted-foreground">Mínimo de 8 caracteres.</p>
        )}
      </div>
      {aviso && (
        <p role="status" className="text-sm text-foreground">
          {aviso}
        </p>
      )}
      {erro && (
        <p role="alert" className="text-sm text-destructive">
          {erro}
        </p>
      )}
      <Button type="submit" disabled={carregando}>
        {carregando ? "Aguarde…" : criando ? "Criar conta" : "Entrar"}
      </Button>
      {!criando && (
        <Link
          href="/esqueci-senha"
          className="text-sm text-muted-foreground underline underline-offset-4"
        >
          Esqueci a senha / entrei com Google e quero criar uma senha
        </Link>
      )}
      <button
        type="button"
        className="text-sm text-muted-foreground underline underline-offset-4"
        onClick={() => {
          setCriando(!criando);
          setErro(null);
          setAviso(null);
        }}
      >
        {criando ? "Já tenho conta" : "Criar conta com email e senha"}
      </button>
    </form>
  );
}

function traduzir(codigo: string | undefined, criando: boolean) {
  switch (codigo) {
    case "INVALID_EMAIL_OR_PASSWORD":
      return "Email ou senha incorretos.";
    case "EMAIL_NOT_VERIFIED":
      return "Confirme seu email antes de entrar. Reenviamos o link para a sua caixa de entrada.";
    case "PASSWORD_TOO_SHORT":
      return "A senha precisa ter pelo menos 8 caracteres.";
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return "Este email já tem cadastro. Entre com a conta Google ou com a senha.";
    default:
      return criando
        ? "Não foi possível criar a conta. Tente novamente."
        : "Não foi possível entrar. Tente novamente.";
  }
}
