import type { Metadata } from "next";
import Link from "next/link";
import { Archive, ArchiveRestore, CalendarClock, FileDown, FileText, TriangleAlert } from "lucide-react";
import { ROTULO_EXPORTACAO, TIPOS_EXPORTACAO, TIPOS_SO_TESOURARIA } from "@/lib/exportacao";
import { arquivarTurma, desarquivarTurma, excluirTurmaDoAdmin, mudarPrazoExclusao } from "@/actions/gestao-turma";
import { AbasTurma } from "@/components/features/abas-turma";
import { CabecalhoPagina } from "@/components/features/cabecalho-pagina";
import { CampoPrazoExclusao } from "@/components/features/campo-prazo-exclusao";
import { ConfirmarExclusao } from "@/components/features/confirmar-exclusao";
import { FormDialog } from "@/components/features/form-dialog";
import { AcaoLink, MenuAcoes } from "@/components/features/menu-acoes";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getResumoExclusao } from "@/lib/admin";
import { exigirAdmin } from "@/lib/dal";
import { diasAte } from "@/lib/fim-da-turma-regras";
import { dataBr, hojeBrasil } from "@/lib/situacao-regras";

export const metadata: Metadata = { title: "Turma" };

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

// A exclusão volta para outra turma (redirect) ou devolve o erro; o
// ConfirmarExclusao chama a action só com o formulário.
async function excluirTurma(dados: FormData) {
  "use server";
  return excluirTurmaDoAdmin({}, dados);
}

