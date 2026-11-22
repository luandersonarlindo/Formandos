import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  CircleCheck,
  MapPin,
  Navigation,
  Pencil,
  TriangleAlert,
  UserCheck,
  Vote,
  Wallet,
} from "lucide-react";
import { ContagemRegressiva } from "@/components/features/contagem-regressiva";
import { AcessibilidadeLocal } from "@/components/features/acessibilidade-local";
import { FormPresenca } from "@/components/features/form-presenca";
import { PainelRecolhivel } from "@/components/features/painel-recolhivel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getUltimaMudancaEvento } from "@/lib/evento-publico";
import { exigirMembro } from "@/lib/dal";
import { getDadosEvento, getResumosDashboard, listarProgramacao } from "@/lib/dashboard";
import { listarUltimosAvisos } from "@/lib/avisos";
import { linkComoChegar } from "@/lib/evento";
import { formatarReal } from "@/lib/orcamento";
import { getMinhaSituacao } from "@/lib/pagamentos";
import { getMinhaPresenca } from "@/lib/presenca";
import { presencaFechada, ROTULO_PRESENCA } from "@/lib/presenca-regras";
import { dataBr, hojeBrasil } from "@/lib/situacao-regras";
import { formatarDataHora, formatarDiaCurto, formatarHora } from "@/lib/datas";

export const metadata: Metadata = { title: "Início" };

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

// Indicador da comissão: um link com o número e, quando há total, a barra.
// Só três, e todos levam a uma tela onde dá para agir (P-06).
function Indicador({ titulo, valor, total, href }: { titulo: string; valor: number; total?: number; href: string }) {
  return (
    <li>
      <Link
        href={href}
        className="flex h-full flex-col gap-1 rounded-lg border border-primary/20 bg-primary/[0.03] p-2.5 transition-colors sm:p-3 hover:bg-primary/10 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <span className="text-xs leading-tight text-muted-foreground sm:text-sm">{titulo}</span>
        <span className="text-xl font-semibold tabular-nums">
          <span data-contar={valor}>{valor}</span>
          {/* O espaço separa "1" de "de 3" no nome lido pelo leitor de tela. */}
          {total !== undefined && " "}
          {total !== undefined && <span className="text-sm font-normal text-muted-foreground">de {total}</span>}
        </span>
        {total !== undefined && (
          // O número já diz o mesmo: a barra fica fora da leitura (ADR-0015).
          <Progress className="mt-1" value={total === 0 ? 0 : (valor / total) * 100} aria-hidden />
        )}
      </Link>
    </li>
  );
}

// Uma linha de "Para você fazer": o que é, um detalhe curto e a ação.
function Pendencia({
  icone,
  titulo,
  descricao,
  feito = false,
  children,
}: {
  icone: React.ReactNode;
  titulo: React.ReactNode;
  descricao?: React.ReactNode;
  feito?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <li className="flex gap-3 py-3 first:pt-0 last:pb-0">
      <span
        className={
          feito
            ? "flex size-9 shrink-0 items-center justify-center rounded-full bg-success/10 text-success"
            : "flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-destaque dark:bg-primary/25"
        }
        aria-hidden
      >
        {feito ? <CircleCheck className="size-5" /> : icone}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-pretty">{titulo}</p>
          {descricao && <div className="mt-0.5 text-sm text-muted-foreground text-pretty">{descricao}</div>}
        </div>
        {children && <div className="flex shrink-0 flex-wrap gap-2">{children}</div>}
      </div>
    </li>
  );
}

