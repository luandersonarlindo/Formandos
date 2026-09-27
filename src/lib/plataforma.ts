import "server-only";
import { pool } from "./db";
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

export const POR_PAGINA_MASTER = 20;

export type PaginaLista<T> = {
  itens: T[];
  total: number;
  pagina: number;
  totalPaginas: number;
};

export async function listarTurmas(pagina = 1): Promise<PaginaLista<TurmaResumo>> {
  const {
    rows: [{ total }],
  } = await pool.query("select count(*)::int as total from turmas");
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
      group by t.id, u.name
      order by t.created_at desc, t.id
      limit ${POR_PAGINA_MASTER} offset $1`,
    [deslocamento(paginaAtual, POR_PAGINA_MASTER)],
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
};

export async function getTurma(turmaId: string): Promise<TurmaDetalhe | null> {
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
  const { rows: membros } = await pool.query<MembroTurma>(
    `select u.id, u.name, u.email, u.image, m.papel
       from membros m
       join usuarios u on u.id = m.usuario_id
      where m.turma_id = $1
      order by (m.papel = 'admin') desc, u.name`,
    [turmaId],
  );
  return { ...rows[0], membros };
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

export async function listarUsuarios(pagina = 1): Promise<PaginaLista<UsuarioPlataforma>> {
  const {
    rows: [{ total }],
  } = await pool.query("select count(*)::int as total from usuarios");
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
      group by u.id
      order by u.name, u.id
      limit ${POR_PAGINA_MASTER} offset $1`,
    [deslocamento(paginaAtual, POR_PAGINA_MASTER)],
  );
  return { itens: rows, total, pagina: paginaAtual, totalPaginas };
}
