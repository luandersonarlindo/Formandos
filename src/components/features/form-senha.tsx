"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleCheck, MailCheck, TriangleAlert } from "lucide-react";
import { CampoSenha } from "@/components/features/campo-senha";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

function Cabecalho({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{texto}</p>
    </div>
  );
}

// Os três desfechos do fluxo de senha (link enviado, senha salva, link
// inválido) num só desenho: ícone, título, uma frase e uma ação.
export function ResultadoSenha({
  tipo,
  titulo,
  texto,
  acao,
}: {
  tipo: "ok" | "email" | "erro";
  titulo: string;
  texto: string;
  acao: { href: string; rotulo: string; variante?: "default" | "outline" };
}) {
  const Icone = tipo === "erro" ? TriangleAlert : tipo === "email" ? MailCheck : CircleCheck;
  return (
    <div data-grupo className="flex flex-col gap-5">
      <span
        className={cn(
          "flex size-12 items-center justify-center rounded-full border",
          tipo === "erro" ? "bg-destructive/10 text-destructive" : "bg-muted/50 text-foreground",
        )}
      >
        <Icone className="size-5" aria-hidden />
      </span>
      <Cabecalho titulo={titulo} texto={texto} />
      {/* Anuncia o desfecho para quem usa leitor de tela: o foco não muda. */}
      <p role={tipo === "erro" ? "alert" : "status"} className="sr-only">
        {titulo}.
      </p>
      <Button asChild variant={acao.variante ?? "default"} className="h-10 w-full text-sm">
        <Link href={acao.href}>{acao.rotulo}</Link>
      </Button>
    </div>
  );
}

function Erro({ children }: { children: React.ReactNode }) {
  return (
    <Alert variant="destructive">
      <AlertDescription>{children}</AlertDescription>
    </Alert>
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
      <ResultadoSenha
        tipo="email"
        titulo="Confira o seu email"
        texto="Se este email tiver cadastro, enviamos um link para definir a senha. O link vale por 1 hora."
        acao={{ href: "/entrar", rotulo: "Voltar para o login", variante: "outline" }}
      />
    );
  }

  return (
    <div data-grupo className="flex flex-col gap-5">
      <Cabecalho titulo="Esqueci a senha" texto="Enviamos um link para você criar uma senha nova." />
      <form onSubmit={enviar} className="flex flex-col gap-4">
        <Field>
          <FieldLabel htmlFor="email">Email da conta</FieldLabel>
          <Input id="email" name="email" type="email" autoComplete="email" className="h-10" required />
          <FieldDescription className="text-xs">
            Entrou pelo Google e quer usar senha? Serve também.
          </FieldDescription>
        </Field>
        {erro && <Erro>{erro}</Erro>}
        <Button type="submit" disabled={carregando} className="h-10 w-full text-sm">
          {carregando && <Spinner />}
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
      <ResultadoSenha
        tipo="ok"
        titulo="Senha salva"
        texto="Agora você já pode entrar com email e senha."
        acao={{ href: "/entrar", rotulo: "Ir para o login" }}
      />
    );
  }

  return (
    <div data-grupo className="flex flex-col gap-5">
      <Cabecalho titulo="Nova senha" texto="Escolha a senha que você vai usar para entrar." />
      <form onSubmit={enviar} className="flex flex-col gap-4">
        <Field>
          <FieldLabel htmlFor="senha">Nova senha</FieldLabel>
          <CampoSenha id="senha" name="senha" autoComplete="new-password" minLength={8} />
          <FieldDescription className="text-xs">Mínimo de 8 caracteres.</FieldDescription>
        </Field>
        {erro && <Erro>{erro}</Erro>}
        <Button type="submit" disabled={carregando} className="h-10 w-full text-sm">
          {carregando && <Spinner />}
          {carregando ? "Salvando…" : "Salvar senha"}
        </Button>
      </form>
    </div>
  );
}
