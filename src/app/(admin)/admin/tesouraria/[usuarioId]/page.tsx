import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { editarPagamento, excluirPagamento, lancarPagamento } from "@/actions/tesouraria";
import { AvatarUsuario } from "@/components/features/avatar-usuario";
import { CamposLancamento } from "@/components/features/campos-lancamento";
import { ConfirmarExclusao } from "@/components/features/confirmar-exclusao";
import { FormDialog } from "@/components/features/form-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { exigirTesouraria } from "@/lib/dal";
import { formatarReal } from "@/lib/orcamento";
import { ROTULO_FORMA, ROTULO_TIPO, getPessoaTesouraria } from "@/lib/pagamentos";
import { ROTULO_ESTADO, ROTULO_PARCELA, dataBr, hojeBrasil } from "@/lib/situacao-regras";

export const metadata: Metadata = { title: "Tesouraria" };

const ROTULO_STATUS = {
  confirmado: "Confirmado",
  informado: "Aguardando confirmação",
  recusado: "Recusado",
} as const;

// Uma pessoa, vista pela tesouraria: situação, parcelas e lançamentos, com
// lançar, editar e excluir (ADR-0005).
export default async function PessoaTesourariaPage(props: PageProps<"/admin/tesouraria/[usuarioId]">) {
  const tesouraria = await exigirTesouraria();
  const { usuarioId } = await props.params;
  if (!z.uuid().safeParse(usuarioId).success) notFound();
  const hoje = hojeBrasil();
  const dados = await getPessoaTesouraria(tesouraria.turmaId, usuarioId, hoje);
  if (!dados) notFound();
  const { pessoa, situacao: s, lancamentos } = dados;
  const editavel = !tesouraria.arquivadaEm;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Link
        href="/admin/tesouraria"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden /> Tesouraria
      </Link>
      <div className="mt-3 flex items-center gap-3">
        <AvatarUsuario nome={pessoa.nome} imagem={pessoa.imagem} className="size-12" />
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight">{pessoa.nome}</h1>
          <p className="truncate text-sm text-muted-foreground">{pessoa.email}</p>
        </div>
      </div>

      <Card className="vitrine-fundo-hero mt-6">
        <CardHeader>
          <CardDescription>Pagou</CardDescription>
          <CardTitle className="text-3xl tabular-nums">
            {formatarReal.format(Math.max(0, s.pago))}{" "}
            <span className="text-base font-normal text-muted-foreground">
              de {formatarReal.format(s.totalPlano)}
            </span>
          </CardTitle>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
            <Badge variant="outline">{ROTULO_ESTADO[s.estado]}</Badge>
            {s.proxima && (
              <span className="tabular-nums">
                Próxima: {formatarReal.format(s.proxima.falta)} até {dataBr(s.proxima.vencimento)}
              </span>
            )}
          </div>
        </CardHeader>
        {editavel && (
          <CardContent>
            <FormDialog
              rotulo="Lançar"
              icone={<Plus aria-hidden />}
              variante="default"
              titulo={`Lançar para ${pessoa.nome}`}
              descricao="Pagamento, devolução ou ajuste. O lançamento da tesouraria já entra confirmado."
              acao={lancarPagamento}
              campos={{ usuarioId: pessoa.id }}
              rotuloSubmit="Lançar"
              rotuloPendente="Lançando…"
            >
              <CamposLancamento prefixo="lancar" hoje={hoje} />
            </FormDialog>
          </CardContent>
        )}
      </Card>

      {s.parcelas.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">Parcelas</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="divide-y">
              {s.parcelas.map((p) => (
                <li key={p.numero} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
                  <span className="w-24 shrink-0 font-medium">Parcela {p.numero}</span>
                  <span className="tabular-nums">{formatarReal.format(p.valor)}</span>
                  <span className="text-muted-foreground tabular-nums">vence {dataBr(p.vencimento)}</span>
                  <Badge variant="outline" className={`ml-auto ${p.emAtraso ? "text-amber-700 dark:text-amber-400" : ""}`}>
                    {p.estado === "parcial" ? `Falta ${formatarReal.format(p.falta)}` : ROTULO_PARCELA[p.estado]}
                  </Badge>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">Lançamentos</CardTitle>
          <CardDescription>Do mais recente para o mais antigo.</CardDescription>
        </CardHeader>
        <CardContent>
          {lancamentos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum lançamento ainda.</p>
          ) : (
            <ul className="divide-y">
              {lancamentos.map((l) => (
                <li key={l.id} className="flex flex-col gap-1 py-3 text-sm">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-medium tabular-nums">
                      {l.tipo === "devolucao" ? "− " : ""}
                      {formatarReal.format(l.valor)}
                    </span>
                    <span className="text-muted-foreground">
                      {ROTULO_TIPO[l.tipo]} · {ROTULO_FORMA[l.forma]} · {dataBr(l.pagoEm)}
                    </span>
                    <Badge variant={l.status === "confirmado" ? "secondary" : "outline"} className="ml-auto">
                      {ROTULO_STATUS[l.status]}
                    </Badge>
                  </div>
                  {(l.pagoPor || l.referencia || l.lancadoPor) && (
                    <p className="text-xs text-muted-foreground wrap-break-word">
                      {[l.pagoPor && `Pago por ${l.pagoPor}`, l.referencia, l.lancadoPor && `lançado por ${l.lancadoPor}`]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                  {editavel && (
                    <div className="flex flex-wrap gap-2">
                      <FormDialog
                        rotulo="Editar"
                        icone={<Pencil aria-hidden />}
                        titulo="Editar lançamento"
                        descricao="A mudança fica registrada."
                        acao={editarPagamento}
                        campos={{ id: l.id, usuarioId: pessoa.id }}
                        rotuloSubmit="Salvar"
                      >
                        <CamposLancamento prefixo={`editar-${l.id}`} hoje={hoje} inicial={l} />
                      </FormDialog>
                      <ConfirmarExclusao
                        acao={excluirPagamento}
                        campos={{ id: l.id }}
                        alvo="o lançamento"
                        nome={`${formatarReal.format(l.valor)} de ${dataBr(l.pagoEm)}`}
                        aviso="A situação da pessoa é recalculada sem ele. A exclusão fica registrada."
                        rotulo="Excluir"
                        descricao={`Excluir o lançamento de ${formatarReal.format(l.valor)}`}
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
