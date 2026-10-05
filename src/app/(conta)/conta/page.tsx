import type { Metadata } from "next";
import { TriangleAlert } from "lucide-react";
import { excluirMinhaConta, atualizarMeuNome } from "@/actions/conta";
import { AvatarUsuario } from "@/components/features/avatar-usuario";
import { FormAcao } from "@/components/features/form-acao";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { exigirSessao } from "@/lib/dal";
import { ehMaster } from "@/lib/master";
import { getImpactoExclusaoConta } from "@/lib/usuarios";

export const metadata: Metadata = { title: "Minha conta" };

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;
const lista = (nomes: string[]) => nomes.map((n) => `“${n}”`).join(", ");

export default async function ContaPage() {
  const { user } = await exigirSessao();
  const impacto = await getImpactoExclusaoConta(user.id);
  const master = ehMaster(user);
  const bloqueada = impacto.bloqueiam.length > 0;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Minha conta</h1>
      <div className="mt-4 flex items-center gap-3">
        <AvatarUsuario nome={user.name} imagem={user.image} className="size-12" />
        <div className="min-w-0">
          <p className="truncate font-medium">{user.name}</p>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Dados</CardTitle>
          <CardDescription className="text-pretty">
            É este nome que a sua turma lê em membros, presença, avisos e tarefas. Ele não precisa
            ser igual ao seu email, e você pode corrigir quando quiser.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormAcao
            acao={atualizarMeuNome}
            rotulo="Salvar nome"
            rotuloPendente="Salvando…"
            className="max-w-md"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nome">Nome completo</Label>
              <Input
                id="nome"
                name="nome"
                defaultValue={user.name}
                autoComplete="name"
                maxLength={120}
                className="h-10"
                required
              />
              <p className="text-xs text-muted-foreground">Até 120 caracteres.</p>
            </div>
          </FormAcao>
        </CardContent>
      </Card>

      <Card className="mt-8 border-destructive/30">
        <CardHeader>
          <span className="mb-1 flex size-10 items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10 text-destructive">
            <TriangleAlert className="size-5" aria-hidden />
          </span>
          <CardTitle className="text-lg">Excluir minha conta</CardTitle>
          <CardDescription className="text-pretty">
            Apaga a sua conta e os seus dados: {plural(impacto.votos, "voto", "votos")} e{" "}
            {plural(impacto.duvidas, "dúvida enviada", "dúvidas enviadas")}, além da sua participação em todas as
            turmas. Não dá para desfazer.
            {impacto.seriamApagadas.length > 0 &&
              ` Como você é a única pessoa em ${lista(impacto.seriamApagadas)}, ${
                impacto.seriamApagadas.length === 1 ? "essa turma também será apagada" : "essas turmas também serão apagadas"
              }.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {master && (
            <p role="note" className="rounded-lg border p-3 text-sm text-muted-foreground">
              Contas de administrador master não podem ser excluídas por aqui.
            </p>
          )}
          {!master && bloqueada && (
            <p role="note" className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-pretty">
              Você é o único administrador de {lista(impacto.bloqueiam)}. Promova outro membro a administrador
              antes de excluir a conta.
            </p>
          )}
          {!master && !bloqueada && (
            <FormAcao
              acao={excluirMinhaConta}
              rotulo="Excluir minha conta"
              rotuloPendente="Excluindo…"
              variante="destructive"
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirmacao" className="leading-normal">
                  Digite o seu email, <strong>{user.email}</strong>, para confirmar
                </Label>
                <Input id="confirmacao" name="confirmacao" autoComplete="off" className="h-10" required />
              </div>
            </FormAcao>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
