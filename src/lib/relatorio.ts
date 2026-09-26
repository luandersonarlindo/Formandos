import "server-only";
import { pool } from "./db";
import type { Membro } from "./dal";

export type OpcaoRelatorio = {
  id: string;
  texto: string;
  votos: number;
  // Percentual sobre quem respondeu a enquete (em múltipla, a soma passa de 100%).
  percentual: number;
};
export type EnqueteRelatorio = {
  id: string;
  titulo: string;
  tipo: "unica" | "multipla";
  votantes: number;
  opcoes: OpcaoRelatorio[];
};
export type CategoriaRelatorio = {
  id: string;
  nome: string;
  enquetes: EnqueteRelatorio[];
};
export type Relatorio = {
  totalMembros: number;
  categorias: CategoriaRelatorio[];
};

// Resultado agregado (sem identificar quem votou) de um catálogo, só com os
// votos da turma do usuário. Devolve null se o catálogo não é visível à turma.
export async function getRelatorio(
  catalogoId: string,
  membro: Membro,
): Promise<Relatorio | null> {
  const { rowCount } = await pool.query(
    "select 1 from catalogos where id = $1 and (turma_id is null or turma_id = $2)",
    [catalogoId, membro.turmaId],
  );
  if (!rowCount) return null;

  const [linhas, votantes, membros] = await Promise.all([
    pool.query(
      `select ca.id as categoria_id, ca.nome as categoria,
              e.id as enquete_id, e.titulo, e.tipo,
              o.id as opcao_id, o.texto,
              count(v.usuario_id)::int as votos
         from categorias ca
         join enquetes e on e.categoria_id = ca.id
         join opcoes o on o.enquete_id = e.id
         left join votos v on v.opcao_id = o.id and v.turma_id = $2
        where ca.catalogo_id = $1
        group by ca.id, e.id, o.id
        order by ca.ordem, e.ordem, o.ordem`,
      [catalogoId, membro.turmaId],
    ),
    pool.query(
      `select o.enquete_id, count(distinct v.usuario_id)::int as votantes
         from votos v
         join opcoes o on o.id = v.opcao_id
         join enquetes e on e.id = o.enquete_id
         join categorias ca on ca.id = e.categoria_id
        where ca.catalogo_id = $1 and v.turma_id = $2
        group by o.enquete_id`,
      [catalogoId, membro.turmaId],
    ),
    pool.query("select count(*)::int as total from membros where turma_id = $1", [
      membro.turmaId,
    ]),
  ]);

  const votantesPorEnquete = new Map<string, number>(
    votantes.rows.map((r) => [r.enquete_id, r.votantes]),
  );

  const categorias: CategoriaRelatorio[] = [];
  for (const l of linhas.rows) {
    let categoria = categorias.find((c) => c.id === l.categoria_id);
    if (!categoria) {
      categoria = { id: l.categoria_id, nome: l.categoria, enquetes: [] };
      categorias.push(categoria);
    }
    let enquete = categoria.enquetes.find((e) => e.id === l.enquete_id);
    if (!enquete) {
      enquete = {
        id: l.enquete_id,
        titulo: l.titulo,
        tipo: l.tipo,
        votantes: votantesPorEnquete.get(l.enquete_id) ?? 0,
        opcoes: [],
      };
      categoria.enquetes.push(enquete);
    }
    enquete.opcoes.push({
      id: l.opcao_id,
      texto: l.texto,
      votos: l.votos,
      percentual:
        enquete.votantes === 0 ? 0 : (l.votos / enquete.votantes) * 100,
    });
  }
  // Mais votadas primeiro (a query já traz o desempate pela ordem do catálogo).
  for (const c of categorias)
    for (const e of c.enquetes)
      e.opcoes.sort((a, b) => b.votos - a.votos);

  return { totalMembros: membros.rows[0].total, categorias };
}
