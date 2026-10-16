import "server-only";
import { pool } from "./db";
import type { EventoAdmin } from "./admin";
import type { Membro } from "./dal";

export type ItemProgramacao = {
  id: string;
  horario: Date;
  titulo: string;
  descricao: string | null;
};

export type DetalhesEvento = {
  descricao: string | null;
  endereco: string | null;
  linkMapa: string | null;
  traje: string | null;
  observacoesLocal: string | null;
  dataFim: Date | null;
};

export type Decisao = { enqueteId: string; pergunta: string; categoria: string; escolhas: string[] };

export type ResumoTurma = {
  membros: number;
  tarefasTotal: number;
  tarefasConcluidas: number;
  enquetesTotal: number;
  enquetesRespondidas: number;
  duvidasAbertas: number;
};

export type ResumoAdmin = {
  membros: number;
  votantes: number;
  tarefasAbertas: number;
  duvidasAbertas: number;
  personalizados: number;
  confirmados: number;
};

export async function listarProgramacao(
  membro: Membro,
): Promise<ItemProgramacao[]> {
  // Teto generoso: programação real tem dezenas de itens; sem limite, uma
  // turma gigante pagina MBs no dashboard mais visitado do app.
  const { rows } = await pool.query(
    `select id, horario, titulo, descricao
       from programacao
      where turma_id = $1
      order by horario
      limit 100`,
    [membro.turmaId],
  );
  return rows;
}

// Resumo do dashboard em 1 roundtrip: antes eram 2 queries (getResumoTurma +
// getResumoAdmin no admin), com `membros` e `duvidasAbertas` calculados 2x.
// Colunas de admin só entram quando o papel é admin; participante recebe
// `admin: null` e a query nem calcula aqueles agregados.
export async function getResumosDashboard(
  membro: Membro,
): Promise<{ resumo: ResumoTurma; admin: ResumoAdmin | null }> {
  const ehAdmin = membro.papel === "admin";
  const { rows } = await pool.query(
    `select
       (select count(*) from membros where turma_id = $1)::int as membros,
       (select count(*) from tarefas where turma_id = $1)::int as "tarefasTotal",
       (select count(*) from tarefas
         where turma_id = $1 and status = 'concluida')::int as "tarefasConcluidas",
       (select count(*)
          from enquetes e
          join categorias ca on ca.id = e.categoria_id
          join catalogos c on c.id = ca.catalogo_id
         where c.turma_id is null or c.turma_id = $1)::int as "enquetesTotal",
       (select count(distinct o.enquete_id)
          from votos v
          join opcoes o on o.id = v.opcao_id
          where v.usuario_id = $2 and v.turma_id = $1)::int as "enquetesRespondidas",
       (select count(*) from duvidas
         where turma_id = $1 and not respondida)::int as "duvidasAbertas"
       ${
         ehAdmin
           ? `,
       (select count(distinct usuario_id) from votos where turma_id = $1)::int as votantes,
       (select count(*) from tarefas where turma_id = $1 and status <> 'concluida')::int as "tarefasAbertas",
       (select count(*) from catalogos where turma_id = $1)::int as personalizados,
       (select count(*) from presencas p join membros m
          on m.turma_id = p.turma_id and m.usuario_id = p.usuario_id
        where p.turma_id = $1 and p.status = 'vou')::int as confirmados`
           : ""
       }`,
    [membro.turmaId, membro.usuarioId],
  );
  const r = rows[0];
  return {
    resumo: {
      membros: r.membros,
      tarefasTotal: r.tarefasTotal,
      tarefasConcluidas: r.tarefasConcluidas,
      enquetesTotal: r.enquetesTotal,
      enquetesRespondidas: r.enquetesRespondidas,
      duvidasAbertas: r.duvidasAbertas,
    },
    admin: ehAdmin
      ? {
          membros: r.membros,
          votantes: r.votantes,
          tarefasAbertas: r.tarefasAbertas,
          duvidasAbertas: r.duvidasAbertas,
          personalizados: r.personalizados,
          confirmados: r.confirmados,
        }
      : null,
  };
}

export async function getDetalhesEvento(membro: Membro): Promise<DetalhesEvento> {
  const { detalhes } = await getDadosEvento(membro);
  return detalhes;
}

// Detalhes (todos) + dados de edição (só admin) numa única leitura da linha
// da turma: antes eram 2 queries na mesma linha (getDetalhesEvento +
// getEventoAdmin). A formatação de data sai do SQL como antes.
export async function getDadosEvento(
  membro: Membro,
): Promise<{ detalhes: DetalhesEvento; evento: EventoAdmin | null }> {
  const { rows } = await pool.query(
    `select descricao, endereco, link_mapa as "linkMapa", traje,
            observacoes_local as "observacoesLocal", data_fim_evento as "dataFim",
            nome,
            coalesce(to_char(data_evento at time zone 'America/Sao_Paulo',
                             'YYYY-MM-DD"T"HH24:MI'), '') as "dataLocal",
            coalesce(to_char(data_fim_evento at time zone 'America/Sao_Paulo',
                             'YYYY-MM-DD"T"HH24:MI'), '') as "dataFimLocal",
            coalesce(local_evento, '') as "localPreenchido"
       from turmas where id = $1`,
    [membro.turmaId],
  );
  const r = rows[0];
  const detalhes: DetalhesEvento = {
    descricao: r.descricao,
    endereco: r.endereco,
    linkMapa: r.linkMapa,
    traje: r.traje,
    observacoesLocal: r.observacoesLocal,
    dataFim: r.dataFim,
  };
  return {
    detalhes,
    evento:
      membro.papel === "admin"
        ? {
            nome: r.nome,
            dataLocal: r.dataLocal,
            dataFimLocal: r.dataFimLocal,
            local: r.localPreenchido,
            descricao: r.descricao ?? "",
            endereco: r.endereco ?? "",
            linkMapa: r.linkMapa ?? "",
            traje: r.traje ?? "",
            observacoesLocal: r.observacoesLocal ?? "",
          }
        : null,
  };
}

// Decisões que a comissão fixou, na ordem das categorias e perguntas do catálogo.
export async function listarDecisoes(membro: Membro): Promise<Decisao[]> {
  const { rows } = await pool.query(
    `select e.id as "enqueteId", e.titulo as pergunta, ca.nome as categoria,
            array_agg(o.texto order by o.ordem) as escolhas
       from decisoes d
       join enquetes e on e.id = d.enquete_id
       join categorias ca on ca.id = e.categoria_id
       join opcoes o on o.id = d.opcao_id
      where d.turma_id = $1
      group by e.id, e.titulo, e.ordem, ca.nome, ca.ordem, ca.catalogo_id
      order by ca.catalogo_id, ca.ordem, e.ordem`,
    [membro.turmaId],
  );
  return rows;
}
