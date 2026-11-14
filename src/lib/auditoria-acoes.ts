// Vocabulário fechado da trilha de auditoria (para o relatório não virar
// texto livre) e quais ações a turma pode ver. Sem acesso ao banco.

export const ACOES_AUDITORIA = [
  "papel.trocado",
  "membro.removido",
  "conta.excluida",
  "turma.arquivada",
  "turma.desarquivada",
  "turma.excluida",
  // ADR-0003: decisões, regra da pergunta e valor por pessoa.
  "decisao.fixada",
  "decisao.reaberta",
  "regra.alterada",
  "opcao.valor_alterado",
  // ADR-0005: tesouraria, plano de parcelas e pagamentos.
  "papel.tesouraria",
  "plano.alterado",
  "pagamento.lancado",
  "pagamento.informado",
  "pagamento.confirmado",
  "pagamento.recusado",
  "pagamento.editado",
  "pagamento.excluido",
  // ADR-0014: vários pagamentos colados da planilha, numa entrada só.
  "pagamento.importado",
  // ADR-0007: download de planilha da turma (quem levou a lista de emails?).
  "turma.exportada",
  // ADR-0008: mudança no evento, link público e fornecedor.
  "evento.alterado",
  "evento.link_publico",
  "fornecedor.alterado",
  // ADR-0009: data de exclusão da turma arquivada mudou.
  "turma.prazo_exclusao",
  // ADR-0013: prazo para confirmar presença mudou.
  "presenca.prazo",
] as const;
export type AcaoAuditoria = (typeof ACOES_AUDITORIA)[number];

// Únicas ações que aparecem para a turma, no histórico das decisões. O detalhe
// delas leva só textos e contagens (o que a turma já vê no relatório), nunca
// email nem quem votou em quê. Qualquer ação nova precisa decidir aqui se é
// visível.
export const ACOES_VISIVEIS_TURMA = [
  "decisao.fixada",
  "decisao.reaberta",
  "regra.alterada",
  "opcao.valor_alterado",
  // ADR-0005: mudança no plano de parcelas (vale para todos; sem dado de pessoa).
  "plano.alterado",
  // ADR-0008: data, horário, local ou endereço do evento.
  "evento.alterado",
  // ADR-0009: arquivamento e data de exclusão (todos precisam saber quando
  // tudo será apagado; o detalhe leva só o nome da turma e as datas).
  "turma.arquivada",
  "turma.desarquivada",
  "turma.prazo_exclusao",
  "presenca.prazo",
] as const satisfies readonly AcaoAuditoria[];

// Pagamentos individuais: só a tesouraria vê no histórico (ADR-0005). Os
// outros admins não veem valor de ninguém.
export const ACOES_SO_TESOURARIA = [
  "pagamento.lancado",
  "pagamento.informado",
  "pagamento.confirmado",
  "pagamento.recusado",
  "pagamento.editado",
  "pagamento.excluido",
  "pagamento.importado",
] as const satisfies readonly AcaoAuditoria[];

// Nunca aparece em tela de turma: não tem turma e guarda o email da conta.
export const ACOES_FORA_DO_HISTORICO = ["conta.excluida"] as const satisfies readonly AcaoAuditoria[];

// Ações que cada público vê no histórico da turma (ADR-0008, tabela "quem vê o quê").
export type PublicoHistorico = "turma" | "comissao" | "tesouraria";

export function acoesVisiveis(publico: PublicoHistorico): AcaoAuditoria[] {
  if (publico === "turma") return [...ACOES_VISIVEIS_TURMA];
  const fora = new Set<string>([
    ...ACOES_FORA_DO_HISTORICO,
    ...(publico === "comissao" ? ACOES_SO_TESOURARIA : []),
  ]);
  return ACOES_AUDITORIA.filter((a) => !fora.has(a));
}
