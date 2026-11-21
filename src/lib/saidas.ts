import "server-only";
import { pool } from "./db";
import { resumoPorFornecedor, saidaParaTurma, type Fornecedor, type Saida } from "./saidas-regras";

// Leitura das saídas do caixa (ADR-0022).

// Todas as saídas da turma, com tudo: só para a tesouraria e a comissão.
export async function listarSaidas(turmaId: string): Promise<Saida[]> {
  const { rows } = await pool.query(
    `select s.id, s.descricao, s.valor::float8 as valor, to_char(s.pago_em, 'YYYY-MM-DD') as "pagoEm",
            s.referencia, s.so_comissao as "soComissao", s.fornecedor_id as "fornecedorId", f.nome as fornecedor
       from saidas s left join fornecedores f on f.id = s.fornecedor_id
      where s.turma_id = $1
      order by s.pago_em desc, s.created_at desc`,
    [turmaId],
  );
  return rows;
}

// O que a turma vê: sem referência, e "Outras despesas" na só da comissão.
export async function listarSaidasDaTurma(turmaId: string) {
  return (await listarSaidas(turmaId)).map(saidaParaTurma);
}

export async function listarFornecedoresDaTurma(turmaId: string): Promise<Fornecedor[]> {
  const { rows } = await pool.query(
    `select id, nome, status, valor_orcado::float8 as "valorOrcado"
       from fornecedores where turma_id = $1 order by nome`,
    [turmaId],
  );
  return rows;
}

export async function getSaidasDaTesouraria(turmaId: string) {
  const [saidas, fornecedores] = await Promise.all([listarSaidas(turmaId), listarFornecedoresDaTurma(turmaId)]);
  return { saidas, fornecedores, porFornecedor: resumoPorFornecedor(fornecedores, saidas) };
}
