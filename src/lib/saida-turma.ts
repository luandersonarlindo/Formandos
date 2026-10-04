import "server-only";
import type { PoolClient } from "pg";

// Sai da turma (ou é expulso dela) não pode deixar rastro: nem voto, nem
// dúvida, nem confirmação de presença, nem voto de reação. As duas únicas
// coisas que ficam são as decisões e os avisos da comissão, que são registro da
// turma, não da pessoa: só o "quem fez" é esvaziado.
//
// Sempre dentro de uma transação de quem chama (src/lib/db.ts).

export async function apagarDadosDoMembro(db: PoolClient, turmaId: string, usuarioId: string) {
  // Votos e presença só existem enquanto a pessoa é membro da turma.
  await db.query("delete from votos where turma_id = $1 and usuario_id = $2", [turmaId, usuarioId]);
  await db.query("delete from presencas where turma_id = $1 and usuario_id = $2", [
    turmaId,
    usuarioId,
  ]);
  // As dúvidas escritas por ele somem com os upvotes que receberam (cascata).
  await db.query("delete from duvidas where turma_id = $1 and autor_id = $2", [turmaId, usuarioId]);
  // E os upvotes que ele deixou nas dúvidas dos outros.
  await db.query(
    `delete from duvida_upvotes x
       using duvidas d
      where x.duvida_id = d.id and d.turma_id = $1 and x.usuario_id = $2`,
    [turmaId, usuarioId],
  );
  // Registro da turma que só guardava o nome de quem fez.
  await db.query("update decisoes set decidido_por = null where turma_id = $1 and decidido_por = $2", [
    turmaId,
    usuarioId,
  ]);
  await db.query("update avisos set autor_id = null where turma_id = $1 and autor_id = $2", [
    turmaId,
    usuarioId,
  ]);
  // Tarefa sem responsável continua na turma, mas ninguém "responde" por ela.
  await db.query(
    "update tarefas set responsavel_id = null where turma_id = $1 and responsavel_id = $2",
    [turmaId, usuarioId],
  );
}

// Apaga o rastro e tira a pessoa da turma. Chame depois de conferir que ela
// pode sair (último administrador da turma, por exemplo).
export async function removerMembroDaTurma(db: PoolClient, turmaId: string, usuarioId: string) {
  await apagarDadosDoMembro(db, turmaId, usuarioId);
  await db.query("delete from membros where turma_id = $1 and usuario_id = $2", [turmaId, usuarioId]);
}