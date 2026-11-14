import "server-only";
import { pool } from "./db";
import type { Celula } from "./csv";

// Planilhas da turma (ADR-0007). Cada tipo devolve cabeçalho e linhas para
// `paraCsv`. Quem pode baixar cada uma é decidido na rota: tudo é da
// comissão, e `pagamentos` só da tesouraria.

export const TIPOS_EXPORTACAO = [
  "membros",
  "votos",
  "decisoes",
  "presenca",
  "fornecedores",
  "pagamentos",
] as const;
export type TipoExportacao = (typeof TIPOS_EXPORTACAO)[number];

export const ROTULO_EXPORTACAO: Record<TipoExportacao, string> = {
  membros: "Membros",
  votos: "Votos (quem votou em quê)",
  decisoes: "Decisões",
  presenca: "Presença",
  fornecedores: "Fornecedores",
  pagamentos: "Pagamentos",
};

type Planilha = { cabecalho: string[]; linhas: Celula[][] };

const dataBr = "to_char(%s at time zone 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI')";
const quando = (coluna: string) => dataBr.replace("%s", coluna);

// Toda coluna tem nome próprio (c1, c2...): duas expressões sem nome (dois
// "case", por exemplo) viravam a mesma chave no objeto da linha, e uma coluna
// sumia da planilha.

export async function montarPlanilha(tipo: TipoExportacao, turmaId: string): Promise<Planilha> {
  switch (tipo) {
    case "membros": {
      const { rows } = await pool.query(
        `select u.name as c1, u.email as c2,
                case m.papel when 'admin' then 'comissão' when 'observador' then 'observador' else 'participante' end as c3,
                case when m.papel = 'admin' and m.tesouraria then 'sim' else '' end as c4,
                ${quando("m.created_at")} as c5
           from membros m join usuarios u on u.id = m.usuario_id
          where m.turma_id = $1 order by u.name`,
        [turmaId],
      );
      return {
        cabecalho: ["Nome", "Email", "Papel", "Tesouraria", "Na turma desde"],
        linhas: rows.map((r) => Object.values(r) as Celula[]),
      };
    }
    case "votos": {
      const { rows } = await pool.query(
        // Pergunta com voto secreto (ADR-0010): sem nome e sem hora, que junto
        // com a lista de quem votou ajudaria a descobrir a escolha.
        `select c.nome as c1, ca.nome as c2, e.titulo as c3, o.texto as c4,
                case when coalesce(r.secreto, false) then '(voto secreto)' else u.name end as c5,
                case when coalesce(r.secreto, false) then null else ${quando("v.created_at")} end as c6
           from votos v
           join opcoes o on o.id = v.opcao_id
           join enquetes e on e.id = o.enquete_id
           join categorias ca on ca.id = e.categoria_id
           join catalogos c on c.id = ca.catalogo_id
           join usuarios u on u.id = v.usuario_id
           left join regras_enquete r on r.turma_id = v.turma_id and r.enquete_id = e.id
          where v.turma_id = $1
          order by c.nome, ca.ordem, e.ordem, o.ordem,
                   case when coalesce(r.secreto, false) then null else u.name end`,
        [turmaId],
      );
      return {
        cabecalho: ["Catálogo", "Categoria", "Pergunta", "Opção", "Quem votou", "Votou em"],
        linhas: rows.map((r) => Object.values(r) as Celula[]),
      };
    }
    case "decisoes": {
      const { rows } = await pool.query(
        `select e.titulo as c1, string_agg(o.texto, ', ' order by o.ordem) as c2,
                ${quando("max(d.created_at)")} as c3, max(d.votantes) as c4, max(d.membros) as c5,
                case when coalesce(max(cardinality(d.fora_da_regra)), 0) > 0 then 'fora da regra' else 'dentro da regra' end as c6,
                max(d.justificativa) as c7
           from decisoes d
           join enquetes e on e.id = d.enquete_id
           join opcoes o on o.id = d.opcao_id
          where d.turma_id = $1
          group by e.id, e.titulo order by max(d.created_at)`,
        [turmaId],
      );
      return {
        cabecalho: ["Pergunta", "Escolha", "Fixada em", "Votaram", "Membros", "Regra", "Motivo da comissão"],
        linhas: rows.map((r) => Object.values(r) as Celula[]),
      };
    }
    case "presenca": {
      const { rows } = await pool.query(
        `select u.name as c1,
                coalesce(case p.status when 'vou' then 'vai' when 'talvez' then 'talvez' when 'nao' then 'não vai' end, 'sem resposta') as c2,
                case when p.status = 'vou' then p.acompanhantes else 0 end as c3,
                p.observacao as c4
           from membros m
           join usuarios u on u.id = m.usuario_id
           left join presencas p on p.turma_id = m.turma_id and p.usuario_id = m.usuario_id
          where m.turma_id = $1 order by u.name`,
        [turmaId],
      );
      return {
        cabecalho: ["Nome", "Resposta", "Acompanhantes", "Observação"],
        linhas: rows.map((r) => Object.values(r) as Celula[]),
      };
    }
    case "fornecedores": {
      const { rows } = await pool.query(
        `select nome as c1, categoria as c2, contato as c3, status as c4, valor_orcado::float8 as c5, descricao as c6
           from fornecedores where turma_id = $1 order by categoria, nome`,
        [turmaId],
      );
      return {
        cabecalho: ["Fornecedor", "Categoria", "Contato", "Situação", "Valor (R$)", "Descrição"],
        linhas: rows.map((r) => Object.values(r) as Celula[]),
      };
    }
    case "pagamentos": {
      const { rows } = await pool.query(
        `select coalesce(u.name, 'ex-membro') as c1, p.tipo as c2, p.valor::float8 as c3,
                to_char(p.pago_em, 'DD/MM/YYYY') as c4, p.forma as c5, p.pago_por as c6,
                p.referencia as c7, p.status as c8, p.motivo_recusa as c9
           from pagamentos p left join usuarios u on u.id = p.usuario_id
          where p.turma_id = $1 order by p.pago_em, u.name`,
        [turmaId],
      );
      return {
        cabecalho: ["Nome", "Tipo", "Valor (R$)", "Data", "Forma", "Quem pagou", "Referência", "Estado", "Motivo da recusa"],
        linhas: rows.map((r) => Object.values(r) as Celula[]),
      };
    }
  }
}
