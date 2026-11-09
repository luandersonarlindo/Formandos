import "server-only";
import { pool } from "./db";

// Página pública do evento (ADR-0008): só leitura, sem login. Só sai daqui o
// que já iria num convite impresso: nada de membros, comissão, presença,
// votos ou dinheiro.

export const DIAS_DESTAQUE_MUDANCA = 14;

export type MudancaRecente = {
  quando: Date;
  mudancas: { rotulo: string; antes: string; depois: string }[];
};

// Última mudança de data, horário, local ou endereço dos últimos 14 dias.
export async function getUltimaMudancaEvento(turmaId: string): Promise<MudancaRecente | null> {
  const { rows } = await pool.query(
    `select created_at as quando, detalhe->'mudancas' as mudancas
       from auditoria
      where turma_id = $1 and acao = 'evento.alterado'
        and created_at > now() - make_interval(days => $2)
      order by created_at desc, id desc limit 1`,
    [turmaId, DIAS_DESTAQUE_MUDANCA],
  );
  return rows[0] ?? null;
}

export type EventoPublico = {
  turma: string;
  inicio: Date | null;
  fim: Date | null;
  local: string | null;
  endereco: string | null;
  linkMapa: string | null;
  traje: string | null;
  observacoesLocal: string | null;
  descricao: string | null;
  atualizadoEm: Date | null;
  encerrado: boolean;
  programacao: { id: string; horario: Date; titulo: string; descricao: string | null }[];
  ultimaMudanca: MudancaRecente | null;
};

const TOKEN = /^[A-Za-z0-9_-]{22}$/;

export async function getEventoPublico(token: string): Promise<EventoPublico | null> {
  if (!TOKEN.test(token)) return null;
  const { rows } = await pool.query(
    `select id, nome, data_evento, data_fim_evento, local_evento, endereco, link_mapa,
            traje, observacoes_local, descricao, evento_atualizado_em, arquivada_em
       from turmas where token_publico = $1`,
    [token],
  );
  if (rows.length === 0) return null;
  const t = rows[0];
  const [programacao, ultimaMudanca] = await Promise.all([
    pool.query(
      "select id, horario, titulo, descricao from programacao where turma_id = $1 order by horario limit 100",
      [t.id],
    ),
    getUltimaMudancaEvento(t.id),
  ]);
  return {
    turma: t.nome,
    inicio: t.data_evento,
    fim: t.data_fim_evento,
    local: t.local_evento,
    endereco: t.endereco,
    linkMapa: t.link_mapa,
    traje: t.traje,
    observacoesLocal: t.observacoes_local,
    descricao: t.descricao,
    atualizadoEm: t.evento_atualizado_em,
    encerrado: t.arquivada_em !== null,
    programacao: programacao.rows,
    ultimaMudanca,
  };
}
