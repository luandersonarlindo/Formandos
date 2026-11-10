// Uma frase por ação do histórico (ADR-0008), sem banco e sem React.
// Quem chama monta "<autor> <frase>" e mostra os `detalhes` em linhas menores.
// Nunca devolve email: `membro.removido` guarda o email, mas a frase usa só o nome.

import type { AcaoAuditoria } from "./auditoria-acoes";
import { TEXTO_MOTIVO, type MotivoForaDaRegra } from "./decisao-regras";

export type FraseHistorico = { frase: string; detalhes: string[]; alerta?: boolean };

const reais = (v: unknown) =>
  typeof v === "number"
    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)
    : "sem valor";
const aspas = (t: unknown) => `“${String(t ?? "")}”`;
const lista = (itens: unknown) =>
  Array.isArray(itens) ? itens.map(aspas).join(", ") : aspas(itens);
const dataBr = (iso: string) => iso.split("-").reverse().join("/");

// "2026-12-12T23:59" (horário de Brasília) → "12/12/2026 às 23:59".
function prazoTexto(local: string | null | undefined) {
  if (!local) return "sem prazo";
  const [data, hora] = local.split("T");
  return `${dataBr(data)} às ${hora}`;
}
const quorumTexto = (q: unknown) => (q ? `${q}%` : "sem quórum");

type P = { numero: number; valor: number; vencimento: string };
const parcela = (p: P) => `${reais(p.valor)} (vence ${dataBr(p.vencimento)})`;
function resumoPlano(l: P[]) {
  if (!l.length) return "sem plano";
  const iguais = l.every((p) => p.valor === l[0].valor);
  return iguais
    ? `${l.length} × ${reais(l[0].valor)}, a partir de ${dataBr(l[0].vencimento)}`
    : `${l.length} parcelas, ${reais(l.reduce((s, p) => s + p.valor, 0))} no total`;
}

const SITUACAO: Record<string, string> = {
  cotando: "cotando",
  contratado: "contratado",
  descartado: "descartado",
};
const TIPO_PAGAMENTO: Record<string, string> = {
  pagamento: "pagamento",
  devolucao: "devolução",
  ajuste: "ajuste",
};
const PLANILHA: Record<string, string> = {
  membros: "membros",
  votos: "votos",
  decisoes: "decisões",
  presenca: "presença",
  fornecedores: "fornecedores",
  pagamentos: "pagamentos",
};