// Registro, planilhas e o fim da turma. As nove planilhas eram nove botões que
// pesavam mais que o PDF; agora ficam num menu "Baixar planilha". Arquivar e
// excluir moram numa "zona de perigo" no fim, e o nome da turma só é pedido
// dentro da confirmação.
export default async function GestaoTurmaPage() {
  const admin = await exigirAdmin();
  const resumo = await getResumoExclusao(admin.turmaId);
  const arquivada = admin.arquivadaEm !== null;
  const hoje = hojeBrasil();
  const excluirEm = admin.excluirEm;
  const faltam = excluirEm ? diasAte(hoje, excluirEm) : 0;
  const planilhas = TIPOS_EXPORTACAO.filter((t) => !TIPOS_SO_TESOURARIA.includes(t) || admin.tesouraria);

  return (
    <div className="mx-auto w-full max-w-4xl 2xl:max-w-6xl">
      <CabecalhoPagina
        titulo="Turma"
        descricao="O registro da turma para prestar contas e guardar, e o que fazer quando o evento acabar."
        acao={
          <Button asChild>
            <Link href="/registro">
              <FileText aria-hidden /> Ver e salvar o registro em PDF
            </Link>
          </Button>
        }
      />
      <AbasTurma atual="turma" />

      {/* ADR-0007: o registro sai do site, para prestar contas e guardar. */}
      <section aria-labelledby="titulo-planilhas" className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3">
        <div className="min-w-0 flex-1 basis-64">
          <h2 id="titulo-planilhas" className="font-medium">
            Planilhas
          </h2>
          <p className="text-sm text-muted-foreground text-pretty">
            O detalhe de cada assunto, para a comissão. O PDF não tem dados pessoais além dos nomes da comissão e
            pode ir para a turma. Cada download fica registrado.
          </p>
        </div>
        {/* Os itens continuam <a download>: o download e o registro na auditoria
            dependem do link de verdade. */}
        <MenuAcoes nome="registro da turma" rotulo="Baixar planilha" icone={<FileDown aria-hidden />}>
          {planilhas.map((t) => (
            <AcaoLink key={t} href={`/admin/turma/exportar?tipo=${t}`} download>
              {ROTULO_EXPORTACAO[t]}
            </AcaoLink>
          ))}
        </MenuAcoes>
      </section>

      <h2 className="mt-10 text-lg font-semibold">Fim da turma</h2>
      <Card className="mt-3">
        <CardHeader>
          <CardTitle nivel={3} className="text-base">
            {arquivada ? "Turma arquivada" : "Arquivar turma"}
          </CardTitle>
          <CardDescription className="text-pretty">
            {arquivada
              ? "Ninguém altera nada nem entra por convite. O registro pode ser consultado e exportado até a data de exclusão."
              : "Quando o evento acabar: ninguém altera mais nada e o registro fica para consulta até a data de exclusão. Dá para desarquivar."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {arquivada && excluirEm && (
            <Alert role="status">
              <TriangleAlert aria-hidden className="text-warning" />
              <AlertDescription className="text-pretty text-foreground">
                <p>
                  Tudo será excluído em <strong className="font-medium">{dataBr(excluirEm)}</strong> (
                  {faltam <= 0 ? "hoje" : faltam === 1 ? "falta 1 dia" : `faltam ${faltam} dias`}). Os membros recebem
                  um email 7 dias antes. Exporte o registro antes dessa data.
                </p>
              </AlertDescription>
            </Alert>
          )}
          <div className="flex flex-wrap gap-2">
            {arquivada ? (
              <>
                <FormDialog
                  rotulo="Desarquivar turma"
                  icone={<ArchiveRestore aria-hidden />}
                  tamanho="default"
                  titulo="Desarquivar turma"
                  descricao="A turma volta a permitir alterações e convites, e a data de exclusão é cancelada."
                  acao={desarquivarTurma}
                  rotuloSubmit="Desarquivar"
                />
                <FormDialog
                  rotulo="Mudar a data de exclusão"
                  icone={<CalendarClock aria-hidden />}
                  variante="ghost"
                  tamanho="default"
                  titulo="Mudar a data de exclusão"
                  descricao="A nova data conta a partir de hoje. Os membros recebem um email com a data nova."
                  acao={mudarPrazoExclusao}
                  rotuloSubmit="Mudar a data"
                >
                  <CampoPrazoExclusao hoje={hoje} />
                </FormDialog>
              </>
            ) : (
              <FormDialog
                rotulo="Arquivar turma"
                icone={<Archive aria-hidden />}
                tamanho="default"
                titulo="Arquivar turma"
                descricao="Ninguém altera mais nada nem entra por convite, e você escolhe em quantos dias tudo será excluído (30 a 180). Antes da data, baixe o registro: depois dela, nada pode ser recuperado."
                acao={arquivarTurma}
                rotuloSubmit="Arquivar"
              >
                <CampoPrazoExclusao hoje={hoje} />
              </FormDialog>
            )}
          </div>
        </CardContent>
      </Card>

      <section
        aria-labelledby="titulo-excluir"
        className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 px-4 py-3"
      >
        <div className="min-w-0 flex-1 basis-64">
          <h3 id="titulo-excluir" className="font-medium">
            Excluir turma
          </h3>
          <p className="text-sm text-muted-foreground text-pretty">
            Apaga a turma de vez para todos. Se só quer guardar o registro, arquive.
          </p>
        </div>
        <ConfirmarExclusao
          acao={excluirTurma}
          campos={{}}
          alvo="a turma"
          nome={admin.turmaNome}
          aviso={`Some para todos: ${plural(resumo.membros, "membro", "membros")}, ${plural(resumo.votos, "voto", "votos")}, ${plural(resumo.duvidas, "dúvida", "dúvidas")}, ${plural(resumo.tarefas, "tarefa", "tarefas")} e ${plural(resumo.catalogos, "catálogo personalizado", "catálogos personalizados")}. Não dá para desfazer.`}
          rotulo="Excluir turma"
          confirmacao={{
            rotulo: (
              <>
                Digite o nome da turma, <strong className="wrap-break-word">{admin.turmaNome}</strong>, para confirmar
              </>
            ),
            esperado: admin.turmaNome,
          }}
        />
      </section>
    </div>
  );
}
