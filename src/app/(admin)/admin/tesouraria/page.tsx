import type { Metadata } from "next";
import Link from "next/link";
import { CalendarRange, HandCoins, Lock, Pencil, Plus, Search } from "lucide-react";
import { AcoesInforme } from "@/components/features/acoes-informe";
import { atualizarParcela, lancarPagamento, salvarPlano } from "@/actions/tesouraria";
import { AvatarUsuario } from "@/components/features/avatar-usuario";
import { CamposLancamento } from "@/components/features/campos-lancamento";
import { EstadoVazio } from "@/components/features/estado-vazio";
import { FormDialog } from "@/components/features/form-dialog";
import { Paginacao } from "@/components/features/paginacao";
import { EquipeAmico } from "@/components/ilustracoes/equipe-amico";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lerBusca } from "@/lib/busca";
import { exigirTesouraria } from "@/lib/dal";
import { formatarReal } from "@/lib/orcamento";
import { lerPagina } from "@/lib/paginacao";
import { ROTULO_FORMA, listarInformados, listarSituacoes, type FiltroTesouraria } from "@/lib/pagamentos";
import { ROTULO_ESTADO, dataBr, hojeBrasil } from "@/lib/situacao-regras";

export const metadata: Metadata = { title: "Tesouraria" };

const FILTROS: { valor: FiltroTesouraria; rotulo: string }[] = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "atrasado", rotulo: "Em atraso" },
  { valor: "em_dia", rotulo: "Em dia" },
  { valor: "quitado", rotulo: "Quitados" },
  { valor: "aguardando", rotulo: "Aguardando confirmação" },
];