// Início (D-03): primeiro o que mudou, depois quando e onde, e logo em seguida
// o que a pessoa precisa fazer. Decisões, avisos e os detalhes do evento vêm
// depois, recolhidos quando são longos. O admin vê a mesma tela, mais três
// indicadores e o link para editar o evento (P-06); a gestão do evento mora em
// /admin/evento, e "Sair da turma" foi para Minha conta (P-05).
export default async function DashboardPage() {
  const membro = await exigirMembro();
  const ehAdmin = membro.papel === "admin";
  const ehObservador = membro.papel === "observador";
  const presencaTravada = presencaFechada(membro.presencaAte, new Date());
  const [programacao, { resumo, admin: resumoAdmin }, { detalhes }, presenca, avisos, mudancaEvento, minha] =
    await Promise.all([
      listarProgramacao(membro),
      getResumosDashboard(membro),
      getDadosEvento(membro),
      getMinhaPresenca(membro),
      listarUltimosAvisos(membro),
      getUltimaMudancaEvento(membro.turmaId),
      // Próxima parcela (P-07): só leitura, e o valor só aparece para a própria
      // pessoa, como em Minha situação. Observador não tem parcelas (ADR-0012).
      ehObservador ? null : getMinhaSituacao(membro.turmaId, membro.usuarioId, hojeBrasil()),
    ]);
  const comoChegar = linkComoChegar({
    linkMapa: detalhes.linkMapa,
    endereco: detalhes.endereco,
    local: membro.localEvento,
  });

  // O que está pendente, na ordem em que aparece. O primeiro vira a ação
  // primária da tela (botão cheio); os outros ficam em contorno.
  const semNome = presenca.status === "vou" ? Math.max(0, presenca.acompanhantes - presenca.lista.length) : 0;
  const presencaPendente = !presencaTravada && (!presenca.status || semNome > 0);
  const votosPendentes = ehObservador ? 0 : Math.max(0, resumo.enquetesTotal - resumo.enquetesRespondidas);
  const proxima = minha && minha.situacao.estado !== "sem_plano" ? minha.situacao.proxima : null;
  const atrasado = minha?.situacao.estado === "atrasado";
  const primaria = presencaPendente ? "presenca" : votosPendentes > 0 ? "votos" : proxima ? "parcela" : null;

  const respostaPresenca = presenca.status
    ? `Sua resposta: ${ROTULO_PRESENCA[presenca.status]}${
        presenca.status === "vou" && presenca.acompanhantes > 0
          ? `, com ${plural(presenca.acompanhantes, "acompanhante", "acompanhantes")}`
          : ""
      }.${semNome > 0 ? ` Faltam os nomes de ${plural(semNome, "acompanhante", "acompanhantes")}, para a lista de entrada.` : ""}`
    : "A comissão precisa saber quantas pessoas vêm para fechar o espaço e a comida.";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      {/* Mudança de data, horário, local ou endereço nos últimos 14 dias
          (ADR-0008): é o mais urgente da tela, então abre a página. */}
      {mudancaEvento && (
        <Alert role="status" className="border-warning/40 bg-warning/10">
          <TriangleAlert className="text-warning" aria-hidden />
          <AlertTitle>Mudou em {formatarDataHora.format(mudancaEvento.quando)}</AlertTitle>
          <AlertDescription>
            <ul>
              {mudancaEvento.mudancas.map((m) => (
                <li key={m.rotulo}>
                  {m.rotulo[0].toUpperCase() + m.rotulo.slice(1)}: era <s>{m.antes}</s>, agora é{" "}
                  <strong>{m.depois}</strong>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <header className="flex flex-col gap-4 rounded-2xl bg-primary p-5 text-primary-foreground shadow-sm md:p-7">
        <h1 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">{membro.turmaNome}</h1>
        <div className="flex flex-col gap-1.5 text-sm text-primary-foreground/85 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
          <p className="flex items-start gap-1.5">
            <CalendarDays className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              {membro.dataEvento ? (
                <>
                  <span className="font-medium text-primary-foreground">{formatarDataHora.format(membro.dataEvento)}</span>
                  {detalhes.dataFim && <> até {formatarDataHora.format(detalhes.dataFim)}</>}
                  {" · "}
                  <ContagemRegressiva dataIso={membro.dataEvento.toISOString()} />
                </>
              ) : (
                "Data ainda não definida"
              )}
            </span>
          </p>
          <p className="flex items-start gap-1.5">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span className="wrap-break-word font-medium text-primary-foreground">{membro.localEvento ?? "Local ainda não definido"}</span>
          </p>
        </div>
        {(comoChegar || ehAdmin) && (
          <div className="flex flex-wrap gap-2">
            {comoChegar && (
              <Button asChild variant="secondary" size="sm">
                <a href={comoChegar} target="_blank" rel="noopener noreferrer">
                  <Navigation aria-hidden /> Como chegar
                  <span className="sr-only"> (abre em nova aba)</span>
                </a>
              </Button>
            )}
            {ehAdmin && (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
              >
                <Link href="/admin/evento">
                  <Pencil aria-hidden /> Editar evento
                </Link>
              </Button>
            )}
          </div>
        )}
      </header>

      {/* Sempre há o que mostrar: a acessibilidade aparece mesmo "não informada" (ADR-0024). */}
      <PainelRecolhivel className="group rounded-xl border">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-xl p-4 md:px-5 pointer-coarse:min-h-11 [&::-webkit-details-marker]:hidden">
          <h2 className="text-lg font-semibold">Sobre o evento</h2>
          <ChevronRight className="size-4 text-muted-foreground transition-transform group-open:rotate-90" aria-hidden />
        </summary>
        <div className="flex flex-col gap-5 border-t p-4 md:px-5">
          {detalhes.descricao && (
            <p className="whitespace-pre-wrap wrap-break-word text-pretty">{detalhes.descricao}</p>
          )}
          {(detalhes.endereco || detalhes.entrada || detalhes.traje || detalhes.observacoesLocal) && (
            <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
              {detalhes.endereco && (
                <>
                  <dt className="text-muted-foreground">Endereço</dt>
                  <dd className="wrap-break-word">{detalhes.endereco}</dd>
                </>
              )}
              {detalhes.entrada && (
                <>
                  <dt className="text-muted-foreground">Entrada</dt>
                  <dd className="wrap-break-word">
                    {detalhes.entrada}
                  </dd>
                </>
              )}
              {detalhes.traje && (
                <>
                  <dt className="text-muted-foreground">Traje</dt>
                  <dd className="wrap-break-word">{detalhes.traje}</dd>
                </>
              )}
              {detalhes.observacoesLocal && (
                <>
                  <dt className="text-muted-foreground">Sobre o local</dt>
                  <dd className="whitespace-pre-wrap wrap-break-word">{detalhes.observacoesLocal}</dd>
                </>
              )}
            </dl>
          )}
          {/* ADR-0024: acessibilidade do local, sempre em texto. */}
          <AcessibilidadeLocal a={detalhes.acessibilidade} compacto />
          <div>
            <h3 className="font-medium">Programação da festa</h3>
            <p className="text-sm text-muted-foreground">
              {programacao.length === 0
                ? "A programação ainda não foi divulgada pela comissão."
                : "Horários no fuso de Brasília."}
            </p>
            {programacao.length > 0 && (
              <ol className="mt-3 ml-1.5 border-l">
                {programacao.map((item) => (
                  <li key={item.id} className="relative pb-5 pl-5 last:pb-0">
                    <span
                      aria-hidden
                      className="absolute top-1.5 -left-[5px] size-2.5 rounded-full bg-muted-foreground ring-4 ring-background"
                    />
                    <p className="text-sm font-semibold tabular-nums">
                      {formatarHora.format(item.horario)}{" "}
                      <span className="font-normal text-muted-foreground">· {formatarDiaCurto.format(item.horario)}</span>
                    </p>
                    <p className="mt-0.5 font-medium">{item.titulo}</p>
                    {item.descricao && (
                      <p className="mt-0.5 wrap-break-word text-sm text-muted-foreground">{item.descricao}</p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </PainelRecolhivel>

      <section aria-labelledby="para-voce" className="rounded-xl border border-primary/25 bg-primary/[0.03] p-4 md:p-5">
        <h2 id="para-voce" className="mb-3 text-lg font-semibold">
          Para você fazer
        </h2>
        <ul data-grupo className="divide-y">
          <Pendencia
            icone={<UserCheck className="size-5" />}
            feito={!presencaPendente}
            titulo="Você vai ao evento?"
            descricao={
              <>
                <p>{respostaPresenca}</p>
                {/* Prazo da lista (ADR-0013): a data antes, a trava depois. */}
                {membro.presencaAte && (
                  <p>
                    {presencaTravada
                      ? `A lista fechou em ${formatarDataHora.format(membro.presencaAte)}. Para mudar, fale com a comissão.`
                      : `Responda até ${formatarDataHora.format(membro.presencaAte)}. Depois disso a resposta trava.`}
                  </p>
                )}
              </>
            }
          >
            {!presencaTravada && (
              <FormPresenca
                inicial={presenca}
                limite={membro.maxAcompanhantes}
                valorAcompanhante={membro.valorAcompanhante}
                variante={primaria === "presenca" ? "default" : "outline"}
              />
            )}
          </Pendencia>
          {votosPendentes > 0 && (
            <Pendencia
              icone={<Vote className="size-5" />}
              titulo={`${votosPendentes === 1 ? "Falta 1 pergunta" : `Faltam ${votosPendentes} perguntas`} para você votar`}
              descricao={`Você respondeu ${resumo.enquetesRespondidas} de ${resumo.enquetesTotal}.`}
            >
              <Button asChild size="sm" variant={primaria === "votos" ? "default" : "outline"}>
                <Link href="/votacoes">
                  Votar <ChevronRight aria-hidden />
                </Link>
              </Button>
            </Pendencia>
          )}
          {proxima && (
            <Pendencia
              icone={<Wallet className="size-5" />}
              titulo={
                <span className="flex flex-wrap items-center gap-2">
                  <span className="tabular-nums">
                    {proxima.rotulo ? `${proxima.rotulo.split(" (")[0]}:` : "Próxima parcela:"}{" "}
                    {formatarReal.format(proxima.falta)} até {dataBr(proxima.vencimento)}
                  </span>
                  {atrasado && <Badge variant="warning">Em atraso</Badge>}
                </span>
              }
              descricao="Só você e a tesouraria veem este valor."
            >
              <Button asChild size="sm" variant={primaria === "parcela" ? "default" : "outline"}>
                <Link href="/minha-situacao">
                  Minha situação <ChevronRight aria-hidden />
                </Link>
              </Button>
            </Pendencia>
          )}
        </ul>
        {!primaria && <p className="mt-3 text-sm text-muted-foreground">Tudo em dia por aqui.</p>}
      </section>

      {ehAdmin && resumoAdmin && (
        <section aria-labelledby="comissao">
          <h2 id="comissao" className="mb-3 text-lg font-semibold">
            Comissão
          </h2>
          <ul data-grupo className="grid grid-cols-3 gap-2 sm:gap-3">
            <Indicador
              titulo="Votaram"
              valor={resumoAdmin.votantes}
              total={resumoAdmin.formandos}
              href="/admin/votacoes"
            />
            <Indicador
              titulo="Presença confirmada"
              valor={resumoAdmin.confirmados}
              total={resumoAdmin.membros}
              href="/admin/presenca"
            />
            <Indicador titulo="Dúvidas sem resposta" valor={resumoAdmin.duvidasAbertas} href="/duvidas" />
          </ul>
        </section>
      )}

      {avisos.length > 0 && (
        <section aria-labelledby="avisos">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="avisos" className="text-lg font-semibold">
              Últimos avisos
            </h2>
            <Link
              href="/avisos"
              className="text-sm font-medium text-destaque underline-offset-4 hover:underline pointer-coarse:py-2.5"
            >
              Ver todos
            </Link>
          </div>
          {/* Resumo em duas linhas: o recado inteiro está em /avisos. */}
          <ul className="divide-y rounded-xl border">
            {avisos.map((a) => (
              <li key={a.id} className="p-3 md:px-4">
                <p className="font-medium wrap-break-word">{a.titulo}</p>
                <p className="mt-0.5 line-clamp-2 wrap-break-word text-sm text-muted-foreground">{a.conteudo}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

    </div>
  );
}
