import type { Metadata } from "next";
import Link from "next/link";
import { FileDown, FileSpreadsheet, FileUp, HandCoins, Plus } from "lucide-react";
import { lancarPagamento } from "@/actions/tesouraria";
import { AbasTesouraria } from "@/components/features/abas-tesouraria";
import { AcoesInforme } from "@/components/features/acoes-informe";
import { AvatarUsuario } from "@/components/features/avatar-usuario";
import { CabecalhoPagina } from "@/components/features/cabecalho-pagina";
import { CampoBusca } from "@/components/features/campo-busca";
import { CamposLancamento } from "@/components/features/campos-lancamento";
import { EstadoVazio } from "@/components/features/estado-vazio";
import { FaixaNumeros } from "@/components/features/faixa-numeros";
import { FiltrosPilula } from "@/components/features/filtros-pilula";
import { FormDialog } from "@/components/features/form-dialog";
import { AcaoLink, AcaoSeparador, MenuAcoes } from "@/components/features/menu-acoes";
import { Paginacao } from "@/components/features/paginacao";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { lerBusca } from "@/lib/busca";
import { exigirTesouraria } from "@/lib/dal";
import { formatarReal } from "@/lib/orcamento";
import { lerPagina } from "@/lib/paginacao";
import { ROTULO_FORMA, getCaixa, listarInformados, listarSituacoes, type FiltroTesouraria } from "@/lib/pagamentos";
import { ROTULO_ESTADO, dataBr, hojeBrasil } from "@/lib/situacao-regras";

export const metadata: Metadata = { title: "Tesouraria" };

const FILTROS: { valor: FiltroTesouraria; rotulo: string }[] = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "atrasado", rotulo: "Em atraso" },
  { valor: "em_dia", rotulo: "Em dia" },
  { valor: "quitado", rotulo: "Quitados" },
  { valor: "aguardando", rotulo: "Aguardando confirmação" },
];

