import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BotaoImprimir } from "@/components/features/botao-imprimir";
import { HistoricoDecisoes } from "@/components/features/historico-decisoes";
import { MudancasPlano } from "@/components/features/mudancas-plano";
import { exigirAdmin } from "@/lib/dal";
import { formatarDataHora } from "@/lib/datas";
import { formatarReal } from "@/lib/orcamento";
import { getRegistroTurma } from "@/lib/registro";

export const metadata: Metadata = { title: "Registro da turma" };

// Registro da turma para imprimir ou salvar como PDF (ADR-0007). Sem dado
// pessoal além dos nomes da comissão: pode ser repassado à turma.
function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 break-inside-avoid-page print:mt-6">
      <h2 className="border-b pb-1 text-lg font-semibold">{titulo}</h2>
      <div className="mt-3 text-sm">{children}</div>
    </section>
  );
}

const pct = (n: number, de: number) => (de === 0 ? "0%" : `${Math.round((n / de) * 100)}%`);

export default async function RegistroTurmaPage() {
  const admin = await exigirAdmin();
  const r = await getRegistroTurma(admin);
  const geradoEm = formatarDataHora.format(new Date());

  return (
    <div className="mx-auto w-full max-w-3xl print:max-w-none">
      <Link
        href="/admin/turma"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground print:hidden"
      >
        <ArrowLeft className="size-4" aria-hidden /> Turma
      </Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Registro da turma · gerado em {geradoEm}</p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{r.turma.nome}</h1>
        </div>
        <BotaoImprimir />
      </div>
      <p className="mt-2 text-sm text-muted-foreground print:hidden">
        Na janela de impressão, escolha “Salvar como PDF”. Este registro não traz quem votou em quê, quem vai à
        festa nem quanto cada pessoa pagou.
      </p>

      <Secao titulo="Evento e comissão">
        <dl className="grid gap-1 sm:grid-cols-[10rem_1fr]">
          <dt className="text-muted-foreground">Data</dt>
          <dd>{r.turma.dataEvento ? formatarDataHora.format(r.turma.dataEvento) : "a definir"}</dd>
          <dt className="text-muted-foreground">Local</dt>
          <dd>{[r.turma.local, r.turma.endereco].filter(Boolean).join(", ") || "a definir"}</dd>
          <dt className="text-muted-foreground">Comissão</dt>
          <dd>{r.comissao.join(", ")}</dd>
        </dl>
      </Secao>

      <Secao titulo={`Decisões (${r.decisoes.length})`}>
        {r.decisoes.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma decisão fixada.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {r.decisoes.map((d) => (
              <li key={d.enqueteId} className="break-inside-avoid">
                <p className="text-muted-foreground">{d.pergunta}</p>
                <p className="font-medium">{d.escolhas.join(" · ")}</p>
                <p className="text-xs text-muted-foreground">
                  {d.votantes !== null && `Votaram ${d.votantes} de ${d.membros}. `}
                  {d.foraDaRegra ? "Fixada fora da regra." : d.votantes !== null ? "Dentro da regra." : ""}
                  {d.justificativa && ` Motivo da comissão: “${d.justificativa}”`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Secao>

      <Secao titulo={`Resultado das votações (${r.perguntas.length} com voto)`}>
        {r.perguntas.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma pergunta recebeu voto.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {r.perguntas.map((p) => (
              <li key={p.id} className="break-inside-avoid">
                <p className="font-medium">{p.titulo}</p>
                <p className="text-xs text-muted-foreground">
                  {p.catalogo} · {p.votantes} {p.votantes === 1 ? "pessoa votou" : "pessoas votaram"}
                </p>
                <table className="mt-1 w-full text-sm">
                  <tbody>
                    {[...p.opcoes]
                      .sort((a, b) => b.votos - a.votos)
                      .map((o) => (
                        <tr key={o.texto} className="border-b last:border-0">
                          <td className="py-0.5 pr-2">{o.texto}</td>
                          <td className="w-16 py-0.5 text-right tabular-nums">{o.votos}</td>
                          <td className="w-14 py-0.5 text-right text-muted-foreground tabular-nums">
                            {pct(o.votos, p.votantes)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </li>
            ))}
          </ul>
        )}
      </Secao>

      <Secao titulo="Presença">
        <p className="tabular-nums">
          {r.presenca.vou} vão, {r.presenca.talvez} talvez, {r.presenca.nao} não vão e {r.presenca.pendente} sem
          resposta, de {r.presenca.membros} membros. Acompanhantes: {r.presenca.acompanhantes}. Pessoas esperadas:{" "}
          <strong>{r.presenca.pessoas}</strong>.
        </p>
      </Secao>

      <Secao titulo="Fornecedores contratados">
        {r.fornecedores.length === 0 ? (
          <p className="text-muted-foreground">Nenhum fornecedor marcado como contratado.</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {r.fornecedores.map((f) => (
                <tr key={f.categoria} className="border-b last:border-0">
                  <td className="py-1 pr-2 font-medium">{f.categoria}</td>
                  <td className="py-1 pr-2">{f.nomes.join(", ")}</td>
                  <td className="py-1 text-right tabular-nums">{f.total > 0 ? formatarReal.format(f.total) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="mt-1 text-xs text-muted-foreground">Total contratado por categoria.</p>
      </Secao>

      {r.caixa.previsto > 0 && (
        <Secao titulo="Caixa da turma">
          <p className="tabular-nums">
            Arrecadado: <strong>{formatarReal.format(r.caixa.arrecadado)}</strong> de{" "}
            {formatarReal.format(r.caixa.previsto)} previstos ({pct(r.caixa.arrecadado, r.caixa.previsto)}).
          </p>
          {r.caixa.regrasDinheiro && (
            <p className="mt-2 whitespace-pre-wrap text-muted-foreground">
              Regras do dinheiro: {r.caixa.regrasDinheiro}
            </p>
          )}
        </Secao>
      )}

      {(r.historico.length > 0 || r.plano.length > 0) && (
        <Secao titulo="Histórico">
          {r.historico.length > 0 && <HistoricoDecisoes itens={r.historico} mostrarPergunta />}
          {r.plano.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 font-medium">Mudanças no plano de parcelas</p>
              <MudancasPlano itens={r.plano} />
            </div>
          )}
        </Secao>
      )}
    </div>
  );
}
