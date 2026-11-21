"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BotaoGoogle, LinkLegal } from "@/components/features/botao-google";
import { CampoSenha } from "@/components/features/campo-senha";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";
import { normalizarEmail, validarEmailCadastro } from "@/lib/email-validacao";
import { DESTINO_PADRAO } from "@/lib/redirecionamento";

type Modo = "entrar" | "criar";

// `destino` já passou por destinoSeguro na página de login. No cadastro ele
// vai dentro do link de confirmação, então funciona mesmo se o email for
// aberto em outro navegador (autoSignInAfterVerification).
//
// Entrar e Criar conta são duas abas no topo, e só ali (P-20): a troca que
// ficava também embaixo do formulário fazia a mesma coisa duas vezes.
export function FormEmailSenha({
  google = false,
  destino = DESTINO_PADRAO,
  convite = false,
}: {
  /** Mostra o "Continuar com o Google" (só quando o login Google está configurado). */
  google?: boolean;
  destino?: string;
  /** A pessoa chegou por um link de convite: o título fala da turma, não de "voltar". */
  convite?: boolean;
}) {
  const [modo, setModo] = useState<Modo>("entrar");
  const criando = modo === "criar";

  const titulo = convite
    ? criando
      ? "Crie sua conta para entrar na turma"
      : "Entre para participar da turma"
    : criando
      ? "Crie a sua conta"
      : "Bem-vindo de volta";
  const texto = convite
    ? "Depois de entrar, você confirma a entrada na turma do convite."
    : criando
      ? "Leva menos de um minuto. Você confirma o email por um link."
      : "Entre para acompanhar a formatura da sua turma.";

  return (
    <div data-grupo className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">{titulo}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{texto}</p>
      </div>

      {/* O Radix troca de aba no mousedown e no foco. O onClick a mais cobre
          quem só dispara clique (alguns leitores de tela e o teste automático). */}
      <Tabs value={modo} onValueChange={(v) => setModo(v as Modo)}>
        <TabsList className="h-10 w-full group-data-horizontal/tabs:h-10">
          <TabsTrigger value="entrar" onClick={() => setModo("entrar")}>
            Entrar
          </TabsTrigger>
          <TabsTrigger value="criar" onClick={() => setModo("criar")}>
            Criar conta
          </TabsTrigger>
        </TabsList>
        {/* Cada aba monta o seu formulário (o Radix desmonta a aba fechada, então
            os ids não se repetem): trocar de aba limpa erro e aviso. */}
        <TabsContent value="entrar" className="pt-3">
          <Formulario criando={false} destino={destino} google={google} />
        </TabsContent>
        <TabsContent value="criar" className="pt-3">
          <Formulario criando destino={destino} google={google} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Formulario({ criando, destino, google }: { criando: boolean; destino: string; google: boolean }) {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [aceite, setAceite] = useState(false);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const dados = new FormData(e.currentTarget);
    const email = normalizarEmail(String(dados.get("email") ?? ""));
    const senha = String(dados.get("senha") ?? "");
    const nome = String(dados.get("nome") ?? "").trim();

    setErro(null);
    setAviso(null);
    // O checkbox do Radix não bloqueia o envio sozinho como o nativo; a
    // conferência fica aqui, antes de qualquer chamada.
    // Conferir a senha antes de criar a conta: um erro de digitação aqui só
    // se descobre no próximo login, e aí a saída é "Esqueci a senha".
    if (criando && senha !== String(dados.get("confirmarSenha") ?? "")) {
      setErro("As senhas não conferem. Digite a mesma senha nos dois campos.");
      return;
    }
    if (criando && !aceite) {
      setErro("Marque que tem 18 anos ou mais e aceita os Termos e a Política.");
      return;
    }
    // Barreira imediata no cadastro (descartável + erro de digitação). O
    // servidor repete a checagem no hook de criação; aqui é só UX rápida.
    if (criando) {
      const valido = validarEmailCadastro(email);
      if (!valido.ok) {
        setErro(valido.erro);
        return;
      }
    }
    setCarregando(true);
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
            callbackURL: destino,
          })
        : await authClient.signIn.email({
            email,
            password: senha,
            callbackURL: destino,
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
      router.push(destino);
      router.refresh();
      // `carregando` continua true: a navegação desmonta este componente, e até
      // lá o botão não deve aceitar um segundo envio.
    } catch {
      setErro("Não foi possível falar com o servidor. Tente de novo.");
      setCarregando(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Entrar: Google primeiro, com o aviso legal dele (quem entra pelo Google
          pela primeira vez cria a conta ali). Criar conta: o Google vai para o
          fim, depois da caixa de aceite, que vale para os dois caminhos. Assim
          o aviso legal aparece uma vez só em cada aba. */}
      {google && !criando && (
        <>
          <BotaoGoogle destino={destino} aviso />
          <FieldSeparator className="text-xs">ou com email</FieldSeparator>
        </>
      )}

      <form onSubmit={enviar} className="flex flex-col gap-4">
        {criando && (
          <Field>
            <FieldLabel htmlFor="nome">Nome completo</FieldLabel>
            <Input id="nome" name="nome" autoComplete="name" maxLength={120} className="h-10" required />
          </Field>
        )}
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" autoComplete="email" className="h-10" required />
        </Field>
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="senha">Senha</FieldLabel>
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
          {criando && <FieldDescription className="text-xs">Mínimo de 8 caracteres.</FieldDescription>}
        </Field>
        {criando && (
          <Field>
            <FieldLabel htmlFor="confirmar-senha">Confirmar senha</FieldLabel>
            <CampoSenha id="confirmar-senha" name="confirmarSenha" autoComplete="new-password" minLength={8} />
          </Field>
        )}
        {criando && (
          <Field orientation="horizontal" className="items-start rounded-lg border bg-muted/50 p-3">
            <Checkbox
              id="aceite"
              name="aceite"
              checked={aceite}
              onCheckedChange={(v) => setAceite(v === true)}
              className="mt-0.5 pointer-coarse:size-5"
            />
            <FieldLabel htmlFor="aceite" className="block text-xs leading-relaxed font-normal">
              Tenho 18 anos ou mais e aceito os <LinkLegal href="/termos">Termos de Uso</LinkLegal> e a{" "}
              <LinkLegal href="/privacidade">Política de Privacidade</LinkLegal>.
            </FieldLabel>
          </Field>
        )}
        {aviso && (
          <Alert role="status">
            <AlertDescription className="text-foreground">{aviso}</AlertDescription>
          </Alert>
        )}
        {erro && (
          <Alert variant="destructive">
            <AlertDescription>{erro}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" disabled={carregando} className="h-10 w-full text-sm">
          {carregando && <Spinner />}
          {carregando ? "Aguarde…" : criando ? "Criar conta" : "Entrar"}
        </Button>
      </form>

      {google && criando && (
        <>
          <FieldSeparator className="text-xs">ou</FieldSeparator>
          <BotaoGoogle destino={destino} desabilitado={!aceite} />
          {!aceite && (
            <p className="-mt-3 text-center text-xs text-muted-foreground">
              Marque a caixa de aceite acima para continuar com o Google.
            </p>
          )}
        </>
      )}
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
