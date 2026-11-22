import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ChevronRight, HandCoins, X } from "lucide-react";
import { cancelarInforme, informarPagamento } from "@/actions/tesouraria";
import { CamposLancamento } from "@/components/features/campos-lancamento";
import { AbasRota } from "@/components/features/abas-rota";
import { CabecalhoPagina } from "@/components/features/cabecalho-pagina";
import { ConfirmarExclusao } from "@/components/features/confirmar-exclusao";
import { FormDialog } from "@/components/features/form-dialog";
import { MudancasPlano } from "@/components/features/mudancas-plano";
import { PainelRecolhivel } from "@/components/features/painel-recolhivel";
import { EstadoVazio } from "@/components/features/estado-vazio";
import { ChecklistAmico } from "@/components/ilustracoes/checklist-amico";
import { Badge } from "@/components/ui/badge";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { listarMudancasPlano } from "@/lib/auditoria";
import { exigirMembro } from "@/lib/dal";
import { formatarDataHora } from "@/lib/datas";
import { formatarReal } from "@/lib/orcamento";
import { ROTULO_FORMA, ROTULO_TIPO, getCaixa, getMinhaSituacao } from "@/lib/pagamentos";
import { listarSaidasDaTurma } from "@/lib/saidas";
import { FRASE_SALDO } from "@/lib/saidas-regras";
import { SaidasDaTurma } from "@/components/features/saidas-da-turma";
import { ROTULO_ESTADO, ROTULO_PARCELA, dataBr, hojeBrasil, type EstadoGeral } from "@/lib/situacao-regras";

export const metadata: Metadata = { title: "Minha situação" };

const COR_ESTADO: Record<EstadoGeral, string> = {
  sem_plano: "",
  quitado: "text-success",
  em_dia: "text-success",
  adiantado: "text-success",
  atrasado: "text-warning",
};

const ROTULO_STATUS = {
  confirmado: "Confirmado",
  informado: "Aguardando confirmação",
  recusado: "Recusado",
} as const;

