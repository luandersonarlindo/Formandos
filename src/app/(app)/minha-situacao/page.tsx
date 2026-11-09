import type { Metadata } from "next";
import { Info, Lock, Wallet } from "lucide-react";
import { EstadoVazio } from "@/components/features/estado-vazio";
import { ChecklistAmico } from "@/components/ilustracoes/checklist-amico";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { exigirMembro } from "@/lib/dal";
import { formatarDataHora } from "@/lib/datas";
import { formatarReal } from "@/lib/orcamento";
import { ROTULO_FORMA, ROTULO_TIPO, getMinhaSituacao } from "@/lib/pagamentos";
import { ROTULO_ESTADO, ROTULO_PARCELA, dataBr, hojeBrasil, type EstadoGeral } from "@/lib/situacao-regras";

export const metadata: Metadata = { title: "Minha situação" };

const COR_ESTADO: Record<EstadoGeral, string> = {
  sem_plano: "",
  quitado: "text-emerald-700 dark:text-emerald-400",
  em_dia: "text-emerald-700 dark:text-emerald-400",
  adiantado: "text-emerald-700 dark:text-emerald-400",
  atrasado: "text-amber-700 dark:text-amber-400",
};

const ROTULO_STATUS = {
  confirmado: "Confirmado",
  informado: "Aguardando confirmação",
  recusado: "Recusado",
} as const;

// "Minha situação" (ADR-0005): quanto a pessoa pagou, quanto falta e a próxima
// parcela. Só a própria pessoa e a tesouraria veem estes valores.
export default async function MinhaSituacaoPage() {
  const membro = await exigirMembro();
  const { situacao: s, lancamentos, ultimaAtualizacao, tesouraria } = await getMinhaSituacao(
    membro.turmaId,
    membro.usuarioId,
    hojeBrasil(),
  );
  const pct = s.totalPlano > 0 ? Math.min(100, Math.max(0, (s.pago / s.totalPlano) * 100)) : 0;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Minha situação</h1>
      <p className="mt-2 flex max-w-2xl items-start gap-1.5 text-muted-foreground text-pretty">
        <Lock className="mt-1 size-4 shrink-0" aria-hidden />
        Quanto você já pagou e quanto falta. Só você e a tesouraria da turma veem estes valores.
      </p>

      {s.estado === "sem_plano" ? (
        <EstadoVazio
          className="mt-6"
          titulo="A turma ainda não tem plano de parcelas"
          descricao={
            tesouraria.length > 0
              ? `Quando a tesouraria (${tesouraria.join(", ")}) montar o plano, ele aparece aqui.`
              : "Quando a comissão definir quem cuida do dinheiro e montar o plano, ele aparece aqui."
          }
          ilustracao={<ChecklistAmico />}
        />
      ) : (
        <>
          <Card className="vitrine-fundo-hero mt-6">
            <CardHeader>
              <CardDescription className="flex items-center gap-1.5">
                <Wallet className="size-4" aria-hidden /> Você pagou
              </CardDescription>
              <CardTitle className="text-3xl tabular-nums">
                {formatarReal.format(Math.max(0, s.pago))}{" "}
                <span className="text-base font-normal text-muted-foreground">
                  de {formatarReal.format(s.totalPlano)}
                </span>
              </CardTitle>
              <Progress className="mt-2 h-2" value={pct} aria-label="Quanto do total já foi pago" />
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                <Badge variant="outline" className={COR_ESTADO[s.estado]}>
                  {ROTULO_ESTADO[s.estado]}
                </Badge>
                {s.proxima && (
                  <span className="tabular-nums">
                    Próxima: {formatarReal.format(s.proxima.falta)} até {dataBr(s.proxima.vencimento)}.
                  </span>
                )}
                {s.falta > 0 && (
                  <span className="text-muted-foreground tabular-nums">
                    Falta {formatarReal.format(s.falta)} no total.
                  </span>
                )}
              </div>
            </CardHeader>
          </Card>

          <p className="mt-3 flex items-start gap-1.5 text-sm text-muted-foreground text-pretty">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              Os pagamentos aparecem aqui depois que a tesouraria registra. Pode levar alguns dias.
              {ultimaAtualizacao && ` Última atualização da tesouraria: ${formatarDataHora.format(ultimaAtualizacao)}.`}
              {tesouraria.length > 0 && ` Tesouraria: ${tesouraria.join(", ")}.`}
            </span>
          </p>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Parcelas</CardTitle>
              <CardDescription>O que você paga vai cobrindo as parcelas pela ordem de vencimento.</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="divide-y">
                {s.parcelas.map((p) => (
                  <li key={p.numero} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-sm">
                    <span className="w-24 shrink-0 font-medium">Parcela {p.numero}</span>
                    <span className="tabular-nums">{formatarReal.format(p.valor)}</span>
                    <span className="text-muted-foreground tabular-nums">vence {dataBr(p.vencimento)}</span>
                    <Badge
                      variant={p.estado === "paga" ? "secondary" : "outline"}
                      className={`ml-auto ${p.emAtraso ? "text-amber-700 dark:text-amber-400" : ""}`}
                    >
                      {p.estado === "parcial"
                        ? `Falta ${formatarReal.format(p.falta)}`
                        : ROTULO_PARCELA[p.estado]}
                    </Badge>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </>
      )}

      {lancamentos.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">Seus lançamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {lancamentos.map((l) => (
                <li key={l.id} className="flex flex-col gap-0.5 py-2.5 text-sm">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-medium tabular-nums">
                      {l.tipo === "devolucao" ? "− " : ""}
                      {formatarReal.format(l.valor)}
                    </span>
                    <span className="text-muted-foreground">
                      {ROTULO_TIPO[l.tipo]} · {ROTULO_FORMA[l.forma]} · {dataBr(l.pagoEm)}
                    </span>
                    <Badge
                      variant={l.status === "confirmado" ? "secondary" : "outline"}
                      className="ml-auto"
                    >
                      {ROTULO_STATUS[l.status]}
                    </Badge>
                  </div>
                  {(l.pagoPor || l.referencia) && (
                    <p className="text-xs text-muted-foreground wrap-break-word">
                      {[l.pagoPor && `Pago por ${l.pagoPor}`, l.referencia].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {l.status === "recusado" && l.motivoRecusa && (
                    <p className="text-xs text-amber-700 dark:text-amber-400">Motivo: {l.motivoRecusa}</p>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
