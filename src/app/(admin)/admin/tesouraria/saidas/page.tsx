import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Pencil, Plus, Receipt, Store, Trash2 } from "lucide-react";
import { editarSaida, excluirSaida, lancarSaida } from "@/actions/saidas";
import { CamposSaida } from "@/components/features/campos-saida";
import { ConfirmarExclusao } from "@/components/features/confirmar-exclusao";
import { FormDialog } from "@/components/features/form-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { exigirTesouraria } from "@/lib/dal";
import { formatarReal } from "@/lib/orcamento";
import { getCaixa } from "@/lib/pagamentos";
import { getSaidasDaTesouraria } from "@/lib/saidas";
import { FRASE_SALDO } from "@/lib/saidas-regras";
import { dataBr, hojeBrasil } from "@/lib/situacao-regras";

export const metadata: Metadata = { title: "Saídas do caixa" };

// Saídas do caixa (ADR-0022): o que a tesouraria pagou em nome da turma. Só a
// tesouraria lança e vê a referência; a turma vê cada saída em "Minha
// situação" e no registro, com "Outras despesas" no lugar das só da comissão.
export default async function SaidasPage() {
  const tesouraria = await exigirTesouraria();
  const editavel = !tesouraria.arquivadaEm;
  const hoje = hojeBrasil();
  const [{ saidas, fornecedores, porFornecedor }, caixa] = await Promise.all([
    getSaidasDaTesouraria(tesouraria.turmaId),
    getCaixa(tesouraria.turmaId),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Link
        href="/admin/tesouraria"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden /> Tesouraria
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">Saídas do caixa</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground text-pretty">
        Lance aqui o que foi pago em nome da turma, depois de conferir no extrato. A turma vê cada saída, sem a
        referência.
      </p>

      <Card className="vitrine-fundo-hero mt-6">
        <CardHeader>
          <CardDescription>Saldo</CardDescription>
          <CardTitle className="text-3xl tabular-nums">{formatarReal.format(caixa.saldo)}</CardTitle>
          <dl className="mt-1 grid gap-x-4 gap-y-1 text-sm tabular-nums sm:grid-cols-[auto_1fr]">
            <dt className="text-muted-foreground">Pagamentos confirmados pela tesouraria</dt>
            <dd>{formatarReal.format(caixa.arrecadado)}</dd>
            <dt className="text-muted-foreground">Saídas lançadas</dt>
            <dd>{formatarReal.format(caixa.saidas)}</dd>
          </dl>
          <p className="mt-1 text-xs text-muted-foreground">{FRASE_SALDO}</p>
        </CardHeader>
        {editavel && (
          <CardContent>
            <FormDialog
              rotulo="Lançar saída"
              icone={<Plus aria-hidden />}
              variante="default"
              titulo="Lançar saída"
              descricao="O que a turma pagou: sinal, parcela de fornecedor, tarifa."
              acao={lancarSaida}
              rotuloSubmit="Lançar saída"
            >
              <CamposSaida prefixo="nova-saida" hoje={hoje} fornecedores={fornecedores} />
            </FormDialog>
          </CardContent>
        )}
      </Card>

      {porFornecedor.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle nivel={2} className="flex items-center gap-2 text-lg">
              <Store className="size-5 text-[var(--vitrine-a)]" aria-hidden /> Por fornecedor
            </CardTitle>
            <CardDescription>
              Contratado é o valor orçado no cadastro do fornecedor. Só a comissão vê esta parte.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm tabular-nums">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th scope="col" className="py-1.5 pr-2 font-medium">Fornecedor</th>
                    <th scope="col" className="py-1.5 pr-2 text-right font-medium">Contratado</th>
                    <th scope="col" className="py-1.5 pr-2 text-right font-medium">Pago</th>
                    <th scope="col" className="py-1.5 text-right font-medium">Falta</th>
                  </tr>
                </thead>
                <tbody>
                  {porFornecedor.map((f) => (
                    <tr key={f.id} className="border-b last:border-0">
                      <td className="py-1.5 pr-2">{f.nome}</td>
                      <td className="py-1.5 pr-2 text-right">{f.contratado === null ? "—" : formatarReal.format(f.contratado)}</td>
                      <td className="py-1.5 pr-2 text-right">{formatarReal.format(f.pago)}</td>
                      <td className="py-1.5 text-right">{f.falta === null ? "—" : formatarReal.format(f.falta)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mt-4">
        <CardHeader>
          <CardTitle nivel={2} className="flex items-center gap-2 text-lg">
            <Receipt className="size-5 text-[var(--vitrine-a)]" aria-hidden /> Saídas ({saidas.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {saidas.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma saída lançada. Sem saídas, a turma vê só o que entrou.</p>
          ) : (
            <ul className="flex flex-col divide-y">
              {saidas.map((s) => (
                <li key={s.id} data-saida={s.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium wrap-break-word">
                      {s.descricao}
                      {s.soComissao && (
                        <Badge variant="outline" className="ml-2 align-middle">
                          só da comissão
                        </Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground wrap-break-word">
                      {dataBr(s.pagoEm)}
                      {s.fornecedor && ` · ${s.fornecedor}`}
                      {s.referencia && ` · ref. ${s.referencia}`}
                    </p>
                  </div>
                  <span className="font-medium tabular-nums">{formatarReal.format(s.valor)}</span>
                  {editavel && (
                    <div className="flex gap-1">
                      <FormDialog
                        rotulo="Editar"
                        icone={<Pencil aria-hidden />}
                        variante="outline"
                        tamanho="sm"
                        titulo="Editar saída"
                        descricao="A correção fica no histórico da turma, com o antes e o depois."
                        acao={editarSaida}
                        campos={{ id: s.id }}
                        rotuloSubmit="Salvar saída"
                      >
                        <CamposSaida prefixo={`editar-${s.id}`} hoje={hoje} fornecedores={fornecedores} inicial={s} />
                      </FormDialog>
                      <ConfirmarExclusao
                        acao={excluirSaida}
                        campos={{ id: s.id }}
                        alvo="a saída"
                        nome={`${s.descricao}, ${formatarReal.format(s.valor)}`}
                        aviso="O saldo é recalculado sem ela. A exclusão fica no histórico da turma."
                        rotulo="Excluir"
                        descricao={`Excluir a saída ${s.descricao}`}
                        icone={<Trash2 aria-hidden />}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
