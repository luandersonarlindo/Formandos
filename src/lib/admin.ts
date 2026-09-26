import "server-only";
import { pool } from "./db";

export type EventoAdmin = {
  nome: string;
  // "AAAA-MM-DDTHH:mm" no horário de Brasília, pronto para <input type="datetime-local">.
  dataLocal: string;
  local: string;
};

export type CatalogoAdmin = {
  id: string;
  nome: string;
  padrao: boolean;
  enquetes: number;
};

export type OpcaoAdmin = { id: string; texto: string; exclusiva: boolean };
export type EnqueteAdmin = {
  id: string;
  titulo: string;
  tipo: "unica" | "multipla";
  votantes: number;
  opcoes: OpcaoAdmin[];
};
export type CategoriaAdmin = { id: string; nome: string; enquetes: EnqueteAdmin[] };
export type CatalogoDetalhe = {
  id: string;
  nome: string;
  padrao: boolean;
  categorias: CategoriaAdmin[];
};

export type Votante = { id: string; nome: string; imagem: string | null };
export type VotosEnquete = {
  titulo: string;
  tipo: "unica" | "multipla";
  catalogoId: string;
  opcoes: { id: string; texto: string; votantes: Votante[] }[];
  naoVotaram: Votante[];
};

export async function getEventoAdmin(turmaId: string): Promise<EventoAdmin> {
  const { rows } = await pool.query(
    `select nome,
            coalesce(to_char(data_evento at time zone 'America/Sao_Paulo',
                             'YYYY-MM-DD"T"HH24:MI'), '') as "dataLocal",
            coalesce(local_evento, '') as local
       from turmas where id = $1`,
    [turmaId],
  );
  return rows[0];
}

export async function listarCatalogosAdmin(turmaId: string): Promise<CatalogoAdmin[]> {
  const { rows } = await pool.query(
    `select c.id, c.nome, c.turma_id is null as padrao,
            (select count(*) from enquetes e
               join categorias ca on ca.id = e.categoria_id
              where ca.catalogo_id = c.id)::int as enquetes
       from catalogos c
      where c.turma_id is null or c.turma_id = $1
      order by (c.turma_id is null) desc, c.nome`,
    [turmaId],
  );
  return rows;
}

// Catálogo padrão ou da própria turma, com quantos membros votaram em cada pergunta.
export async function getCatalogoAdmin(
  catalogoId: string,
  turmaId: string,
): Promise<CatalogoDetalhe | null> {
  const { rows: cat } = await pool.query(
    `select id, nome, turma_id is null as padrao from catalogos
      where id = $1 and (turma_id is null or turma_id = $2)`,
    [catalogoId, turmaId],
  );
  if (cat.length === 0) return null;

  const [categorias, enquetes, opcoes, votantes] = await Promise.all([
    pool.query("select id, nome from categorias where catalogo_id = $1 order by ordem", [catalogoId]),
    pool.query(
      `select e.id, e.categoria_id, e.titulo, e.tipo
         from enquetes e join categorias ca on ca.id = e.categoria_id
        where ca.catalogo_id = $1 order by e.ordem`,
      [catalogoId],
    ),
    pool.query(
      `select o.id, o.enquete_id, o.texto, o.exclusiva
         from opcoes o
         join enquetes e on e.id = o.enquete_id
         join categorias ca on ca.id = e.categoria_id
        where ca.catalogo_id = $1 order by o.ordem`,
      [catalogoId],
    ),
    pool.query(
      `select o.enquete_id, count(distinct v.usuario_id)::int as n
         from votos v
         join opcoes o on o.id = v.opcao_id
         join enquetes e on e.id = o.enquete_id
         join categorias ca on ca.id = e.categoria_id
        where ca.catalogo_id = $1 and v.turma_id = $2
        group by o.enquete_id`,
      [catalogoId, turmaId],
    ),
  ]);
  const n = new Map<string, number>(votantes.rows.map((r) => [r.enquete_id, r.n]));

  return {
    ...cat[0],
    categorias: categorias.rows.map((c) => ({
      id: c.id,
      nome: c.nome,
      enquetes: enquetes.rows
        .filter((e) => e.categoria_id === c.id)
        .map((e) => ({
          id: e.id,
          titulo: e.titulo,
          tipo: e.tipo,
          votantes: n.get(e.id) ?? 0,
          opcoes: opcoes.rows
            .filter((o) => o.enquete_id === e.id)
            .map((o) => ({ id: o.id, texto: o.texto, exclusiva: o.exclusiva })),
        })),
    })),
  };
}

// Quem votou em cada opção (só os votos da turma do admin) e quem ainda não votou.
export async function getVotosEnquete(
  enqueteId: string,
  turmaId: string,
): Promise<VotosEnquete | null> {
  const { rows: enq } = await pool.query(
    `select e.titulo, e.tipo, ca.catalogo_id as "catalogoId"
       from enquetes e
       join categorias ca on ca.id = e.categoria_id
       join catalogos c on c.id = ca.catalogo_id
      where e.id = $1 and (c.turma_id is null or c.turma_id = $2)`,
    [enqueteId, turmaId],
  );
  if (enq.length === 0) return null;

  const [linhas, ausentes] = await Promise.all([
    pool.query(
      `select o.id as opcao_id, o.texto, u.id as uid, u.name, u.image
         from opcoes o
         left join votos v on v.opcao_id = o.id and v.turma_id = $2
         left join usuarios u on u.id = v.usuario_id
        where o.enquete_id = $1
        order by o.ordem, u.name`,
      [enqueteId, turmaId],
    ),
    pool.query(
      `select u.id, u.name as nome, u.image as imagem
         from membros m
         join usuarios u on u.id = m.usuario_id
        where m.turma_id = $1
          and not exists (
            select 1 from votos v
              join opcoes o on o.id = v.opcao_id
             where o.enquete_id = $2 and v.usuario_id = m.usuario_id)
        order by u.name`,
      [turmaId, enqueteId],
    ),
  ]);

  const opcoes: VotosEnquete["opcoes"] = [];
  for (const l of linhas.rows) {
    let o = opcoes.find((x) => x.id === l.opcao_id);
    if (!o) {
      o = { id: l.opcao_id, texto: l.texto, votantes: [] };
      opcoes.push(o);
    }
    if (l.uid) o.votantes.push({ id: l.uid, nome: l.name, imagem: l.image });
  }
  return { ...enq[0], opcoes, naoVotaram: ausentes.rows };
}

export async function getResumoAdmin(turmaId: string) {
  const { rows } = await pool.query(
    `select
       (select count(*) from membros where turma_id = $1)::int as membros,
       (select count(distinct usuario_id) from votos where turma_id = $1)::int as votantes,
       (select count(*) from tarefas where turma_id = $1 and status <> 'concluida')::int as "tarefasAbertas",
       (select count(*) from duvidas where turma_id = $1 and not respondida)::int as "duvidasAbertas",
       (select count(*) from catalogos where turma_id = $1)::int as personalizados`,
    [turmaId],
  );
  return rows[0] as {
    membros: number;
    votantes: number;
    tarefasAbertas: number;
    duvidasAbertas: number;
    personalizados: number;
  };
}
