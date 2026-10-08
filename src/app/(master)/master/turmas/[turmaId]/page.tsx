import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Info,
  KeyRound,
  ShieldCheck,
  ShieldOff,
  TriangleAlert,
  UserMinus,
  Users,
} from "lucide-react";
import { notFound } from "next/navigation";
import { z } from "zod";
import {
  alterarPapelMaster,
  excluirTurma,
  removerMembroMaster,
} from "@/actions/master";
import { AvatarUsuario } from "@/components/features/avatar-usuario";
import { ConfirmarExclusao } from "@/components/features/confirmar-exclusao";
import { FormDialog } from "@/components/features/form-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { exigirMaster } from "@/lib/dal";
import { getTurma } from "@/lib/plataforma";

export const metadata: Metadata = { title: "Turma" };

export default async function TurmaMasterPage(
  props: PageProps<"/master/turmas/[turmaId]">,
) {
  const master = await exigirMaster();
  const { turmaId } = await props.params;
  if (!z.uuid().safeParse(turmaId).success) notFound();
  const turma = await getTurma(turmaId);
  if (!turma) notFound();
  const totalAdmins = turma.membros.filter((m) => m.papel === "admin").length;

  return (
    <div className="mx-auto w-full max-w-4xl 2xl:max-w-6xl">
      <Link
        href="/master/turmas"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden /> Todas as turmas
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">{turma.nome}</h1>
      <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <span className="inline-flex flex-wrap items-center gap-2">
          <KeyRound className="size-4 text-[var(--vitrine-a)]" aria-hidden />
          Código de convite:
          <span className="rounded-md border bg-muted/50 px-2 py-0.5 font-mono tracking-widest text-foreground">
            {turma.codigo}
          </span>
        </span>
        {turma.criador && <span>Criada por {turma.criador}</span>}
      </p>

      <h2 className="mt-8 flex items-center gap-2 text-lg font-semibold">
        <Users className="size-5 text-[var(--vitrine-a)]" aria-hidden />
        Membros ({turma.membros.length})
      </h2>
      <ul data-grupo className="mt-3 grid gap-3">
        {turma.membros.map((m) => {
          const ultimoAdmin = m.papel === "admin" && totalAdmins === 1;
          return (
            <li key={m.id}>
              <Card>
                <CardContent className="flex flex-wrap items-center gap-x-4 gap-y-3">
                  <div className="flex min-w-0 flex-1 basis-56 items-center gap-3">
                    <AvatarUsuario nome={m.name} imagem={m.image} className="size-10" />
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-x-2 text-sm font-medium">
                        <span className="truncate">{m.name}</span>
                        {m.id === master.id && <span className="font-normal text-muted-foreground">(você)</span>}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                    <Badge variant={m.papel === "admin" ? "default" : "secondary"}>
                      {m.papel === "admin" ? "Administrador" : "Participante"}
                    </Badge>
                    {!ultimoAdmin && (
                      <>
                        <FormDialog
                          rotulo={
                            m.papel === "admin" ? "Tornar participante" : "Promover"
                          }
                          icone={
                            m.papel === "admin" ? (
                              <ShieldOff aria-hidden />
                            ) : (
                              <ShieldCheck aria-hidden />
                            )
                          }
                          titulo="Trocar papel"
                          descricao={
                            m.papel === "admin"
                              ? `${m.name} deixa de ser administrador e vira participante.`
                              : `Promover ${m.name} a administrador.`
                          }
                          acao={alterarPapelMaster}
                          campos={{
                            turmaId: turma.id,
                            usuarioId: m.id,
                            papel: m.papel === "admin" ? "participante" : "admin",
                          }}
                          rotuloSubmit="Trocar papel"
                          rotuloPendente="Salvando…"
                        />
                        <ConfirmarExclusao
                          acao={removerMembroMaster}
                          campos={{ turmaId: turma.id, usuarioId: m.id }}
                          alvo="o membro"
                          verb="Remover"
                          nome={m.name}
                          aviso={m.papel === "admin" ? "" : "Ele perde o acesso à turma."}
                          rotulo="Remover"
                          descricao={`Remover ${m.name} da turma`}
                          icone={<UserMinus aria-hidden />}
                          confirmar="Sim, remover"
                        />
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
      {turma.membros.length > 0 && totalAdmins === 1 && (
        <p className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          O único administrador da turma não pode ser rebaixado nem removido. Promova outro membro antes, ou exclua a turma.
        </p>
      )}

      <Card className="mt-8 border border-dashed border-destructive/50 bg-transparent ring-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-destructive">
            <TriangleAlert className="size-5" aria-hidden /> Excluir turma
          </CardTitle>
          <CardDescription>
            Apaga a turma e tudo o que é dela: membros, catálogos, votos, dúvidas, tarefas e fornecedores. Não dá para desfazer. As contas dos usuários continuam existindo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConfirmarExclusao
            acao={excluirTurma}
            campos={{ turmaId: turma.id }}
            alvo="a turma"
            nome={turma.nome}
            aviso="Apaga a turma e tudo o que é dela: membros, catálogos, votos, dúvidas, tarefas e fornecedores. Não dá para desfazer. As contas dos usuários continuam existindo."
            rotulo="Excluir turma"
            descricao="Excluir a turma"
            confirmacao={{
              rotulo: (
                <>
                  Digite o nome da turma (<strong>{turma.nome}</strong>) para confirmar
                </>
              ),
              esperado: turma.nome,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