// `alvo` é o nome da pessoa citada (membro removido, promovido, pagamento),
// quando quem chama conseguiu achar.
export function descreverAcao(
  acao: AcaoAuditoria,
  detalhe: Record<string, unknown>,
  alvo: string | null = null,
): FraseHistorico {
  const d = detalhe as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  const pessoa = alvo ?? (typeof d.nome === "string" ? d.nome : "um membro");
  switch (acao) {
    case "decisao.fixada": {
      const motivos = (d.foraDaRegra ?? []) as MotivoForaDaRegra[];
      const detalhes: string[] = [];
      if (d.votantes != null) detalhes.push(`Votaram ${d.votantes} de ${d.membros}.`);
      if (motivos.length) detalhes.push(`Fora da regra: ${motivos.map((m) => TEXTO_MOTIVO[m]).join(" ")}`);
      if (d.justificativa) detalhes.push(`Motivo da comissão: ${aspas(d.justificativa)}`);
      return { frase: `fixou ${lista(d.escolhidas)} em ${aspas(d.pergunta)}.`, detalhes, alerta: motivos.length > 0 };
    }
    case "decisao.reaberta":
      return { frase: `reabriu a votação de ${aspas(d.pergunta)} (estava fixada em ${lista(d.escolhidas)}).`, detalhes: [] };
    case "regra.alterada": {
      const a = d.antes ?? {};
      const n = d.depois ?? {};
      const mud: string[] = [];
      if (a.prazo !== n.prazo) mud.push(`prazo de ${prazoTexto(a.prazo)} para ${prazoTexto(n.prazo)}`);
      if (a.quorumPct !== n.quorumPct) mud.push(`quórum de ${quorumTexto(a.quorumPct)} para ${quorumTexto(n.quorumPct)}`);
      return { frase: `mudou a regra de ${aspas(d.pergunta)}: ${mud.join("; ")}.`, detalhes: [] };
    }
    case "opcao.valor_alterado":
      return {
        frase: `mudou o valor de ${aspas(d.opcao)} em ${aspas(d.pergunta)}: de ${reais(d.antes)} para ${reais(d.depois)} por pessoa.`,
        detalhes: [],
      };
    case "plano.alterado": {
      if (typeof d.parcela === "number") {
        return { frase: `ajustou a parcela ${d.parcela}: de ${parcela(d.antes)} para ${parcela(d.depois)}.`, detalhes: [] };
      }
      const antes = (d.antes ?? []) as P[];
      return {
        frase: antes.length
          ? `refez o plano de parcelas: de ${resumoPlano(antes)} para ${resumoPlano(d.depois ?? [])}.`
          : `montou o plano de parcelas: ${resumoPlano(d.depois ?? [])}.`,
        detalhes: [],
      };
    }
    case "evento.alterado": {
      const mud = ((d.mudancas ?? []) as { rotulo: string; antes: string; depois: string }[]).map(
        (m) => `${m.rotulo} de ${m.antes} para ${m.depois}`,
      );
      return { frase: `mudou o evento: ${mud.join("; ")}.`, detalhes: [], alerta: true };
    }
    case "evento.link_publico":
      return {
        frase:
          d.estado === "desligado"
            ? "desligou o link público do evento."
            : d.estado === "trocado"
              ? "gerou outro link público do evento (o anterior parou de funcionar)."
              : "criou o link público do evento.",
        detalhes: [],
      };
    case "fornecedor.alterado": {
      const mud: string[] = [];
      if (d.valorAntes !== d.valorDepois) mud.push(`valor de ${reais(d.valorAntes)} para ${reais(d.valorDepois)}`);
      if (d.statusAntes !== d.statusDepois) {
        mud.push(`situação de ${SITUACAO[d.statusAntes] ?? d.statusAntes} para ${SITUACAO[d.statusDepois] ?? d.statusDepois}`);
      }
      return { frase: `mudou o fornecedor ${aspas(d.fornecedor)}: ${mud.join("; ")}.`, detalhes: [] };
    }
    case "papel.trocado":
      return {
        frase: d.para === "admin" ? `pôs ${pessoa} na comissão.` : `tirou ${pessoa} da comissão.`,
        detalhes: d.por === "master" ? ["Feito pela gestão da plataforma."] : [],
      };
    case "papel.tesouraria":
      return { frase: d.tesouraria ? `pôs ${pessoa} na tesouraria.` : `tirou ${pessoa} da tesouraria.`, detalhes: [] };
    case "membro.removido":
      return { frase: `removeu ${pessoa} da turma.`, detalhes: d.por === "master" ? ["Feito pela gestão da plataforma."] : [] };
    case "turma.arquivada":
      return {
        frase: "arquivou a turma.",
        detalhes: typeof d.excluirEm === "string" ? [`Tudo será excluído em ${dataBr(d.excluirEm)}.`] : [],
      };
    case "turma.prazo_exclusao":
      return {
        frase: "mudou a data de exclusão da turma.",
        detalhes:
          typeof d.antes === "string" && typeof d.depois === "string"
            ? [`Era ${dataBr(d.antes)}, agora é ${dataBr(d.depois)}.`]
            : [],
      };
    case "turma.desarquivada":
      return { frase: "desarquivou a turma.", detalhes: [] };
    case "turma.excluida":
      return {
        frase: d.por === "prazo" ? "a turma foi excluída na data marcada." : "excluiu a turma.",
        detalhes: [],
      };
    case "turma.exportada":
      return { frase: `baixou a planilha de ${PLANILHA[d.tipo] ?? d.tipo}.`, detalhes: [] };
    case "pagamento.lancado":
      return { frase: `lançou ${TIPO_PAGAMENTO[d.tipo] ?? "pagamento"} de ${reais(d.valor)} para ${pessoa}.`, detalhes: [] };
    case "pagamento.informado":
      return { frase: `informou um pagamento de ${reais(d.valor)}.`, detalhes: [] };
    case "pagamento.confirmado":
      return { frase: `confirmou ${reais(d.valor)} de ${pessoa}.`, detalhes: [] };
    case "pagamento.recusado":
      return { frase: `recusou o informe de ${reais(d.valor)} de ${pessoa}.`, detalhes: d.motivo ? [`Motivo: ${aspas(d.motivo)}`] : [] };
    case "pagamento.editado":
      return { frase: `corrigiu um lançamento de ${pessoa}.`, detalhes: [] };
    case "pagamento.excluido":
      return { frase: d.cancelado ? `cancelou um informe de ${reais(d.valor)}.` : `excluiu um lançamento de ${pessoa}.`, detalhes: [] };
    case "conta.excluida":
      return { frase: "excluiu a conta.", detalhes: [] };
  }
}
