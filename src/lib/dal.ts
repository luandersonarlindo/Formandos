import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "./auth";
import { pool } from "./db";
import { ehMaster } from "./master";
import { escolherTurmaAtiva, podeEntrarEmOutraTurma } from "./vinculos";

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
  // Turma arquivada é só leitura: veja exigirMembroEditavel.
  arquivadaEm: Date | null;
};

// Cookie que lembra qual turma o usuário está usando. É só uma preferência:
// o servidor sempre confere no banco que a pessoa é membro daquela turma.
export const COOKIE_TURMA = "turma_ativa";

export async function definirTurmaAtiva(turmaId: string) {
  (await cookies()).set(COOKIE_TURMA, turmaId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

// Todas as turmas do usuário logado, da mais antiga para a mais nova.
export const getVinculos = cache(async (): Promise<Membro[]> => {
  const sessao = await exigirSessao();
  const { rows } = await pool.query(
    `select m.turma_id, m.papel, t.nome, t.data_evento, t.local_evento, t.arquivada_em
       from membros m
       join turmas t on t.id = m.turma_id
      where m.usuario_id = $1
      order by m.created_at, t.nome`,
    [sessao.user.id],
  );
  return rows.map((r) => ({
    usuarioId: sessao.user.id,
    turmaId: r.turma_id,
    turmaNome: r.nome,
    papel: r.papel,
    dataEvento: r.data_evento,
    localEvento: r.local_evento,
    arquivadaEm: r.arquivada_em,
  }));
});

// Turma ativa e papel do usuário logado (ou null se ainda não entrou em uma
// turma). A turma vem da sessão e do banco, nunca de um campo da tela: o
// cookie só escolhe entre as turmas das quais a pessoa já é membro.
export const getMembro = cache(async (): Promise<Membro | null> => {
  const vinculos = await getVinculos();
  const preferida = (await cookies()).get(COOKIE_TURMA)?.value;
  return escolherTurmaAtiva(vinculos, preferida);
});

// Exige login e turma. Sem turma, vai para /convite.
export async function exigirMembro() {
  const membro = await getMembro();
  if (!membro) redirect("/convite");
  return membro;
}

// Dados do seletor de turmas da barra lateral.
export async function getSeletorTurmas(ativaId: string) {
  const vinculos = await getVinculos();
  return {
    ativaId,
    lista: vinculos.map((v) => ({
      id: v.turmaId,
      nome: v.turmaNome,
      papel: v.papel,
      arquivada: v.arquivadaEm !== null,
    })),
    podeAdicionar: podeEntrarEmOutraTurma(vinculos.map((v) => v.papel)),
  };
}

// Exige login, turma e papel de administrador.
export async function exigirAdmin() {
  const membro = await exigirMembro();
  if (membro.papel !== "admin") redirect("/dashboard");
  return membro;
}

// Versões para Server Actions que ALTERAM dados da turma. Turma arquivada é só
// leitura, então quem tenta alterar volta ao dashboard, onde a faixa explica.
// Ficam de fora (e usam exigirMembro/exigirAdmin): desarquivar, excluir a turma
// e sair dela.
export async function exigirMembroEditavel() {
  const membro = await exigirMembro();
  if (membro.arquivadaEm) redirect("/dashboard");
  return membro;
}

export async function exigirAdminEditavel() {
  const admin = await exigirAdmin();
  if (admin.arquivadaEm) redirect("/dashboard");
  return admin;
}

// Exige login e ser administrador master (gestor de toda a plataforma).
// Para quem não é master a página "não existe": não revela que há uma área master.
export async function exigirMaster() {
  const { user } = await exigirSessao();
  if (!ehMaster(user)) notFound();
  return user;
}
