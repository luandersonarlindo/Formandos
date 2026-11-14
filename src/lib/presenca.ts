import "server-only";
import { pool } from "./db";
import type { Membro } from "./dal";
import { calcularPaginas, deslocamento, limitarPagina } from "./paginacao";
import { ROTULO_ACOMPANHANTE, totaisPorTipo, type Acompanhante, type StatusPresenca } from "./presenca-regras";

export type MinhaPresenca = {
  status: StatusPresenca | null;
  acompanhantes: number;
  observacao: string;
  // Nomes informados (ADR-0013). Resposta antiga tem quantidade e lista vazia.
  lista: Acompanhante[];
};

const LISTA_SQL = `coalesce((select json_agg(json_build_object('nome', a.nome, 'tipo', a.tipo) order by a.ordem, a.nome)
                              from acompanhantes a
                             where a.turma_id = p.turma_id and a.usuario_id = p.usuario_id), '[]'::json)`;

export async function getMinhaPresenca(membro: Membro): Promise<MinhaPresenca> {
  const { rows } = await pool.query(
    `select p.status, p.acompanhantes, coalesce(p.observacao, '') as observacao, ${LISTA_SQL} as lista
       from presencas p where p.turma_id = $1 and p.usuario_id = $2`,
    [membro.turmaId, membro.usuarioId],
  );
  return rows[0] ?? { status: null, acompanhantes: 0, observacao: "", lista: [] };
}

export type FiltroPresenca = "todos" | StatusPresenca | "pendente";

export type ResumoPresenca = {
  membros: number;
  vou: number;
  talvez: number;
  nao: number;
  pendente: number;
  acompanhantes: number;
  // Quem vai + acompanhantes.
  pessoas: number;
  // Para o buffet (ADR-0013). Acompanhante sem nome conta como adulto.
  adultos: number;
  criancas: number;
  semNome: number;
  // Respostas com mais acompanhantes que o limite atual da turma.
  acimaDoLimite: number;
};

export type LinhaPresenca = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  status: StatusPresenca | null;
  acompanhantes: number;
  observacao: string | null;
  lista: Acompanhante[];
};

// Só conta quem ainda é membro da turma (a resposta de quem saiu é ignorada).
export async function getResumoPresenca(turmaId: string): Promise<ResumoPresenca> {
  const { rows } = await pool.query(
    `select count(*)::int as membros,
            (count(*) filter (where p.status = 'vou'))::int as vou,
            (count(*) filter (where p.status = 'talvez'))::int as talvez,
            (count(*) filter (where p.status = 'nao'))::int as nao,
            (count(*) filter (where p.status is null))::int as pendente,
            coalesce(sum(p.acompanhantes) filter (where p.status = 'vou'), 0)::int as acompanhantes,
            coalesce(sum(n.nomes) filter (where p.status = 'vou'), 0)::int as "comNome",
            coalesce(sum(n.criancas) filter (where p.status = 'vou'), 0)::int as criancas,
            (count(*) filter (where p.status = 'vou' and p.acompanhantes > t.max_acompanhantes))::int as "acimaDoLimite"
       from membros m
       join turmas t on t.id = m.turma_id
       left join presencas p on p.turma_id = m.turma_id and p.usuario_id = m.usuario_id
       left join lateral (
         select count(*)::int as nomes, (count(*) filter (where a.tipo = 'crianca'))::int as criancas
           from acompanhantes a where a.turma_id = m.turma_id and a.usuario_id = m.usuario_id) n on true
      where m.turma_id = $1`,
    [turmaId],
  );
  const { comNome, ...r } = rows[0];
  return {
    ...r,
    ...totaisPorTipo(r.vou, r.acompanhantes, r.criancas),
    semNome: Math.max(0, r.acompanhantes - comNome),
  };
}

// Trechos fixos (nunca vêm da URL): o filtro é escolhido em uma lista fechada.
const CONDICAO: Record<FiltroPresenca, string> = {
  todos: "",
  vou: "and p.status = 'vou'",
  talvez: "and p.status = 'talvez'",
  nao: "and p.status = 'nao'",
  pendente: "and p.status is null",
};

export const POR_PAGINA_PRESENCA = 10;

export async function listarPresencas(
  turmaId: string,
  { filtro = "todos", pagina = 1, total }: { filtro?: FiltroPresenca; pagina?: number; total: number },
): Promise<{ itens: LinhaPresenca[]; pagina: number; totalPaginas: number }> {
  const totalPaginas = calcularPaginas(total, POR_PAGINA_PRESENCA);
  const paginaAtual = limitarPagina(pagina, totalPaginas);
  const { rows } = await pool.query<LinhaPresenca>(
    `select u.id, u.name, u.email, u.image, p.status,
            coalesce(p.acompanhantes, 0)::int as acompanhantes, p.observacao, ${LISTA_SQL} as lista
       from membros m
       join usuarios u on u.id = m.usuario_id
       left join presencas p on p.turma_id = m.turma_id and p.usuario_id = m.usuario_id
      where m.turma_id = $1 ${CONDICAO[filtro]}
      order by u.name, u.id
      limit ${POR_PAGINA_PRESENCA} offset $2`,
    [turmaId, deslocamento(paginaAtual, POR_PAGINA_PRESENCA)],
  );
  return { itens: rows, pagina: paginaAtual, totalPaginas };
}

// ---- Lista da portaria (ADR-0013) ------------------------------------------

export type LinhaPortaria = { nome: string; tipo: string; convidadoDe: string };

// Uma linha por pessoa que vai: quem tem conta e cada acompanhante, em ordem
// alfabética. Acompanhante de resposta antiga, sem nome, entra como
// "Acompanhante de Fulano (sem nome)" para o total da lista bater com o painel.
export async function listarPortaria(turmaId: string): Promise<LinhaPortaria[]> {
  const { rows } = await pool.query<{
    nome: string;
    papel: string;
    acompanhantes: number;
    lista: Acompanhante[];
  }>(
    `select u.name as nome, m.papel, p.acompanhantes, ${LISTA_SQL} as lista
       from membros m
       join usuarios u on u.id = m.usuario_id
       join presencas p on p.turma_id = m.turma_id and p.usuario_id = m.usuario_id
      where m.turma_id = $1 and p.status = 'vou'`,
    [turmaId],
  );
  const linhas: LinhaPortaria[] = [];
  for (const r of rows) {
    linhas.push({ nome: r.nome, tipo: r.papel === "observador" ? "Observador" : "Formando", convidadoDe: "" });
    for (const a of r.lista) {
      linhas.push({ nome: a.nome, tipo: `Acompanhante (${ROTULO_ACOMPANHANTE[a.tipo].toLowerCase()})`, convidadoDe: r.nome });
    }
    for (let i = r.lista.length; i < r.acompanhantes; i++) {
      linhas.push({ nome: `Acompanhante de ${r.nome} (sem nome)`, tipo: "Acompanhante (adulto)", convidadoDe: r.nome });
    }
  }
  return linhas.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" }));
}