// "Minha situação" (ADR-0005): quanto a pessoa pagou, quanto falta e a próxima
// parcela. Só a própria pessoa e a tesouraria veem estes valores.
//
// Ordem (plano de UX, Fase 2): um bloco com a situação e o "Já paguei" dentro
// dele (a ação primária), depois as abas Parcelas | Lançamentos, que são rotas
// (?aba=) para o link e o voltar do navegador funcionarem, e por fim o
// "Dinheiro da turma" recolhido (P-08): a transparência continua aqui, só não
// empurra a situação da pessoa para baixo.
export default async function MinhaSituacaoPage({ searchParams }: PageProps<"/minha-situacao">) {
  const membro = await exigirMembro();
  // Observador não tem parcelas nem pagamentos (ADR-0012).
  if (membro.papel === "observador") redirect("/dashboard");
  const { aba: abaParametro } = await searchParams;
  const hoje = hojeBrasil();
  const [{ situacao: s, lancamentos, ultimaAtualizacao, tesouraria }, caixa, mudancas, saidas] = await Promise.all([
    getMinhaSituacao(membro.turmaId, membro.usuarioId, hoje),
    getCaixa(membro.turmaId),
    listarMudancasPlano(membro.turmaId),
    listarSaidasDaTurma(membro.turmaId),
  ]);
  const editavel = !membro.arquivadaEm;
  const pct = s.totalPlano > 0 ? Math.min(100, Math.max(0, (s.pago / s.totalPlano) * 100)) : 0;
  const semPlano = s.estado === "sem_plano";
  // Sem plano não há parcelas: a aba que sobra é a dos lançamentos.
  const aba = semPlano || abaParametro === "lancamentos" ? "lancamentos" : "parcelas";
  const aguardando = lancamentos.filter((l) => l.status === "informado");
  const temDinheiroDaTurma = caixa.previsto > 0 || !!caixa.regrasDinheiro || mudancas.length > 0;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <CabecalhoPagina titulo="Minha situação" descricao="Só você e a tesouraria da turma veem estes valores." />

      {semPlano ? (
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
        <Card className="mt-6">
          <CardHeader className="gap-2">
            <p className="text-sm text-muted-foreground">Você pagou</p>
            <p className="text-3xl font-semibold tracking-tight tabular-nums">
              {formatarReal.format(Math.max(0, s.pago))}{" "}
              <span className="text-base font-normal text-muted-foreground">
                de {formatarReal.format(s.totalPlano)}
              </span>
            </p>
            <Progress className="h-2" value={pct} aria-label="Quanto do total já foi pago" />
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <Badge variant={s.estado === "atrasado" ? "warning" : "outline"} className={COR_ESTADO[s.estado]}>
                {ROTULO_ESTADO[s.estado]}
              </Badge>
              {s.proxima && (
                <span className="tabular-nums">
                  Próxima: {formatarReal.format(s.proxima.falta)} até {dataBr(s.proxima.vencimento)}.
                </span>
              )}
              {s.falta > 0 && (
                <span className="text-muted-foreground tabular-nums">Falta {formatarReal.format(s.falta)} no total.</span>
              )}
            </div>
          </CardHeader>
          {editavel && (
            <CardFooter className="flex-col items-start gap-3 sm:flex-row sm:items-center">
              <FormDialog
                rotulo="Já paguei"
                icone={<HandCoins aria-hidden />}
                variante="default"
                tamanho="default"
                titulo="Informar um pagamento"
                descricao="Conte à tesouraria o que você pagou. O valor entra na sua situação depois que ela conferir."
                acao={informarPagamento}
                rotuloSubmit="Informar pagamento"
                rotuloPendente="Enviando…"
              >
                <CamposLancamento prefixo="informe" hoje={hoje} semTipo />
              </FormDialog>
              <p className="text-sm text-muted-foreground text-pretty">
                {aguardando.length > 0
                  ? `${aguardando.length === 1 ? "Um informe seu aguarda" : `${aguardando.length} informes seus aguardam`} a tesouraria. `
                  : ""}
                O pagamento aparece aqui depois que a tesouraria confere.
              </p>
            </CardFooter>
          )}
        </Card>
      )}

      <p className="mt-3 text-xs text-muted-foreground text-pretty">
        {ultimaAtualizacao && `Última atualização da tesouraria: ${formatarDataHora.format(ultimaAtualizacao)}. `}
        {tesouraria.length > 0 && `Tesouraria: ${tesouraria.join(", ")}.`}
      </p>

      {(!semPlano || lancamentos.length > 0) && (
        <section className="mt-6" aria-label="Detalhes">
          <AbasRota
            rotulo="Detalhes da sua situação"
            abas={[
              ...(semPlano ? [] : [{ rotulo: "Parcelas", href: "/minha-situacao", ativa: aba === "parcelas" }]),
              {
                rotulo: lancamentos.length > 0 ? `Lançamentos (${lancamentos.length})` : "Lançamentos",
                href: "/minha-situacao?aba=lancamentos",
                ativa: aba === "lancamentos",
              },
            ]}
          />

          {aba === "parcelas" ? (
            <>
              <p className="mt-3 text-sm text-muted-foreground">
                O que você paga vai cobrindo as parcelas pela ordem de vencimento.
              </p>
              <ol className="mt-2 divide-y">
                {s.parcelas.map((p) => (
                  <li key={p.numero} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-sm">
                    <span className="min-w-24 shrink-0 font-medium">{p.rotulo ?? `Parcela ${p.numero}`}</span>
                    <span className="tabular-nums">{formatarReal.format(p.valor)}</span>
                    <span className="text-muted-foreground tabular-nums">vence {dataBr(p.vencimento)}</span>
                    <Badge
                      variant={p.estado === "paga" ? "secondary" : p.emAtraso ? "warning" : "outline"}
                      className="ml-auto"
                    >
                      {p.estado === "parcial" ? `Falta ${formatarReal.format(p.falta)}` : ROTULO_PARCELA[p.estado]}
                    </Badge>
                  </li>
                ))}
              </ol>
            </>
          ) : lancamentos.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Nenhum lançamento ainda. Quando você informar um pagamento ou a tesouraria registrar, ele aparece aqui.
            </p>
          ) : (
            <ul className="mt-2 divide-y">
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
                    <span className="ml-auto flex items-center gap-1">
                      <Badge
                        variant={
                          l.status === "confirmado" ? "secondary" : l.status === "recusado" ? "warning" : "outline"
                        }
                      >
                        {ROTULO_STATUS[l.status]}
                      </Badge>
                      {l.status === "informado" && editavel && (
                        <ConfirmarExclusao
                          acao={cancelarInforme}
                          campos={{ id: l.id }}
                          alvo="o informe"
                          nome={`${formatarReal.format(l.valor)} de ${dataBr(l.pagoEm)}`}
                          aviso="A tesouraria deixa de ver este informe."
                          rotulo="Cancelar informe"
                          descricao={`Cancelar o informe de ${formatarReal.format(l.valor)}`}
                          icone={<X aria-hidden />}
                          sucesso="Informe cancelado."
                        />
                      )}
                    </span>
                  </div>
                  {(l.pagoPor || l.referencia) && (
                    <p className="text-xs text-muted-foreground wrap-break-word">
                      {[l.pagoPor && `Pago por ${l.pagoPor}`, l.referencia].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {l.status === "recusado" && l.motivoRecusa && (
                    <p className="text-xs text-warning">Motivo da tesouraria: {l.motivoRecusa}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Transparência (ADR-0005, parte 3): totais da turma, regras e
          mudanças no plano. Nada aqui identifica quem pagou ou deve. Fica
          recolhido (P-08), com tudo dentro de um só painel. */}
      {temDinheiroDaTurma && (
        <PainelRecolhivel className="group mt-8 rounded-xl border">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-xl p-4 pointer-coarse:min-h-11 [&::-webkit-details-marker]:hidden">
            <span>
              <span className="block font-semibold">Dinheiro da turma</span>
              <span className="block text-sm text-muted-foreground">Caixa, regras e mudanças no plano. Sem nomes.</span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" aria-hidden />
          </summary>
          <div className="flex flex-col gap-6 border-t p-4">
            {caixa.previsto > 0 && (
              <div className="flex flex-col gap-2">
                <h2 className="font-medium">Caixa da turma</h2>
                <p className="text-sm text-muted-foreground">Total confirmado pela tesouraria, somando todos os membros.</p>
                <p className="text-xl font-semibold tabular-nums">
                  {formatarReal.format(caixa.arrecadado)}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    em pagamentos confirmados pela tesouraria, de {formatarReal.format(caixa.previsto)} previstos
                  </span>
                </p>
                <Progress
                  className="h-2"
                  value={Math.min(100, Math.max(0, (caixa.arrecadado / caixa.previsto) * 100))}
                  aria-label="Quanto do previsto a tesouraria já confirmou"
                />
                <p className="text-xs text-muted-foreground">
                  Previsto = plano de {formatarReal.format(caixa.previsto / caixa.membros)} por pessoa ×{" "}
                  {caixa.membros} {caixa.membros === 1 ? "membro" : "membros"}.
                </p>
                {/* ADR-0022: com saídas lançadas, o caixa mostra o gasto e o saldo. */}
                {caixa.qtdSaidas > 0 && (
                  <div className="mt-2 border-t pt-3">
                    <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-sm tabular-nums">
                      <dt className="text-muted-foreground">Saídas lançadas</dt>
                      <dd>{formatarReal.format(caixa.saidas)}</dd>
                      <dt className="font-medium">Saldo</dt>
                      <dd className="font-semibold">{formatarReal.format(caixa.saldo)}</dd>
                    </dl>
                    <p className="mt-1 text-xs text-muted-foreground">{FRASE_SALDO}</p>
                    <PainelRecolhivel className="mt-2">
                      <summary className="cursor-pointer text-sm font-medium pointer-coarse:py-2.5">
                        Ver as saídas ({caixa.qtdSaidas})
                      </summary>
                      <div className="mt-2">
                        <SaidasDaTurma saidas={saidas} />
                      </div>
                    </PainelRecolhivel>
                  </div>
                )}
              </div>
            )}

            {caixa.regrasDinheiro && (
              <div>
                <h2 className="font-medium">Regras do dinheiro</h2>
                <p className="text-sm text-muted-foreground">Desistência, devolução e multa, combinadas pela turma.</p>
                <p className="mt-2 whitespace-pre-wrap text-sm wrap-break-word">{caixa.regrasDinheiro}</p>
              </div>
            )}

            {mudancas.length > 0 && (
              <PainelRecolhivel>
                <summary className="cursor-pointer font-medium pointer-coarse:py-2.5">
                  Mudanças no plano ({mudancas.length})
                </summary>
                <div className="mt-3">
                  <MudancasPlano itens={mudancas} />
                </div>
              </PainelRecolhivel>
            )}
          </div>
        </PainelRecolhivel>
      )}
    </div>
  );
}
