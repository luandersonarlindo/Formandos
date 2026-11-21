import type { Metadata } from "next";
import { CalendarRange, Pencil, ScrollText } from "lucide-react";
import { atualizarParcela, salvarPlano, salvarRegrasDinheiro } from "@/actions/tesouraria";
import { AbasTesouraria } from "@/components/features/abas-tesouraria";
import { CabecalhoPagina } from "@/components/features/cabecalho-pagina";
import { FormDialog } from "@/components/features/form-dialog";
import { FormImportarPagamentos } from "@/components/features/form-importar-pagamentos";
import { PainelRecolhivel } from "@/components/features/painel-recolhivel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { exigirTesouraria } from "@/lib/dal";
import { formatarReal } from "@/lib/orcamento";
import { getCaixa, getPlano } from "@/lib/pagamentos";
import { dataBr, hojeBrasil } from "@/lib/situacao-regras";

export const metadata: Metadata = { title: "Plano e regras" };

// Tesouraria, aba "Plano e regras" (D-12 do plano de UX): o que se monta uma vez
// e quase não se mexe. Plano de parcelas, regras do dinheiro e a importação da
// planilha saíram da aba Membros, onde ficavam empilhados antes da lista.
// Mesmo guard da tesouraria (exigirTesouraria).
export default async function PlanoTesourariaPage() {
  const tesouraria = await exigirTesouraria();
  const hoje = hojeBrasil();
  const editavel = !tesouraria.arquivadaEm;
  const [plano, caixa] = await Promise.all([getPlano(tesouraria.turmaId), getCaixa(tesouraria.turmaId)]);
  const totalPlano = plano.reduce((s, p) => s + p.valor, 0);

  return (
    <div className="mx-auto w-full max-w-4xl 2xl:max-w-6xl">
      <CabecalhoPagina titulo="Tesouraria" descricao="Plano de parcelas, regras do dinheiro e importação da planilha." />
      <AbasTesouraria atual="plano" />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle nivel={2} className="flex items-center gap-2 text-lg">
            <CalendarRange className="size-5 text-muted-foreground" aria-hidden /> Plano de parcelas
          </CardTitle>
          <CardDescription className="text-pretty">
            {plano.length === 0
              ? "Ainda não há plano. Monte as parcelas que cada pessoa vai pagar."
              : `${plano.length} ${plano.length === 1 ? "parcela" : "parcelas"}, ${formatarReal.format(totalPlano)} por pessoa. Igual para todos. A 1ª vence em ${dataBr(plano[0].vencimento)}.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-3">
          {editavel && (
            <FormDialog
              rotulo={plano.length === 0 ? "Montar plano" : "Refazer plano"}
              icone={<CalendarRange aria-hidden />}
              variante={plano.length === 0 ? "default" : "outline"}
              titulo={plano.length === 0 ? "Montar plano de parcelas" : "Refazer o plano"}
              descricao={
                plano.length === 0
                  ? "Parcelas mensais de mesmo valor. Depois dá para ajustar uma por uma."
                  : "Troca todas as parcelas. Os pagamentos já lançados continuam e são recalculados no plano novo."
              }
              acao={salvarPlano}
              rotuloSubmit="Salvar plano"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="plano-quantidade">Quantas parcelas</FieldLabel>
                  <Input id="plano-quantidade" name="quantidade" type="number" min={1} max={60} inputMode="numeric" defaultValue={plano.length || 10} required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="plano-valor">Valor de cada uma (R$)</FieldLabel>
                  <Input id="plano-valor" name="valor" inputMode="decimal" placeholder="150,00" required />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="plano-primeira">Vencimento da primeira</FieldLabel>
                <Input id="plano-primeira" name="primeira" type="date" defaultValue={plano[0]?.vencimento ?? hoje} required />
                <FieldDescription className="text-xs">As outras vencem no mesmo dia dos meses seguintes.</FieldDescription>
              </Field>
            </FormDialog>
          )}
          {plano.length > 0 && (
            <>
              {/* Até 60 parcelas: o resumo acima basta no dia a dia, e a tabela
                  abre só quando precisa ajustar uma. */}
              <PainelRecolhivel id="parcelas-plano" className="w-full">
                <summary className="w-fit cursor-pointer text-sm font-medium underline-offset-4 hover:underline pointer-coarse:min-h-11 pointer-coarse:content-center">
                  Ver as {plano.length} parcelas
                </summary>
                <Table className="mt-2 tabular-nums">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parcela</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      {editavel && <TableHead className="w-0"><span className="sr-only">Ações</span></TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plano.map((p) => (
                      <TableRow key={p.numero}>
                        <TableCell className="font-medium">{p.numero}</TableCell>
                        <TableCell className="text-right">{formatarReal.format(p.valor)}</TableCell>
                        <TableCell>{dataBr(p.vencimento)}</TableCell>
                        {editavel && (
                          <TableCell className="text-right">
                            <FormDialog
                              rotulo="Ajustar"
                              icone={<Pencil aria-hidden />}
                              variante="ghost"
                              titulo={`Ajustar parcela ${p.numero}`}
                              descricao="A mudança vale para todos e fica registrada no histórico do plano."
                              acao={atualizarParcela}
                              campos={{ numero: String(p.numero) }}
                              rotuloSubmit="Salvar parcela"
                            >
                              <Field>
                                <FieldLabel htmlFor={`parcela-valor-${p.numero}`}>Valor (R$)</FieldLabel>
                                <Input
                                  id={`parcela-valor-${p.numero}`}
                                  name="valor"
                                  inputMode="decimal"
                                  defaultValue={p.valor.toFixed(2).replace(".", ",")}
                                  required
                                />
                              </Field>
                              <Field>
                                <FieldLabel htmlFor={`parcela-venc-${p.numero}`}>Vencimento</FieldLabel>
                                <Input id={`parcela-venc-${p.numero}`} name="vencimento" type="date" defaultValue={p.vencimento} required />
                              </Field>
                            </FormDialog>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </PainelRecolhivel>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle nivel={2} className="flex items-center gap-2 text-lg">
            <ScrollText className="size-5 text-muted-foreground" aria-hidden /> Regras do dinheiro
          </CardTitle>
          <CardDescription>Desistência, devolução e multa. A turma lê este texto em “Minha situação”.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-3">
          <p className="whitespace-pre-wrap text-sm wrap-break-word">
            {caixa.regrasDinheiro || (
              <span className="text-muted-foreground">Nenhuma regra escrita ainda.</span>
            )}
          </p>
          {editavel && (
            <FormDialog
              rotulo={caixa.regrasDinheiro ? "Editar regras do dinheiro" : "Escrever regras do dinheiro"}
              icone={<Pencil aria-hidden />}
              titulo="Regras do dinheiro"
              descricao="Desistência, devolução e multa. A turma lê este texto em “Minha situação”."
              acao={salvarRegrasDinheiro}
              rotuloSubmit="Salvar regras"
              dialogClassName="sm:max-w-xl"
            >
              <Field>
                <FieldLabel htmlFor="regras-dinheiro">Texto</FieldLabel>
                <Textarea
                  id="regras-dinheiro"
                  name="regras"
                  rows={8}
                  maxLength={2000}
                  defaultValue={caixa.regrasDinheiro}
                  placeholder="Ex.: quem desistir até 31/03 recebe de volta o que pagou, menos a parte já gasta com o espaço."
                />
              </Field>
            </FormDialog>
          )}
        </CardContent>
      </Card>

      {editavel && (
        <Card id="importar" className="mt-4 scroll-mt-20">
          <CardHeader>
            <CardTitle nivel={2} className="text-lg">Importar da planilha</CardTitle>
            <CardDescription className="text-pretty">
              Traga de uma vez os pagamentos que já estão na sua planilha. Entram como confirmados. Com qualquer
              linha com problema, nada é importado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormImportarPagamentos />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
