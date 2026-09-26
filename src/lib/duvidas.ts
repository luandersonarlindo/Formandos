import "server-only";
import { pool } from "./db";
import type { Membro } from "./dal";

export type Duvida = {
  id: string;
  conteudo: string;
  resposta: string | null;
  respondida: boolean;
  destaque: boolean;
  criadaEm: Date;
  autor: string;
  votos: number;
  votei: boolean;
};

// Dúvidas da turma. Ordem padrão: em destaque primeiro, depois as mais votadas,
// depois as mais recentes. Na moderação, as ainda não respondidas vêm antes.
export async function listarDuvidas(
  membro: Membro,
  { moderacao = false }: { moderacao?: boolean } = {},
): Promise<Duvida[]> {
  const { rows } = await pool.query(
    `select d.id, d.conteudo, d.resposta, d.respondida, d.destaque,
            d.created_at as "criadaEm", u.name as autor,
            (select count(*) from duvida_upvotes x
              where x.duvida_id = d.id)::int as votos,
            exists (select 1 from duvida_upvotes x
                     where x.duvida_id = d.id and x.usuario_id = $2) as votei
       from duvidas d
       join usuarios u on u.id = d.autor_id
      where d.turma_id = $1
      order by ${moderacao ? "d.respondida asc," : ""}
               d.destaque desc, votos desc, d.created_at desc`,
    [membro.turmaId, membro.usuarioId],
  );
  return rows;
}
