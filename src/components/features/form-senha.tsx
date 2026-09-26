"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function FormPedirSenha() {
  const [carregando, setCarregando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    setCarregando(true);
    setErro(null);
    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/redefinir-senha",
    });
    setCarregando(false);
    if (error) setErro("Não foi possível enviar o email. Tente novamente.");
    else setEnviado(true);
  }

  if (enviado) {
    // Mesma resposta exista o email ou não, para não revelar quem tem conta.
    return (
      <p role="status" className="max-w-sm text-sm">
        Se este email tiver cadastro, enviamos um link para definir a senha. O link vale por 1 hora.
      </p>
    );
  }

  return (
    <form onSubmit={enviar} className="flex w-full max-w-sm flex-col gap-3 text-left">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      {erro && (
        <p role="alert" className="text-sm text-destructive">
          {erro}
        </p>
      )}
      <Button type="submit" disabled={carregando}>
        {carregando ? "Enviando…" : "Enviar link"}
      </Button>
      <Link href="/entrar" className="text-sm text-muted-foreground underline underline-offset-4">
        Voltar
      </Link>
    </form>
  );
}

export function FormNovaSenha({ token }: { token: string }) {
  const [carregando, setCarregando] = useState(false);
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const senha = String(new FormData(e.currentTarget).get("senha") ?? "");
    setCarregando(true);
    setErro(null);
    const { error } = await authClient.resetPassword({ newPassword: senha, token });
    setCarregando(false);
    if (error) {
      setErro(
        error.code === "INVALID_TOKEN"
          ? "Link inválido ou expirado. Peça um novo."
          : "Não foi possível salvar a senha. Tente novamente.",
      );
    } else setPronto(true);
  }

  if (pronto) {
    return (
      <div className="flex flex-col items-center gap-3">
        <p role="status">Senha salva. Agora você já pode entrar com email e senha.</p>
        <Button asChild>
          <Link href="/entrar">Ir para o login</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="flex w-full max-w-sm flex-col gap-3 text-left">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="senha">Nova senha</Label>
        <Input id="senha" name="senha" type="password" autoComplete="new-password" minLength={8} required />
        <p className="text-xs text-muted-foreground">Mínimo de 8 caracteres.</p>
      </div>
      {erro && (
        <p role="alert" className="text-sm text-destructive">
          {erro}
        </p>
      )}
      <Button type="submit" disabled={carregando}>
        {carregando ? "Salvando…" : "Salvar senha"}
      </Button>
    </form>
  );
}
