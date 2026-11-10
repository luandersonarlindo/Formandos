import type { Metadata } from "next";
import Link from "next/link";
import { Archive, ArchiveRestore, CalendarClock, FileDown, FileText, History, TriangleAlert } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ROTULO_EXPORTACAO, TIPOS_EXPORTACAO } from "@/lib/exportacao";
import { arquivarTurma, desarquivarTurma, excluirTurmaDoAdmin, mudarPrazoExclusao } from "@/actions/gestao-turma";
import { CampoPrazoExclusao } from "@/components/features/campo-prazo-exclusao";
import { FormAcao } from "@/components/features/form-acao";
import { FormDialog } from "@/components/features/form-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getResumoExclusao } from "@/lib/admin";
import { exigirAdmin } from "@/lib/dal";
import { diasAte } from "@/lib/fim-da-turma-regras";
import { dataBr, hojeBrasil } from "@/lib/situacao-regras";

export const metadata: Metadata = { title: "Turma" };

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

export default async function GestaoTurmaPage() {
  const admin = await exigirAdmin();
  const resumo = await getResumoExclusao(admin.turmaId);
  const arquivada = admin.arquivadaEm !== null;
  const hoje = hojeBrasil();
  const excluirEm = admin.excluirEm;
  const faltam = excluirEm ? diasAte(hoje, excluirEm) : 0;

  return (
    <div className="mx-auto w-full max-w-4xl 2xl:max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Turma</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground text-pretty">
        Arquive a turma quando o evento acabar, ou exclua de vez. Vale para os administradores da turma.
      </p>

      {/* ADR-0007: o registro sai do site, para prestar contas e guardar. */}
      <Card className="mt-6">
        <CardHeader>
          <span className="mb-1 flex size-10 items-center justify-center rounded-lg border bg-muted/50 text-[var(--vitrine-a)]">
            <FileDown className="size-5" aria-hidden />
          </span>
          <CardTitle className="text-lg">Exportar o registro da turma</CardTitle>
          <CardDescription className="text-pretty">
            O registro em PDF traz decisões, resultados, presença, fornecedores, caixa e histórico, sem dados
            pessoais além dos nomes da comissão: dá para repassar à turma. As planilhas trazem o detalhe e ficam
            com a comissão. Cada download fica registrado.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/turma/registro" className={buttonVariants()}>
              <FileText aria-hidden /> Ver e salvar o registro em PDF
            </Link>
            <Link href="/admin/turma/historico" className={buttonVariants({ variant: "outline" })}>
              <History aria-hidden /> Histórico: quem mudou o quê
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {TIPOS_EXPORTACAO.filter((t) => t !== "pagamentos" || admin.tesouraria).map((t) => (
              <a
                key={t}
                href={`/admin/turma/exportar?tipo=${t}`}
                download
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <FileDown aria-hidden /> {ROTULO_EXPORTACAO[t]} (planilha)
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <span className="mb-1 flex size-10 items-center justify-center rounded-lg border bg-muted/50 text-[var(--vitrine-a)]">
            {arquivada ? <ArchiveRestore className="size-5" aria-hidden /> : <Archive className="size-5" aria-hidden />}
          </span>
          <CardTitle className="text-lg">{arquivada ? "Turma arquivada" : "Arquivar turma"}</CardTitle>
          <CardDescription className="text-pretty">
            {arquivada
              ? "Ninguém altera nada nem entra por convite. O registro pode ser consultado e exportado até a data de exclusão. Desarquive para voltar a editar e cancelar a exclusão."
              : "Quando o evento acabar, arquive a turma: ninguém altera mais nada nem entra por convite, e você escolhe em quantos dias tudo será excluído (30 a 180). Até lá, o registro pode ser consultado e exportado. Dá para desarquivar."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {arquivada && excluirEm && (
            <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-pretty">
              Tudo será excluído em <strong className="font-medium">{dataBr(excluirEm)}</strong> (
              {faltam <= 0 ? "hoje" : faltam === 1 ? "falta 1 dia" : `faltam ${faltam} dias`}). Os membros recebem um
              email 7 dias antes. Exporte o registro antes dessa data.
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {arquivada ? (
              <>
                <FormDialog
                  rotulo="Mudar a data de exclusão"
                  icone={<CalendarClock aria-hidden />}
                  titulo="Mudar a data de exclusão"
                  descricao="A nova data conta a partir de hoje. Os membros recebem um email com a data nova."
                  acao={mudarPrazoExclusao}
                  rotuloSubmit="Mudar a data"
                >
                  <CampoPrazoExclusao hoje={hoje} />
                </FormDialog>
                <FormDialog
                  rotulo="Desarquivar turma"
                  icone={<ArchiveRestore aria-hidden />}
                  titulo="Desarquivar turma"
                  descricao="A turma volta a permitir alterações e convites, e a data de exclusão é cancelada."
                  acao={desarquivarTurma}
                  rotuloSubmit="Desarquivar"
                />
              </>
            ) : (
              <FormDialog
                rotulo="Arquivar turma"
                icone={<Archive aria-hidden />}
                titulo="Arquivar turma"
                descricao="Ninguém altera mais nada nem entra por convite. Antes da data, exporte o registro da turma (card acima): depois dela, nada pode ser recuperado."
                acao={arquivarTurma}
                rotuloSubmit="Arquivar"
              >
                <CampoPrazoExclusao hoje={hoje} />
              </FormDialog>
            )}
          </div>
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
