import "server-only";
import type { PoolClient } from "pg";
import { pool } from "./db";

// Regras para apagar uma conta, usadas pelo master (excluirUsuario) e por quem
// exclui a própria conta (excluirMinhaConta).

// Dentro de uma transação: confere as turmas dele e apaga a conta. Devolve o
// erro, ou as turmas em que ele estava se apagou. Não confere quem pode pedir a
// exclusão nem o email de confirmação: isso é de quem chama.
//
// `ok` existe para o TypeScript separar os dois retornos: com `erro: string`
// sozinho o `if (resultado.erro)` não afunila, porque string vazia é falsy.
export async function apagarUsuario(
  db: PoolClient,
  usuarioId: string,
): Promise<{ ok: false; erro: string } | { ok: true; turmas: string[] }> {
  // Trava os membros das turmas dele para conferir os administradores.
  const { rows: membros } = await db.query(
    `select m.turma_id, m.usuario_id, m.papel, t.nome
       from membros m
       join turmas t on t.id = m.turma_id
      where m.turma_id in (select turma_id from membros where usuario_id = $1)
      for update of m`,
    [usuarioId],
  );
  const porTurma = new Map<string, typeof membros>();
  for (const m of membros) {
    porTurma.set(m.turma_id, [...(porTurma.get(m.turma_id) ?? []), m]);
  }
  const vazias: string[] = [];
  for (const [turmaId, lista] of porTurma) {
    const ele = lista.find((m) => m.usuario_id === usuarioId);
    const admins = lista.filter((m) => m.papel === "admin").length;
    if (lista.length === 1) vazias.push(turmaId);
    else if (ele?.papel === "admin" && admins === 1) {
      return { ok: false as const, erro: `É o único administrador de "${lista[0].nome}". Promova outro membro antes.` };
    }
  }
  // Os nomes das turmas dele saem aqui, antes do delete: depois que a conta
  // cai, os vínculos vão por cascata e o email de exclusão ainda precisa
  // citar as turmas em que ele estava.
  const turmas = [
    ...new Set(membros.filter((m) => m.usuario_id === usuarioId).map((m) => m.nome)),
  ];
  // Turma que ficaria sem ninguém é removida junto.
  for (const turmaId of vazias) {
    await db.query("delete from turmas where id = $1", [turmaId]);
  }
  // Apaga em cascata sessões, contas, participação, votos e dúvidas dele.
  await db.query("delete from usuarios where id = $1", [usuarioId]);
  return { ok: true as const, turmas };
}

// Nome e email de quem vai receber um aviso. Sempre chamado ANTES de apagar o
// rastro da pessoa na turma: depois, a consulta volta vazia.
export async function dadosParaEmail(
  usuarioId: string,
): Promise<{ name: string; email: string } | undefined> {
  const { rows } = await pool.query("select name, email from usuarios where id = $1", [
    usuarioId,
  ]);
  return rows[0];
}

export type ImpactoExclusaoConta = {
  // Turmas em que ele é o único administrador e há outros membros: impedem a exclusão.
  bloqueiam: string[];
  // Turmas em que ele é o único membro: seriam apagadas junto.
  seriamApagadas: string[];
  votos: number;
  duvidas: number;
};

// O que acontece se a conta for excluída, para mostrar antes de confirmar.
export async function getImpactoExclusaoConta(usuarioId: string): Promise<ImpactoExclusaoConta> {
  const { rows: turmas } = await pool.query(
    `select t.nome, m.papel,
            (select count(*) from membros x where x.turma_id = t.id)::int as membros,
            (select count(*) from membros x where x.turma_id = t.id and x.papel = 'admin')::int as admins
       from membros m join turmas t on t.id = m.turma_id
      where m.usuario_id = $1
      order by t.nome`,
    [usuarioId],
  );
  const { rows } = await pool.query(
    `select (select count(*) from votos where usuario_id = $1)::int as votos,
            (select count(*) from duvidas where autor_id = $1)::int as duvidas`,
    [usuarioId],
  );
  return {
    bloqueiam: turmas
      .filter((t) => t.papel === "admin" && t.admins === 1 && t.membros > 1)
      .map((t) => t.nome),
    seriamApagadas: turmas.filter((t) => t.membros === 1).map((t) => t.nome),
    votos: rows[0].votos,
    duvidas: rows[0].duvidas,
  };
}
