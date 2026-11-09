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
] as const satisfies readonly AcaoAuditoria[];
