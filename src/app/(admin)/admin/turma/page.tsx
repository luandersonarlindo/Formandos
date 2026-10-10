import type { Metadata } from "next";
import { Archive, ArchiveRestore, TriangleAlert } from "lucide-react";
import { arquivarTurma, desarquivarTurma, excluirTurmaDoAdmin } from "@/actions/gestao-turma";
import { FormAcao } from "@/components/features/form-acao";
import { FormDialog } from "@/components/features/form-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getResumoExclusao } from "@/lib/admin";
import { exigirAdmin } from "@/lib/dal";

export const metadata: Metadata = { title: "Turma" };

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

export default async function GestaoTurmaPage() {
  const admin = await exigirAdmin();
  const resumo = await getResumoExclusao(admin.turmaId);
  const arquivada = admin.arquivadaEm !== null;

  return (
    <div className="mx-auto w-full max-w-4xl 2xl:max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Turma</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground text-pretty">
        Arquive a turma quando o evento acabar, ou exclua de vez. Vale para os administradores da turma.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <span className="mb-1 flex size-10 items-center justify-center rounded-lg border bg-muted/50 text-[var(--vitrine-a)]">
            {arquivada ? <ArchiveRestore className="size-5" aria-hidden /> : <Archive className="size-5" aria-hidden />}
          </span>
          <CardTitle className="text-lg">{arquivada ? "Turma arquivada" : "Arquivar turma"}</CardTitle>
          <CardDescription className="text-pretty">
            {arquivada
              ? "Todo o registro está guardado e pode ser consultado, mas ninguém consegue alterar nada nem entrar por convite. Desarquive para voltar a editar."
              : "A turma passa a ser só de leitura: todo o registro (votos, dúvidas, tarefas, programação e membros) continua disponível, mas ninguém consegue alterar nada nem entrar por convite. Dá para desarquivar depois."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormDialog
            rotulo={arquivada ? "Desarquivar turma" : "Arquivar turma"}
            icone={
              arquivada ? (
                <ArchiveRestore aria-hidden />
              ) : (
                <Archive aria-hidden />
              )
            }
            titulo={arquivada ? "Desarquivar turma" : "Arquivar turma"}
            descricao={
              arquivada
                ? "A turma volta a permitir alterações e convites."
                : "A turma passa a ser só de leitura: o registro continua disponível, mas ninguém altera nada nem entra por convite. Dá para desarquivar depois."
            }
            acao={arquivada ? desarquivarTurma : arquivarTurma}
            rotuloSubmit={arquivada ? "Desarquivar" : "Arquivar"}
            rotuloPendente="Salvando…"
          />
        </CardContent>
      </Card>

      <Card className="mt-6 border-destructive/30">
        <CardHeader>
          <span className="mb-1 flex size-10 items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10 text-destructive">
            <TriangleAlert className="size-5" aria-hidden />
          </span>
          <CardTitle className="text-lg">Excluir turma</CardTitle>
          <CardDescription className="text-pretty">
            Apaga a turma de vez para todos: {plural(resumo.membros, "membro", "membros")},{" "}
            {plural(resumo.votos, "voto", "votos")}, {plural(resumo.duvidas, "dúvida", "dúvidas")},{" "}
            {plural(resumo.tarefas, "tarefa", "tarefas")} e {plural(resumo.catalogos, "catálogo personalizado", "catálogos personalizados")}.
            Não dá para desfazer. Se só quer guardar o registro, arquive.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormAcao
            acao={excluirTurmaDoAdmin}
            rotulo="Excluir turma"
            rotuloPendente="Excluindo…"
            variante="destructive"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmacao" className="block leading-normal">
                Digite o nome da turma, <strong className="wrap-break-word">{admin.turmaNome}</strong>,
                para confirmar
              </Label>
              <Input id="confirmacao" name="confirmacao" autoComplete="off" className="h-10" required />
            </div>
          </FormAcao>
        </CardContent>
      </Card>
    </div>
  );
}
