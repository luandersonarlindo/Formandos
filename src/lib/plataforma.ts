import "server-only";
import { pool } from "./db";
import { padraoBusca, sqlNormalizado } from "./busca";
import { calcularPaginas, deslocamento, limitarPagina } from "./paginacao";

// Consultas da área master: enxergam TODAS as turmas (sem filtro de turma).
// Só chame depois de exigirMaster().

export type ResumoPlataforma = {
  turmas: number;
  usuarios: number;
  semTurma: number;
  duvidasAbertas: number;
};

export async function getResumoPlataforma(): Promise<ResumoPlataforma> {
  const { rows } = await pool.query(
    `select (select count(*) from turmas)::int as turmas,
            (select count(*) from usuarios)::int as usuarios,
            (select count(*) from usuarios u
              where not exists (select 1 from membros m where m.usuario_id = u.id))::int as "semTurma",
            (select count(*) from duvidas where not respondida)::int as "duvidasAbertas"`,
  );
  return rows[0];
}

export type TurmaResumo = {
  id: string;
  nome: string;
  codigo: string;
  criadaEm: Date;
  criador: string | null;
  membros: number;
  admins: number;
};

export const POR_PAGINA_MASTER = 10;

export type PaginaLista<T> = {
  itens: T[];
  total: number;
  pagina: number;
  totalPaginas: number;
};

export async function listarTurmas(
  pagina = 1,
  { busca = "" }: { busca?: string } = {},
): Promise<PaginaLista<TurmaResumo>> {
  const filtro = busca ? `where ${sqlNormalizado("t.nome")} like $1 escape '\\'` : "";
  const parametros: unknown[] = busca ? [padraoBusca(busca)] : [];
  const {
    rows: [{ total }],
  } = await pool.query(
    `select count(*)::int as total from turmas t ${filtro}`,
    parametros,
  );
  const totalPaginas = calcularPaginas(total, POR_PAGINA_MASTER);
  const paginaAtual = limitarPagina(pagina, totalPaginas);
  const { rows } = await pool.query(
    `select t.id, t.nome, t.codigo_convite as codigo, t.created_at as "criadaEm",
            u.name as criador,
            count(m.usuario_id)::int as membros,
            (count(*) filter (where m.papel = 'admin'))::int as admins
       from turmas t
       left join usuarios u on u.id = t.criado_por
       left join membros m on m.turma_id = t.id
      ${filtro}
      group by t.id, u.name
      order by t.created_at desc, t.id
      limit ${POR_PAGINA_MASTER} offset $${parametros.length + 1}`,
    [...parametros, deslocamento(paginaAtual, POR_PAGINA_MASTER)],
  );
  return { itens: rows, total, pagina: paginaAtual, totalPaginas };
}

export type MembroTurma = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  papel: "admin" | "participante";
};

export type TurmaDetalhe = {
  id: string;
  nome: string;
  codigo: string;
  criadaEm: Date;
  dataEvento: Date | null;
  localEvento: string | null;
  criador: string | null;
  membros: MembroTurma[];
  // Turma inteira, sem a busca: o cabeçalho mostra o total real.
  totalMembros: number;
  // Administradores na turma inteira: "último admin" não depende da busca.
  totalAdmins: number;
};

export async function getTurma(
  turmaId: string,
  { busca = "" }: { busca?: string } = {},
): Promise<TurmaDetalhe | null> {
  const { rows } = await pool.query(
    `select t.id, t.nome, t.codigo_convite as codigo, t.created_at as "criadaEm",
            t.data_evento as "dataEvento", t.local_evento as "localEvento",
            u.name as criador
       from turmas t
       left join usuarios u on u.id = t.criado_por
      where t.id = $1`,
    [turmaId],
  );
  if (rows.length === 0) return null;
  const filtro = busca
    ? `and (${sqlNormalizado("u.name")} like $2 escape '\\'
        or ${sqlNormalizado("u.email")} like $2 escape '\\')`
    : "";
  const parametros: unknown[] = busca ? [turmaId, padraoBusca(busca)] : [turmaId];
  const { rows: membros } = await pool.query<MembroTurma>(
    `select u.id, u.name, u.email, u.image, m.papel
       from membros m
       join usuarios u on u.id = m.usuario_id
      where m.turma_id = $1 ${filtro}
      order by (m.papel = 'admin') desc, u.name`,
    parametros,
  );
  // Sem busca a lista já é a turma inteira; com busca, conta à parte.
  const totalMembros = busca
    ? (
        await pool.query(
          `select count(*)::int as n,
                  (count(*) filter (where papel = 'admin'))::int as admins
             from membros where turma_id = $1`,
          [turmaId],
        )
      ).rows[0]
    : {
        n: membros.length,
        admins: membros.filter((m) => m.papel === "admin").length,
      };
  return {
    ...rows[0],
    membros,
    totalMembros: totalMembros.n,
    totalAdmins: totalMembros.admins,
  };
}

export type UsuarioPlataforma = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  emailVerificado: boolean;
  criadoEm: Date;
  turmas: { id: string; nome: string; papel: "admin" | "participante" }[];
};

export async function listarUsuarios(
  pagina = 1,
  { busca = "" }: { busca?: string } = {},
): Promise<PaginaLista<UsuarioPlataforma>> {
  const filtro = busca
    ? `where (${sqlNormalizado("u.name")} like $1 escape '\\'
         or ${sqlNormalizado("u.email")} like $1 escape '\\')`
    : "";
  const parametros: unknown[] = busca ? [padraoBusca(busca)] : [];
  const {
    rows: [{ total }],
  } = await pool.query(
    `select count(*)::int as total from usuarios u ${filtro}`,
    parametros,
  );
  const totalPaginas = calcularPaginas(total, POR_PAGINA_MASTER);
  const paginaAtual = limitarPagina(pagina, totalPaginas);
  const { rows } = await pool.query(
    `select u.id, u.name, u.email, u.image, u."emailVerified" as "emailVerificado",
            u."createdAt" as "criadoEm",
            coalesce(
              json_agg(json_build_object('id', t.id, 'nome', t.nome, 'papel', m.papel)
                       order by t.nome) filter (where t.id is not null),
              '[]'::json) as turmas
       from usuarios u
       left join membros m on m.usuario_id = u.id
       left join turmas t on t.id = m.turma_id
      ${filtro}
      group by u.id
      order by u.name, u.id
      limit ${POR_PAGINA_MASTER} offset $${parametros.length + 1}`,
    [...parametros, deslocamento(paginaAtual, POR_PAGINA_MASTER)],
  );
  return { itens: rows, total, pagina: paginaAtual, totalPaginas };
}
