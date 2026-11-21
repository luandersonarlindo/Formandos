import type { Metadata } from "next";
import Link from "next/link";
import { Download, FileText, Trash2 } from "lucide-react";
import { excluirMinhaConta, atualizarMeuNome } from "@/actions/conta";
import { AvatarUsuario } from "@/components/features/avatar-usuario";
import { ConfirmarExclusao } from "@/components/features/confirmar-exclusao";
import { FormAcao } from "@/components/features/form-acao";
import { FormSairTurma } from "@/components/features/form-sair-turma";
import { SwitchEmailsTurma } from "@/components/features/switch-emails-turma";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { exigirSessao, getMembro } from "@/lib/dal";
import { pool } from "@/lib/db";
import { AVISO_INSTITUCIONAL_CURTO, DPO } from "@/lib/empresa";
import { ehMaster } from "@/lib/master";
import { getImpactoExclusaoConta } from "@/lib/usuarios";

export const metadata: Metadata = { title: "Minha conta" };

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;
const lista = (nomes: string[]) => nomes.map((n) => `“${n}”`).join(", ");

// O ConfirmarExclusao chama a ação só com o FormData; excluirMinhaConta segue a
// assinatura do useActionState (estado, formData). A ponte é uma Server Action
// daqui mesmo, sem mudar a regra: a action confere sessão, master e o email.
async function excluir(formData: FormData) {
  "use server";
  return excluirMinhaConta({}, formData);
}

// Minha conta (P-05): uma coluna, um Card por assunto. Com turma, abre dentro
// do menu da turma (o layout cuida disso); "Sair da turma" mora aqui, e não
// mais no início.
export default async function ContaPage() {
  const { user } = await exigirSessao();
  const [impacto, { rows: preferencia }, membro] = await Promise.all([
    getImpactoExclusaoConta(user.id),
    pool.query("select receber_emails from usuarios where id = $1", [user.id]),
    getMembro(),
  ]);
  const recebeEmails: boolean = preferencia[0]?.receber_emails ?? true;
  const master = ehMaster(user);
  const bloqueada = impacto.bloqueiam.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header className="flex items-center gap-3">
        <AvatarUsuario nome={user.name} imagem={user.image} className="size-12" />
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Minha conta</h1>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle nivel={2} className="text-lg">Perfil</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <FormAcao acao={atualizarMeuNome} rotulo="Salvar nome" rotuloPendente="Salvando…">
            <Field>
              <FieldLabel htmlFor="nome">Nome completo</FieldLabel>
              <Input
                id="nome"
                name="nome"
                defaultValue={user.name}
                autoComplete="name"
                maxLength={120}
                className="h-10"
                required
              />
              <FieldDescription className="text-xs">
                É o nome que a turma lê em membros, presença, avisos e tarefas.
              </FieldDescription>
            </Field>
          </FormAcao>
          {/* ADR-0006: só decisões, mudanças no evento e prazos. */}
          <div className="border-t pt-6">
            <SwitchEmailsTurma recebe={recebeEmails} />
          </div>
        </CardContent>
      </Card>

      {membro && (
        <Card>
          <CardHeader>
            <CardTitle nivel={2} className="text-lg">Turma</CardTitle>
            <CardDescription className="text-pretty">
              Você está em <span className="font-medium text-foreground">{membro.turmaNome}</span>. Sair apaga os
              seus votos, dúvidas e resposta de presença desta turma.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormSairTurma />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle nivel={2} className="text-lg">Seus dados</CardTitle>
          <CardDescription className="text-pretty">
            Tudo o que o Formandos guarda sobre você (LGPD, art. 18), para ler, salvar em PDF ou levar a outro
            serviço.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Link href="/conta/meus-dados" className={buttonVariants({ variant: "outline" })}>
              <FileText aria-hidden /> Ver e salvar em PDF
            </Link>
            <Link href="/conta/exportar" download className={buttonVariants({ variant: "ghost" })}>
              <Download aria-hidden /> Baixar JSON
            </Link>
          </div>
          <p className="text-sm text-muted-foreground text-pretty">
            Para acessar, corrigir, anonimizar ou reclamar dos seus dados, fale com o encarregado, {DPO.nome}:{" "}
            <a href={`mailto:${DPO.email}`} className="underline underline-offset-4 hover:text-foreground">
              {DPO.email}
            </a>
            . Leia a{" "}
            <Link href="/privacidade" className="underline underline-offset-4 hover:text-foreground">
              Política de Privacidade
            </Link>{" "}
            e os{" "}
            <Link href="/termos" className="underline underline-offset-4 hover:text-foreground">
              Termos de Uso
            </Link>
            .
          </p>
          {/* Quem mantém o site (ADR-0001). */}
          <p className="text-xs text-muted-foreground">{AVISO_INSTITUCIONAL_CURTO}</p>
        </CardContent>
      </Card>

      <section aria-labelledby="zona-perigo" className="rounded-xl border border-destructive/30 p-4 md:p-6">
        <h2 id="zona-perigo" className="text-lg font-semibold">
          Zona de perigo
        </h2>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          Excluir a conta apaga {plural(impacto.votos, "voto", "votos")},{" "}
          {plural(impacto.duvidas, "dúvida enviada", "dúvidas enviadas")} e a sua participação em todas as turmas.
          {impacto.seriamApagadas.length > 0 &&
            ` Como você é a única pessoa em ${lista(impacto.seriamApagadas)}, ${
              impacto.seriamApagadas.length === 1 ? "essa turma também será apagada" : "essas turmas também serão apagadas"
            }.`}
        </p>
        <div className="mt-4">
          {master && (
            <p role="note" className="rounded-lg border p-3 text-sm text-muted-foreground">
              Contas de administrador master não podem ser excluídas por aqui.
            </p>
          )}
          {!master && bloqueada && (
            <p role="note" className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-pretty">
              Você é o único administrador de {lista(impacto.bloqueiam)}. Promova outro membro a administrador
              antes de excluir a conta.
            </p>
          )}
          {!master && !bloqueada && (
            <ConfirmarExclusao
              acao={excluir}
              campos={{}}
              alvo="a sua conta"
              aviso="A conta e os seus dados são apagados. Não dá para desfazer."
              rotulo="Excluir minha conta"
              icone={<Trash2 aria-hidden />}
              confirmar="Excluir minha conta"
              confirmacao={{
                rotulo: (
                  <>
                    Digite o seu email, <strong className="wrap-break-word">{user.email}</strong>, para confirmar
                  </>
                ),
                esperado: user.email,
              }}
            />
          )}
        </div>
      </section>
    </div>
  );
}
