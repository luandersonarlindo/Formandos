import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { editarPagamento, excluirPagamento, lancarPagamento } from "@/actions/tesouraria";
import { AcoesInforme } from "@/components/features/acoes-informe";
import { CabecalhoPagina } from "@/components/features/cabecalho-pagina";
import { CamposLancamento } from "@/components/features/campos-lancamento";
import { EstadoVazio } from "@/components/features/estado-vazio";
import { FaixaNumeros } from "@/components/features/faixa-numeros";
import { FormDialog } from "@/components/features/form-dialog";
import { LinkVoltar } from "@/components/features/link-voltar";
import { AcaoDialogo, AcaoExcluir, AcaoSeparador, MenuAcoes } from "@/components/features/menu-acoes";
import { Badge } from "@/components/ui/badge";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
// lançar, editar e excluir (ADR-0005). Num "Já paguei" ainda não conferido,
// Confirmar e Recusar ficam à vista (é a decisão a tomar); editar e excluir são
// correção rara e moram no "⋯" de cada lançamento.
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
    <div className="mx-auto w-full max-w-4xl 2xl:max-w-6xl">
      <CabecalhoPagina
        antes={<LinkVoltar href="/admin/tesouraria">Tesouraria</LinkVoltar>}
        titulo={pessoa.nome}
        descricao={pessoa.email}
        acao={
          editavel ? (
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
          ) : undefined
        }
      />

      <FaixaNumeros
        className="mt-6"
        numeros={[
          {
            rotulo: "Pagou",
            valor: formatarReal.format(Math.max(0, s.pago)),
            detalhe: `de ${formatarReal.format(s.totalPlano)}`,
          },
          {
            rotulo: "Situação",
            valor: (
              <Badge variant={s.estado === "atrasado" ? "warning" : "secondary"} className="align-middle">
                {ROTULO_ESTADO[s.estado]}
              </Badge>
            ),
          },
          ...(s.proxima
            ? [
                {
                  rotulo: "Próxima",
                  valor: formatarReal.format(s.proxima.falta),
                  detalhe: `até ${dataBr(s.proxima.vencimento)}`,
                },
              ]
            : []),
        ]}
      />

      {s.parcelas.length > 0 && (
        <section aria-labelledby="titulo-parcelas" className="mt-8">
          <h2 id="titulo-parcelas" className="text-lg font-semibold">Parcelas</h2>
          <div className="mt-3 rounded-lg border">
            <Table className="tabular-nums">
              <TableHeader>
                <TableRow>
                  <TableHead>Parcela</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead className="text-right">Situação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {s.parcelas.map((p) => (
                  <TableRow key={p.numero}>
                    <TableCell className="font-medium">{p.rotulo ?? p.numero}</TableCell>
                    <TableCell className="text-right">{formatarReal.format(p.valor)}</TableCell>
                    <TableCell>{dataBr(p.vencimento)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={p.emAtraso ? "warning" : p.estado === "paga" ? "secondary" : "outline"}>
                        {p.estado === "parcial" ? `Falta ${formatarReal.format(p.falta)}` : ROTULO_PARCELA[p.estado]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      )}

      <section aria-labelledby="titulo-lancamentos" className="mt-8">
        <h2 id="titulo-lancamentos" className="text-lg font-semibold">Lançamentos</h2>
        {lancamentos.length === 0 ? (
          <EstadoVazio className="mt-3" titulo="Nenhum lançamento ainda" />
        ) : (
          <ul className="mt-3 divide-y rounded-lg border">
            {lancamentos.map((l) => {
              const resumo = `${l.tipo === "devolucao" ? "− " : ""}${formatarReal.format(l.valor)} de ${dataBr(l.pagoEm)}`;
              return (
                <Item asChild key={l.id}>
                  <li data-lancamento={l.id} className="rounded-none not-first:border-t-border">
                    <ItemContent className="min-w-0 basis-56">
                      <ItemTitle className="line-clamp-none flex-wrap">
                        <span className="tabular-nums">
                          {l.tipo === "devolucao" ? "− " : ""}
                          {formatarReal.format(l.valor)}
                        </span>
                        <Badge
                          variant={
                            l.status === "confirmado" ? "secondary" : l.status === "recusado" ? "warning" : "outline"
                          }
                        >
                          {ROTULO_STATUS[l.status]}
                        </Badge>
                      </ItemTitle>
                      <ItemDescription className="line-clamp-none wrap-break-word">
                        {[
                          `${ROTULO_TIPO[l.tipo]} · ${ROTULO_FORMA[l.forma]} · ${dataBr(l.pagoEm)}`,
                          l.pagoPor && `pago por ${l.pagoPor}`,
                          l.referencia,
                          l.lancadoPor && `lançado por ${l.lancadoPor}`,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </ItemDescription>
                      {l.status === "recusado" && l.motivoRecusa && (
                        <ItemDescription className="text-warning">Recusado: {l.motivoRecusa}</ItemDescription>
                      )}
                    </ItemContent>
                    {editavel && (
                      <ItemActions className="flex-wrap">
                        {l.status === "informado" && <AcoesInforme id={l.id} />}
                        <MenuAcoes nome={`lançamento ${resumo}`}>
                          <AcaoDialogo
                            rotulo="Editar"
                            icone={<Pencil aria-hidden />}
                            titulo="Editar lançamento"
                            descricao="A mudança fica registrada."
                            acao={editarPagamento}
                            campos={{ id: l.id, usuarioId: pessoa.id }}
                            rotuloSubmit="Salvar"
                          >
                            <CamposLancamento prefixo={`editar-${l.id}`} hoje={hoje} inicial={l} />
                          </AcaoDialogo>
                          <AcaoSeparador />
                          <AcaoExcluir
                            acao={excluirPagamento}
                            campos={{ id: l.id }}
                            alvo="o lançamento"
                            nome={resumo}
                            aviso="A situação da pessoa é recalculada sem ele. A exclusão fica registrada."
                            rotulo="Excluir"
                            icone={<Trash2 aria-hidden />}
                            sucesso="Lançamento excluído."
                          />
                        </MenuAcoes>
                      </ItemActions>
                    )}
                  </li>
                </Item>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