// Tesouraria (ADR-0005): plano de parcelas da turma e a situação de cada
// membro. Só quem é tesouraria entra aqui (exigirTesouraria).
export default async function TesourariaPage({ searchParams }: PageProps<"/admin/tesouraria">) {
  const tesouraria = await exigirTesouraria();
  const params = await searchParams;
  const filtro = FILTROS.find((f) => f.valor === params.filtro)?.valor ?? "todos";
  const busca = lerBusca(params.busca);
  const hoje = hojeBrasil();
  const editavel = !tesouraria.arquivadaEm;
  const [{ plano, contagem, itens, pagina, totalPaginas }, informes] = await Promise.all([
    listarSituacoes(tesouraria.turmaId, hoje, { filtro, busca, pagina: lerPagina(params.pagina) }),
    listarInformados(tesouraria.turmaId),
  ]);
  const totalPlano = plano.reduce((s, p) => s + p.valor, 0);
  const link = (f: FiltroTesouraria) => {
    const q = new URLSearchParams();
    if (f !== "todos") q.set("filtro", f);
    if (busca) q.set("busca", busca);
    const texto = q.toString();
    return texto ? `/admin/tesouraria?${texto}` : "/admin/tesouraria";
  };

  return (
    <div className="mx-auto w-full max-w-4xl 2xl:max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Tesouraria</h1>
      <p className="mt-2 flex max-w-2xl items-start gap-1.5 text-muted-foreground text-pretty">
        <Lock className="mt-1 size-4 shrink-0" aria-hidden />
        Plano de parcelas e pagamentos de cada membro. Só a tesouraria vê esta página; cada pessoa vê a
        própria situação em “Minha situação”.
      </p>

      {/* "Já paguei" esperando conferência fica no topo (ADR-0005, parte 2). */}
      {informes.length > 0 && (
        <Card className="mt-6 border border-[var(--vitrine-a)]/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <HandCoins className="size-5 text-[var(--vitrine-a)]" aria-hidden /> Aguardando sua confirmação
              <Badge variant="secondary" className="tabular-nums">{informes.length}</Badge>
            </CardTitle>
            <CardDescription>Pagamentos que os membros informaram. Confira no extrato antes de confirmar.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {informes.map((i) => (
                <li key={i.id} data-informe={i.nome} className="flex flex-col gap-2 py-3 text-sm">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Link href={`/admin/tesouraria/${i.usuarioId}`} className="font-medium underline-offset-2 hover:underline">
                      {i.nome}
                    </Link>
                    <span className="font-medium tabular-nums">{formatarReal.format(i.valor)}</span>
                    <span className="text-muted-foreground">
                      {ROTULO_FORMA[i.forma]} · {dataBr(i.pagoEm)}
                    </span>
                  </div>
                  {(i.pagoPor || i.referencia) && (
                    <p className="text-xs text-muted-foreground wrap-break-word">
                      {[i.pagoPor && `Pago por ${i.pagoPor}`, i.referencia].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {editavel && <AcoesInforme id={i.id} />}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarRange className="size-5 text-[var(--vitrine-a)]" aria-hidden /> Plano de parcelas
          </CardTitle>
          <CardDescription className="text-pretty">
            {plano.length === 0
              ? "Ainda não há plano. Monte as parcelas que cada pessoa vai pagar."
              : `${plano.length} ${plano.length === 1 ? "parcela" : "parcelas"}, ${formatarReal.format(totalPlano)} por pessoa. Igual para todos.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {plano.length > 0 && (
            <ol className="divide-y">
              {plano.map((p) => (
                <li key={p.numero} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
                  <span className="w-24 shrink-0 font-medium">Parcela {p.numero}</span>
                  <span className="tabular-nums">{formatarReal.format(p.valor)}</span>
                  <span className="text-muted-foreground tabular-nums">vence {dataBr(p.vencimento)}</span>
                  {editavel && (
                    <span className="ml-auto">
                      <FormDialog
                        rotulo="Ajustar"
                        icone={<Pencil aria-hidden />}
                        titulo={`Ajustar parcela ${p.numero}`}
                        descricao="A mudança vale para todos e fica registrada no histórico do plano."
                        acao={atualizarParcela}
                        campos={{ numero: String(p.numero) }}
                        rotuloSubmit="Salvar parcela"
                      >
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor={`parcela-valor-${p.numero}`} className="text-xs">Valor (R$)</Label>
                          <Input
                            id={`parcela-valor-${p.numero}`}
                            name="valor"
                            inputMode="decimal"
                            defaultValue={p.valor.toFixed(2).replace(".", ",")}
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor={`parcela-venc-${p.numero}`} className="text-xs">Vencimento</Label>
                          <Input id={`parcela-venc-${p.numero}`} name="vencimento" type="date" defaultValue={p.vencimento} required />
                        </div>
                      </FormDialog>
                    </span>
                  )}
                </li>
              ))}
            </ol>
          )}
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
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="plano-quantidade" className="text-xs">Quantas parcelas</Label>
                  <Input id="plano-quantidade" name="quantidade" type="number" min={1} max={60} inputMode="numeric" defaultValue={plano.length || 10} required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="plano-valor" className="text-xs">Valor de cada uma (R$)</Label>
                  <Input id="plano-valor" name="valor" inputMode="decimal" placeholder="150,00" required />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="plano-primeira" className="text-xs">Vencimento da primeira</Label>
                <Input id="plano-primeira" name="primeira" type="date" defaultValue={plano[0]?.vencimento ?? hoje} required />
                <p className="text-xs text-muted-foreground">As outras vencem no mesmo dia dos meses seguintes.</p>
              </div>
            </FormDialog>
          )}
        </CardContent>
      </Card>

      <form action="/admin/tesouraria" className="mt-6 flex gap-2" role="search">
        {filtro !== "todos" && <input type="hidden" name="filtro" value={filtro} />}
        <Label htmlFor="busca-tesouraria" className="sr-only">Buscar membro</Label>
        <Input id="busca-tesouraria" name="busca" defaultValue={busca} placeholder="Buscar por nome ou email" className="h-10" />
        <Button type="submit" variant="outline" className="h-10">
          <Search aria-hidden /> Buscar
        </Button>
      </form>

      <nav
        aria-label="Filtrar por situação"
        className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {FILTROS.map((f) => {
          const ativo = f.valor === filtro;
          return (
            <Link
              key={f.valor}
              href={link(f.valor)}
              aria-current={ativo ? "true" : undefined}
              className={
                ativo
                  ? "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--vitrine-a)]/40 bg-[color-mix(in_oklch,var(--vitrine-a)_10%,transparent)] px-3 py-1 text-sm font-medium"
                  : "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              }
            >
              {f.rotulo}
              <span className="text-xs tabular-nums text-muted-foreground">{contagem[f.valor]}</span>
            </Link>
          );
        })}
      </nav>

      {itens.length === 0 ? (
        <EstadoVazio
          className="mt-4"
          descricao={busca ? "Tente outro nome ou limpe a busca." : "Escolha outro filtro para ver os demais."}
          ilustracao={<EquipeAmico />}
          titulo="Ninguém aqui"
        />
      ) : (
        <ul data-grupo className="mt-4 grid gap-3">
          {itens.map((m) => (
            <li key={m.usuarioId} data-membro={m.nome}>
              <Card>
                <CardContent className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <div className="flex min-w-0 flex-1 basis-56 items-center gap-3">
                    <AvatarUsuario nome={m.nome} imagem={m.imagem} className="size-10" />
                    <div className="min-w-0">
                      <Link
                        href={`/admin/tesouraria/${m.usuarioId}`}
                        className="block truncate text-sm font-medium underline-offset-2 hover:underline"
                      >
                        {m.nome}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground tabular-nums">
                        pagou {formatarReal.format(Math.max(0, m.situacao.pago))}
                        {m.situacao.falta > 0 && ` · falta ${formatarReal.format(m.situacao.falta)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                    {m.situacao.estado !== "sem_plano" && (
                      <Badge
                        variant={m.situacao.estado === "atrasado" ? "outline" : "secondary"}
                        className={m.situacao.estado === "atrasado" ? "text-amber-700 dark:text-amber-400" : ""}
                      >
                        {ROTULO_ESTADO[m.situacao.estado]}
                      </Badge>
                    )}
                    {m.aguardando > 0 && <Badge variant="outline">{m.aguardando} aguardando</Badge>}
                    {editavel && (
                      <FormDialog
                        rotulo="Lançar"
                        icone={<Plus aria-hidden />}
                        titulo={`Lançar para ${m.nome}`}
                        descricao="Pagamento, devolução ou ajuste. O lançamento da tesouraria já entra confirmado."
                        acao={lancarPagamento}
                        campos={{ usuarioId: m.usuarioId }}
                        rotuloSubmit="Lançar"
                        rotuloPendente="Lançando…"
                      >
                        <CamposLancamento prefixo={`lancar-${m.usuarioId}`} hoje={hoje} />
                      </FormDialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
      <Paginacao
        pagina={pagina}
        totalPaginas={totalPaginas}
        caminho="/admin/tesouraria"
        parametros={{ filtro: filtro === "todos" ? undefined : filtro, busca: busca || undefined }}
      />
    </div>
  );
}
