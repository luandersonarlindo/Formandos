import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import {
  alterarPapelMaster,
  excluirTurma,
  removerMembroMaster,
} from "@/actions/master";
import { FormAcao } from "@/components/features/form-acao";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="mx-auto w-full max-w-3xl">
      <Link href="/master/turmas" className="text-sm text-muted-foreground hover:text-foreground">
        ← Todas as turmas
      </Link>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">{turma.nome}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Código de convite: <span className="font-mono">{turma.codigo}</span>
        {turma.criador ? ` · criada por ${turma.criador}` : ""}
      </p>

      <h2 className="mt-8 text-lg font-semibold">
        Membros ({turma.membros.length})
      </h2>
      <ul className="mt-3 divide-y rounded-lg border">
        {turma.membros.map((m) => {
          const ultimoAdmin = m.papel === "admin" && totalAdmins === 1;
          return (
            <li key={m.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              {m.image && (
                <img src={m.image} alt="" referrerPolicy="no-referrer" className="size-9 rounded-full" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {m.name}
                  {m.id === master.id && <span className="text-muted-foreground"> (você)</span>}
                </p>
                <p className="truncate text-xs text-muted-foreground">{m.email}</p>
              </div>
              <Badge variant={m.papel === "admin" ? "default" : "secondary"}>
                {m.papel === "admin" ? "Administrador" : "Participante"}
              </Badge>
              {!ultimoAdmin && (
                <>
                  <form action={alterarPapelMaster}>
                    <input type="hidden" name="turmaId" value={turma.id} />
                    <input type="hidden" name="usuarioId" value={m.id} />
                    <input type="hidden" name="papel" value={m.papel === "admin" ? "participante" : "admin"} />
                    <Button type="submit" variant="outline" size="sm">
                      {m.papel === "admin" ? "Tornar participante" : "Promover"}
                    </Button>
                  </form>
                  <form action={removerMembroMaster}>
                    <input type="hidden" name="turmaId" value={turma.id} />
                    <input type="hidden" name="usuarioId" value={m.id} />
                    <Button type="submit" variant="destructive" size="sm">
                      Remover
                    </Button>
                  </form>
                </>
              )}
            </li>
          );
        })}
      </ul>
      {turma.membros.length > 0 && totalAdmins === 1 && (
        <p className="mt-2 text-xs text-muted-foreground">
          O único administrador da turma não pode ser rebaixado nem removido. Promova outro membro antes, ou exclua a turma.
        </p>
      )}

      <Card className="mt-8 border-destructive/50">
        <CardHeader>
          <CardTitle>Excluir turma</CardTitle>
          <CardDescription>
            Apaga a turma e tudo o que é dela: membros, catálogos, votos, dúvidas, tarefas e fornecedores. Não dá para desfazer. As contas dos usuários continuam existindo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormAcao acao={excluirTurma} rotulo="Excluir turma" rotuloPendente="Excluindo…" variante="destructive">
            <input type="hidden" name="turmaId" value={turma.id} />
            <Label htmlFor="confirmacao">
              Digite o nome da turma (<strong>{turma.nome}</strong>) para confirmar
            </Label>
            <Input id="confirmacao" name="confirmacao" autoComplete="off" required />
          </FormAcao>
        </CardContent>
      </Card>
    </div>
  );
}
