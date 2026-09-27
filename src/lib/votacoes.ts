import "server-only";
import { pool } from "./db";
import type { Membro } from "./dal";

export type CatalogoResumo = {
  id: string;
  nome: string;
  padrao: boolean;
  total: number;
  votadas: number;
};

export type OpcaoEnquete = { id: string; texto: string; exclusiva: boolean };
export type EnqueteVotacao = {
  id: string;
  titulo: string;
  tipo: "unica" | "multipla";
  opcoes: OpcaoEnquete[];
  selecionadas: string[];
  // Opções que a comissão fixou como decisão da turma (vazio se ainda não decidiu).
  decisao: string[];
};
export type CategoriaVotacao = {
  id: string;
  nome: string;
  enquetes: EnqueteVotacao[];
};
export type CatalogoVotacao = {
  id: string;
  nome: string;
  padrao: boolean;
  categorias: CategoriaVotacao[];
};

// Catálogos visíveis à turma: o padrão (turma_id nulo) e os da própria turma.
export async function listarCatalogos(
  membro: Membro,
): Promise<CatalogoResumo[]> {
  const { rows } = await pool.query(
    `select c.id, c.nome, c.turma_id is null as padrao,
            (select count(*)
               from enquetes e
               join categorias ca on ca.id = e.categoria_id
              where ca.catalogo_id = c.id)::int as total,
            (select count(distinct e.id)
               from votos v
               join opcoes o on o.id = v.opcao_id
               join enquetes e on e.id = o.enquete_id
               join categorias ca on ca.id = e.categoria_id
              where ca.catalogo_id = c.id and v.usuario_id = $1)::int as votadas
       from catalogos c
      where c.turma_id is null or c.turma_id = $2
      order by (c.turma_id is null) desc, c.nome`,
    [membro.usuarioId, membro.turmaId],
  );
  return rows;
}

// Catálogo com categorias, enquetes, opções e os votos atuais do usuário.
// Devolve null se o catálogo não existe ou pertence a outra turma.
export async function getCatalogoParaVotar(
  catalogoId: string,
  membro: Membro,
): Promise<CatalogoVotacao | null> {
  const { rows: catalogos } = await pool.query(
    `select id, nome, turma_id is null as padrao
       from catalogos
      where id = $1 and (turma_id is null or turma_id = $2)`,
    [catalogoId, membro.turmaId],
  );
  if (catalogos.length === 0) return null;

  const [categorias, enquetes, opcoes, votos, decisoes] = await Promise.all([
    pool.query(
      "select id, nome from categorias where catalogo_id = $1 order by ordem",
      [catalogoId],
    ),
    pool.query(
      `select e.id, e.categoria_id, e.titulo, e.tipo
         from enquetes e
         join categorias ca on ca.id = e.categoria_id
        where ca.catalogo_id = $1
        order by e.ordem`,
      [catalogoId],
    ),
    pool.query(
      `select o.id, o.enquete_id, o.texto, o.exclusiva
         from opcoes o
         join enquetes e on e.id = o.enquete_id
         join categorias ca on ca.id = e.categoria_id
        where ca.catalogo_id = $1
        order by o.ordem`,
      [catalogoId],
    ),
    pool.query(
      `select v.opcao_id
         from votos v
         join opcoes o on o.id = v.opcao_id
         join enquetes e on e.id = o.enquete_id
         join categorias ca on ca.id = e.categoria_id
        where ca.catalogo_id = $1 and v.usuario_id = $2`,
      [catalogoId, membro.usuarioId],
    ),
    pool.query(
      `select d.opcao_id
         from decisoes d
         join enquetes e on e.id = d.enquete_id
         join categorias ca on ca.id = e.categoria_id
        where ca.catalogo_id = $1 and d.turma_id = $2`,
      [catalogoId, membro.turmaId],
    ),
  ]);

  const votados = new Set<string>(votos.rows.map((v) => v.opcao_id));
  const decididas = new Set<string>(decisoes.rows.map((d) => d.opcao_id));

  return {
    id: catalogos[0].id,
    nome: catalogos[0].nome,
    padrao: catalogos[0].padrao,
    categorias: categorias.rows.map((c) => ({
      id: c.id,
      nome: c.nome,
      enquetes: enquetes.rows
        .filter((e) => e.categoria_id === c.id)
        .map((e) => {
          const ops: OpcaoEnquete[] = opcoes.rows
            .filter((o) => o.enquete_id === e.id)
            .map((o) => ({ id: o.id, texto: o.texto, exclusiva: o.exclusiva }));
          return {
            id: e.id,
            titulo: e.titulo,
            tipo: e.tipo,
            opcoes: ops,
            selecionadas: ops.filter((o) => votados.has(o.id)).map((o) => o.id),
            decisao: ops.filter((o) => decididas.has(o.id)).map((o) => o.id),
          };
        }),
    })),
  };
}
