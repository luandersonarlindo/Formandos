"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleCheck, LoaderCircle, MailCheck } from "lucide-react";
import { CampoSenha } from "@/components/features/campo-senha";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

function Cabecalho({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{texto}</p>
    </div>
  );
}

function Erro({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
      {children}
    </p>
  );
}

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
      <div data-grupo className="flex flex-col gap-5">
        <span className="flex size-12 items-center justify-center rounded-full border bg-muted/50">
          <MailCheck className="size-5 text-[var(--vitrine-a)]" aria-hidden />
        </span>
        <Cabecalho
          titulo="Confira o seu email"
          texto="Se este email tiver cadastro, enviamos um link para definir a senha. O link vale por 1 hora."
        />
        <p role="status" className="sr-only">
          Email enviado.
        </p>
        <Button asChild variant="outline" className="h-10 w-full text-sm">
          <Link href="/entrar">Voltar para o login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div data-grupo className="flex flex-col gap-5">
      <Cabecalho
        titulo="Definir senha"
        texto="Esqueceu a senha? Ou entrou com o Google e quer também usar email e senha? Informe o email da conta e enviamos um link. É a mesma conta, com os mesmos dados."
      />
      <form onSubmit={enviar} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" className="h-10" required />
        </div>
        {erro && <Erro>{erro}</Erro>}
        <Button type="submit" disabled={carregando} className="h-10 w-full text-sm">
          {carregando && <LoaderCircle className="animate-spin" aria-hidden />}
          {carregando ? "Enviando…" : "Enviar link"}
        </Button>
      </form>
    </div>
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
      <div data-grupo className="flex flex-col gap-5">
        <span className="flex size-12 items-center justify-center rounded-full border bg-muted/50">
          <CircleCheck className="size-5 text-[var(--vitrine-a)]" aria-hidden />
        </span>
        <Cabecalho titulo="Senha salva" texto="Agora você já pode entrar com email e senha." />
        <p role="status" className="sr-only">
          Senha salva.
        </p>
        <Button asChild className="h-10 w-full text-sm">
          <Link href="/entrar">Ir para o login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div data-grupo className="flex flex-col gap-5">
      <Cabecalho titulo="Nova senha" texto="Escolha a senha que você vai usar para entrar." />
      <form onSubmit={enviar} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="senha">Nova senha</Label>
          <CampoSenha id="senha" name="senha" autoComplete="new-password" minLength={8} />
          <p className="text-xs text-muted-foreground">Mínimo de 8 caracteres.</p>
        </div>
        {erro && <Erro>{erro}</Erro>}
        <Button type="submit" disabled={carregando} className="h-10 w-full text-sm">
          {carregando && <LoaderCircle className="animate-spin" aria-hidden />}
          {carregando ? "Salvando…" : "Salvar senha"}
        </Button>
      </form>
    </div>
  );
}
