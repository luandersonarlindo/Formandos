import type { Metadata } from "next";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { editarSaida, excluirSaida, lancarSaida } from "@/actions/saidas";
import { AbasTesouraria } from "@/components/features/abas-tesouraria";
import { CabecalhoPagina } from "@/components/features/cabecalho-pagina";
import { CamposSaida } from "@/components/features/campos-saida";
import { EstadoVazio } from "@/components/features/estado-vazio";
import { FaixaNumeros } from "@/components/features/faixa-numeros";
import { FormDialog } from "@/components/features/form-dialog";
import { AcaoDialogo, AcaoExcluir, AcaoSeparador, MenuAcoes } from "@/components/features/menu-acoes";
import { Badge } from "@/components/ui/badge";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
// Aba "Saídas" da tesouraria (D-12): a lista vem antes, "Por fornecedor" é
// consulta e fica no fim; editar e excluir moram no "⋯" de cada saída.
export default async function SaidasPage() {
  const tesouraria = await exigirTesouraria();
  const editavel = !tesouraria.arquivadaEm;
  const hoje = hojeBrasil();
  const [{ saidas, fornecedores, porFornecedor }, caixa] = await Promise.all([
    getSaidasDaTesouraria(tesouraria.turmaId),
    getCaixa(tesouraria.turmaId),
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl 2xl:max-w-6xl">
      <CabecalhoPagina
        titulo="Tesouraria"
        descricao="O que foi pago em nome da turma. Lance depois de conferir no extrato; a turma vê cada saída, sem a referência."
        acao={
          editavel ? (
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
          ) : undefined
        }
      />
      <AbasTesouraria atual="saidas" />

      <FaixaNumeros
        className="mt-6"
        numeros={[
          { rotulo: "Arrecadado", valor: formatarReal.format(caixa.arrecadado), detalhe: "confirmado pela tesouraria" },
          { rotulo: "Saídas", valor: formatarReal.format(caixa.saidas) },
          { rotulo: "Saldo", valor: formatarReal.format(caixa.saldo) },
        ]}
      />
      <p className="mt-2 text-xs text-muted-foreground">{FRASE_SALDO}</p>

      <section aria-labelledby="titulo-saidas" className="mt-8">
        <h2 id="titulo-saidas" className="text-lg font-semibold">
          Saídas <span className="font-normal text-muted-foreground tabular-nums">({saidas.length})</span>
        </h2>
        {saidas.length === 0 ? (
          <EstadoVazio
            className="mt-3"
            titulo="Nenhuma saída lançada"
            descricao="Sem saídas, a turma vê só o que entrou."
          />
        ) : (
          <ul className="mt-3 divide-y rounded-lg border">
            {saidas.map((s) => (
              <Item asChild key={s.id}>
                <li data-saida={s.id} className="rounded-none not-first:border-t-border">
                  <ItemContent className="min-w-0 basis-0">
                    <ItemTitle className="line-clamp-none flex-wrap wrap-break-word">
                      {s.descricao}
                      {s.soComissao && <Badge variant="outline">só da comissão</Badge>}
                    </ItemTitle>
                    <ItemDescription className="wrap-break-word">
                      {dataBr(s.pagoEm)}
                      {s.fornecedor && ` · ${s.fornecedor}`}
                      {s.referencia && ` · ref. ${s.referencia}`}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions className="shrink-0">
                    <span className="font-medium tabular-nums">{formatarReal.format(s.valor)}</span>
                    {editavel && (
                      <MenuAcoes nome={s.descricao}>
                        <AcaoDialogo
                          rotulo="Editar"
                          icone={<Pencil aria-hidden />}
                          titulo="Editar saída"
                          descricao="A correção fica no histórico da turma, com o antes e o depois."
                          acao={editarSaida}
                          campos={{ id: s.id }}
                          rotuloSubmit="Salvar saída"
                        >
                          <CamposSaida prefixo={`editar-${s.id}`} hoje={hoje} fornecedores={fornecedores} inicial={s} />
                        </AcaoDialogo>
                        <AcaoSeparador />
                        <AcaoExcluir
                          acao={excluirSaida}
                          campos={{ id: s.id }}
                          alvo="a saída"
                          nome={`${s.descricao}, ${formatarReal.format(s.valor)}`}
                          aviso="O saldo é recalculado sem ela. A exclusão fica no histórico da turma."
                          rotulo="Excluir"
                          icone={<Trash2 aria-hidden />}
                          sucesso="Saída excluída."
                        />
                      </MenuAcoes>
                    )}
                  </ItemActions>
                </li>
              </Item>
            ))}
          </ul>
        )}
      </section>

      {porFornecedor.length > 0 && (
        <section aria-labelledby="titulo-fornecedor" className="mt-8">
          <h2 id="titulo-fornecedor" className="text-lg font-semibold">Por fornecedor</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Contratado é o valor orçado no cadastro do fornecedor. Só a comissão vê esta parte.
          </p>
          <div className="mt-3 rounded-lg border">
            <Table className="tabular-nums">
              <TableHeader>
                <TableRow>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead className="text-right">Contratado</TableHead>
                  <TableHead className="text-right">Pago</TableHead>
                  <TableHead className="text-right">Falta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {porFornecedor.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>{f.nome}</TableCell>
                    <TableCell className="text-right">{f.contratado === null ? "—" : formatarReal.format(f.contratado)}</TableCell>
                    <TableCell className="text-right">{formatarReal.format(f.pago)}</TableCell>
                    <TableCell className="text-right">{f.falta === null ? "—" : formatarReal.format(f.falta)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      )}
    </div>
  );
}