// Tesouraria (ADR-0005), aba Membros: a rotina de todo dia. O caixa numa faixa,
// os "Já paguei" para conferir e a lista de quem pagou ou está atrasado. Plano,
// regras e importação são tarefas de uma vez só e moram na aba "Plano e regras"
// (D-12 do plano de UX). Só quem é tesouraria entra aqui (exigirTesouraria).
export default async function TesourariaPage({ searchParams }: PageProps<"/admin/tesouraria">) {
  const tesouraria = await exigirTesouraria();
  const params = await searchParams;
  const filtro = FILTROS.find((f) => f.valor === params.filtro)?.valor ?? "todos";
  const busca = lerBusca(params.busca);
  const hoje = hojeBrasil();
  const editavel = !tesouraria.arquivadaEm;
  const [{ contagem, itens, pagina, totalPaginas }, informes, caixa] = await Promise.all([
    listarSituacoes(tesouraria.turmaId, hoje, { filtro, busca, pagina: lerPagina(params.pagina) }),
    listarInformados(tesouraria.turmaId),
    getCaixa(tesouraria.turmaId),
  ]);
  const link = (f: FiltroTesouraria) => {
    const q = new URLSearchParams();
    if (f !== "todos") q.set("filtro", f);
    if (busca) q.set("busca", busca);
    const texto = q.toString();
    return texto ? `/admin/tesouraria?${texto}` : "/admin/tesouraria";
  };

  return (
    <div className="mx-auto w-full max-w-4xl 2xl:max-w-6xl">
      <CabecalhoPagina
        titulo="Tesouraria"
        descricao="Quem pagou, quem está atrasado e o que falta conferir."
        acao={
          // Downloads e importação são raros: ficam juntos num menu, fora do
          // caminho da lista. Os downloads continuam <a download> (AcaoLink).
          <MenuAcoes nome="planilhas da tesouraria" rotulo="Planilhas" icone={<FileSpreadsheet aria-hidden />}>
            <AcaoLink href="/admin/turma/exportar?tipo=situacao" download icone={<FileDown aria-hidden />}>
              Situação por pessoa
            </AcaoLink>
            <AcaoLink href="/admin/turma/exportar?tipo=membros" download icone={<FileDown aria-hidden />}>
              Lista de membros com email
            </AcaoLink>
            {editavel && <AcaoSeparador />}
            {editavel && (
              <AcaoLink href="/admin/tesouraria/plano#importar" icone={<FileUp aria-hidden />}>
                Importar pagamentos…
              </AcaoLink>
            )}
          </MenuAcoes>
        }
      />
      <AbasTesouraria atual="membros" />

      <FaixaNumeros
        className="mt-6"
        numeros={[
          {
            rotulo: "Arrecadado",
            valor: formatarReal.format(caixa.arrecadado),
            detalhe: `de ${formatarReal.format(caixa.previsto)} previstos`,
          },
          { rotulo: "Saídas", valor: formatarReal.format(caixa.saidas) },
          { rotulo: "Saldo", valor: formatarReal.format(caixa.saldo) },
        ]}
      />

      {/* "Já paguei" esperando conferência fica no topo: é a fila de trabalho
          (ADR-0005, parte 2). Um aviso e a lista logo abaixo, sem card. */}
      {informes.length > 0 && (
        <section aria-labelledby="titulo-informes" className="mt-6">
          <Alert role="status">
            <HandCoins aria-hidden />
            <AlertTitle id="titulo-informes">
              {informes.length} {informes.length === 1 ? "pagamento aguardando" : "pagamentos aguardando"} sua
              confirmação
            </AlertTitle>
            <AlertDescription>Os membros informaram. Confira no extrato antes de confirmar.</AlertDescription>
          </Alert>
          <ul className="mt-2 divide-y rounded-lg border">
            {informes.map((i) => (
              <Item asChild key={i.id}>
                <li data-informe={i.nome} className="rounded-none not-first:border-t-border">
                  <ItemContent className="min-w-0 basis-56">
                    <ItemTitle>
                      <Link href={`/admin/tesouraria/${i.usuarioId}`} className="underline-offset-2 hover:underline">
                        {i.nome}
                      </Link>
                      <span className="tabular-nums">{formatarReal.format(i.valor)}</span>
                    </ItemTitle>
                    <ItemDescription className="line-clamp-none wrap-break-word">
                      {[
                        ROTULO_FORMA[i.forma],
                        dataBr(i.pagoEm),
                        i.pagoPor && `pago por ${i.pagoPor}`,
                        i.referencia,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </ItemDescription>
                  </ItemContent>
                  {editavel && (
                    <ItemActions>
                      <AcoesInforme id={i.id} />
                    </ItemActions>
                  )}
                </li>
              </Item>
            ))}
          </ul>
        </section>
      )}

      <section aria-label="Membros" className="mt-8 flex flex-col gap-3">
        <CampoBusca
          acao="/admin/tesouraria"
          valor={busca}
          placeholder="Buscar por nome ou email"
          rotulo="Buscar membro por nome ou email"
          manter={{ filtro: filtro === "todos" ? undefined : filtro }}
        />
        <FiltrosPilula
          rotulo="Filtrar por situação"
          filtros={FILTROS.map((f) => ({
            rotulo: f.rotulo,
            href: link(f.valor),
            ativo: f.valor === filtro,
            contagem: contagem[f.valor],
          }))}
        />

        {itens.length === 0 ? (
          <EstadoVazio
            titulo="Ninguém aqui"
            descricao={busca ? "Tente outro nome ou limpe a busca." : "Escolha outro filtro para ver os demais."}
          />
        ) : (
          <ul data-grupo className="divide-y rounded-lg border">
            {itens.map((m) => (
              <Item asChild key={m.usuarioId}>
                <li data-membro={m.nome} className="rounded-none not-first:border-t-border">
                  <ItemMedia>
                    <AvatarUsuario nome={m.nome} imagem={m.imagem} className="size-10" />
                  </ItemMedia>
                  <ItemContent className="min-w-0 basis-40">
                    <ItemTitle className="max-w-full">
                      <Link
                        href={`/admin/tesouraria/${m.usuarioId}`}
                        className="truncate underline-offset-2 hover:underline"
                      >
                        {m.nome}
                      </Link>
                    </ItemTitle>
                    <ItemDescription className="tabular-nums">
                      pagou {formatarReal.format(Math.max(0, m.situacao.pago))}
                      {m.situacao.falta > 0 && ` · falta ${formatarReal.format(m.situacao.falta)}`}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions className="flex-wrap">
                    {m.situacao.estado !== "sem_plano" && (
                      <Badge variant={m.situacao.estado === "atrasado" ? "warning" : "secondary"}>
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
                  </ItemActions>
                </li>
              </Item>
            ))}
          </ul>
        )}
      </section>
      <Paginacao
        pagina={pagina}
        totalPaginas={totalPaginas}
        caminho="/admin/tesouraria"
        parametros={{ filtro: filtro === "todos" ? undefined : filtro, busca: busca || undefined }}
      />
    </div>
  );
}
