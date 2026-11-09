import "server-only";
import { pool } from "./db";
import type { Membro } from "./dal";
import { catalogoVisivelSql, enqueteVisivelSql } from "./catalogo-visibilidade";
import { listarDecisoes } from "./dashboard";
import { getResumoPresenca } from "./presenca";
import { getCaixa } from "./pagamentos";
import { listarHistoricoDecisoes, listarMudancasPlano } from "./auditoria";

// "Registro da turma" (ADR-0007): tudo o que a comissão leva para prestar
// contas, sem dado pessoal além dos nomes da comissão. Nada aqui diz quem
// votou em quê, quem vai ou quanto cada um pagou.

export async function getRegistroTurma(membro: Membro) {
  const turmaId = membro.turmaId;
  const [turma, comissao, resultados, fornecedores, decisoes, presenca, caixa, historico, plano] =
    await Promise.all([
      pool.query(
        `select nome, data_evento as "dataEvento", local_evento as local, endereco
           from turmas where id = $1`,
        [turmaId],
      ),
      pool.query(
        `select u.name from membros m join usuarios u on u.id = m.usuario_id
          where m.turma_id = $1 and m.papel = 'admin' order by u.name`,
        [turmaId],
      ),
      // Contagem por opção, só das perguntas que tiveram voto.
      pool.query(
        `select c.nome as catalogo, e.id as "enqueteId", e.titulo, o.texto, count(v.usuario_id)::int as votos,
                (select count(distinct v2.usuario_id)::int from votos v2 join opcoes o2 on o2.id = v2.opcao_id
                  where o2.enquete_id = e.id and v2.turma_id = $1) as votantes
           from catalogos c
           join categorias ca on ca.catalogo_id = c.id
           join enquetes e on e.categoria_id = ca.id
           join opcoes o on o.enquete_id = e.id
           left join votos v on v.opcao_id = o.id and v.turma_id = $1
          where ${catalogoVisivelSql("$1")} and ${enqueteVisivelSql("$1")}
            and exists (select 1 from votos v3 join opcoes o3 on o3.id = v3.opcao_id
                         where o3.enquete_id = e.id and v3.turma_id = $1)
          group by c.nome, c.turma_id, ca.ordem, e.id, e.titulo, e.ordem, o.id, o.texto, o.ordem
          order by (c.turma_id is null) desc, c.nome, ca.ordem, e.ordem, o.ordem`,
        [turmaId],
      ),
      pool.query(
        `select nome, categoria, valor_orcado::float8 as valor
           from fornecedores where turma_id = $1 and status = 'contratado'
          order by categoria, nome`,
        [turmaId],
      ),
      listarDecisoes(membro),
      getResumoPresenca(turmaId),
      getCaixa(turmaId),
      listarHistoricoDecisoes(turmaId),
      listarMudancasPlano(turmaId),
    ]);

  // Agrupa resultados por pergunta.
  const perguntas: {
    id: string;
    catalogo: string;
    titulo: string;
    votantes: number;
    opcoes: { texto: string; votos: number }[];
  }[] = [];
  for (const r of resultados.rows) {
    let p = perguntas.find((x) => x.id === r.enqueteId);
    if (!p) {
      p = { id: r.enqueteId, catalogo: r.catalogo, titulo: r.titulo, votantes: r.votantes, opcoes: [] };
      perguntas.push(p);
    }
    p.opcoes.push({ texto: r.texto, votos: r.votos });
  }

  // Total contratado por categoria, sem o preço de cada fornecedor.
  const porCategoria = new Map<string, { nomes: string[]; total: number }>();
  for (const f of fornecedores.rows) {
    const c = porCategoria.get(f.categoria) ?? { nomes: [], total: 0 };
    c.nomes.push(f.nome);
    c.total += f.valor ?? 0;
    porCategoria.set(f.categoria, c);
  }

  return {
    turma: turma.rows[0] as { nome: string; dataEvento: Date | null; local: string | null; endereco: string | null },
    comissao: comissao.rows.map((r) => r.name as string),
    decisoes,
    perguntas,
    fornecedores: [...porCategoria].map(([categoria, c]) => ({ categoria, ...c })),
    presenca,
    caixa,
    historico,
    plano,
  };
}
