"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { CampoSenha } from "@/components/features/campo-senha";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function FormEmailSenha({ google }: { google?: React.ReactNode }) {
  const router = useRouter();
  const [criando, setCriando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  function trocarModo(criar: boolean) {
    setCriando(criar);
    setErro(null);
    setAviso(null);
  }

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const dados = new FormData(e.currentTarget);
    const email = String(dados.get("email") ?? "").trim();
    const senha = String(dados.get("senha") ?? "");
    const nome = String(dados.get("nome") ?? "").trim();

    setCarregando(true);
    setErro(null);
    setAviso(null);
    // O `try` não é sobre o `router.push`: ele não devolve promise, e quem
    // resolve a tela é a navegação. O que ele cobre é a rejeição do authClient
    // (rede caída, fetch recusado) — sem isso o `setCarregando(false)` nunca era
    // chamado, o botão ficava travado em "Aguarde…" e nenhum erro aparecia.
    try {
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
      // `carregando` continua true: a navegação desmonta este componente, e até
      // lá o botão não deve aceitar um segundo envio.
    } catch {
      setErro("Não foi possível falar com o servidor. Tente de novo.");
      setCarregando(false);
    }
  }

  return (
    <div data-grupo className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {criando ? "Crie a sua conta" : "Bem-vindo de volta"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {criando
            ? "Leva menos de um minuto. Você confirma o email por um link."
            : "Entre para acompanhar a formatura da sua turma."}
        </p>
      </div>

      <div role="group" aria-label="Tipo de acesso" className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
        {[
          { valor: false, rotulo: "Entrar" },
          { valor: true, rotulo: "Criar conta" },
        ].map((op) => (
          <button
            key={op.rotulo}
            type="button"
            aria-pressed={criando === op.valor}
            onClick={() => trocarModo(op.valor)}
            className={
              criando === op.valor
                ? "rounded-md bg-background px-3 py-1.5 text-sm font-medium shadow-sm"
                : "rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            }
          >
            {op.rotulo}
          </button>
        ))}
      </div>

      {google && (
        <>
          {google}
          <div className="flex items-center gap-3 text-xs text-muted-foreground" aria-hidden>
            <span className="h-px flex-1 bg-border" />
            ou com email
            <span className="h-px flex-1 bg-border" />
          </div>
        </>
      )}

      <form onSubmit={enviar} className="flex flex-col gap-4">
        {criando && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nome">Nome completo</Label>
            <Input id="nome" name="nome" autoComplete="name" maxLength={120} className="h-10" required />
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" className="h-10" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="senha">Senha</Label>
            {!criando && (
              <Link
                href="/esqueci-senha"
                className="py-1 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground pointer-coarse:py-2.5"
              >
                Esqueci a senha
              </Link>
            )}
          </div>
          <CampoSenha
            id="senha"
            name="senha"
            autoComplete={criando ? "new-password" : "current-password"}
            minLength={criando ? 8 : undefined}
          />
          {criando && (
            <p className="text-xs text-muted-foreground">Mínimo de 8 caracteres.</p>
          )}
        </div>
        {aviso && (
          <p role="status" className="rounded-lg border bg-muted/50 p-3 text-sm">
            {aviso}
          </p>
        )}
        {erro && (
          <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {erro}
          </p>
        )}
        <Button type="submit" disabled={carregando} className="h-10 w-full text-sm">
          {carregando && <LoaderCircle className="animate-spin" aria-hidden />}
          {carregando ? "Aguarde…" : criando ? "Criar conta" : "Entrar"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {criando ? "Já tem conta? " : "Ainda não tem conta? "}
        <button
          type="button"
          onClick={() => trocarModo(!criando)}
          className="py-1 font-medium text-foreground underline underline-offset-4 pointer-coarse:py-2.5"
        >
          {criando ? "Entrar" : "Criar conta"}
        </button>
      </p>
    </div>
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
