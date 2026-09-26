import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { pool } from "./db";

// Data Access Layer: ponto único de checagem de sessão.
// Chame `exigirSessao()` em toda página, layout protegido e Server Action.
// O proxy.ts só confere se o cookie existe; aqui a sessão é validada no banco.

export const getSessao = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

export async function exigirSessao() {
  const sessao = await getSessao();
  if (!sessao) redirect("/entrar");
  return sessao;
}

export async function getUsuarioAtual() {
  const sessao = await exigirSessao();
  return sessao.user;
}

export type Membro = {
  usuarioId: string;
  turmaId: string;
  turmaNome: string;
  papel: "admin" | "participante";
  dataEvento: Date | null;
  localEvento: string | null;
};

// Turma e papel do usuário logado (ou null se ainda não entrou em uma turma).
// A turma vem sempre da sessão, nunca de um campo enviado pela tela.
export const getMembro = cache(async (): Promise<Membro | null> => {
  const sessao = await exigirSessao();
  const { rows } = await pool.query(
    `select m.turma_id, m.papel, t.nome, t.data_evento, t.local_evento
       from membros m
       join turmas t on t.id = m.turma_id
      where m.usuario_id = $1`,
    [sessao.user.id],
  );
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    usuarioId: sessao.user.id,
    turmaId: r.turma_id,
    turmaNome: r.nome,
    papel: r.papel,
    dataEvento: r.data_evento,
    localEvento: r.local_evento,
  };
});

// Exige login e turma. Sem turma, vai para /convite.
export async function exigirMembro() {
  const membro = await getMembro();
  if (!membro) redirect("/convite");
  return membro;
}

// Exige login, turma e papel de administrador.
export async function exigirAdmin() {
  const membro = await exigirMembro();
  if (membro.papel !== "admin") redirect("/dashboard");
  return membro;
}
