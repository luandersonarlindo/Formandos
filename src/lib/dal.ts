import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "./auth";
import { pool } from "./db";
import { ehMaster } from "./master";
import type { Papel } from "./papeis";
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
  papel: Papel;
  // Admin marcado como tesouraria (ADR-0005): vê e lança o dinheiro de cada um.
  tesouraria: boolean;
  dataEvento: Date | null;
  localEvento: string | null;
  // Quantos acompanhantes cada membro pode levar (escolha do admin da turma).
  maxAcompanhantes: number;
  // Prazo para confirmar presença (ADR-0013); depois dele a resposta trava.
  presencaAte: Date | null;
  // Se a turma usa o catálogo padrão global nas votações.
  usarCatalogoPadrao: boolean;
  // Turma arquivada é só leitura: veja exigirMembroEditavel.
  arquivadaEm: Date | null;
  // Data de exclusão da turma arquivada (AAAA-MM-DD, ADR-0009), ou null.
  excluirEm: string | null;
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
    `select m.turma_id, m.papel, m.tesouraria, t.nome, t.data_evento, t.local_evento,
            t.max_acompanhantes, t.presenca_ate, t.usar_catalogo_padrao, t.arquivada_em,
            to_char(t.excluir_em, 'YYYY-MM-DD') as excluir_em
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
    tesouraria: r.papel === "admin" && r.tesouraria,
    dataEvento: r.data_evento,
    localEvento: r.local_evento,
    maxAcompanhantes: r.max_acompanhantes,
    presencaAte: r.presenca_ate,
    usarCatalogoPadrao: r.usar_catalogo_padrao,
    arquivadaEm: r.arquivada_em,
    excluirEm: r.excluir_em,
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

// Para o que só formando e comissão fazem (ADR-0012): votar, dúvidas, assumir
// tarefa, "Já paguei". O observador só lê, então volta ao dashboard. A presença
// fica de fora: o observador confirma a própria.
export async function exigirFormandoEditavel() {
  const membro = await exigirMembroEditavel();
  if (membro.papel === "observador") redirect("/dashboard");
  return membro;
}

export async function exigirAdminEditavel() {
  const admin = await exigirAdmin();
  if (admin.arquivadaEm) redirect("/dashboard");
  return admin;
}

// Exige login e ser administrador master (gestor de toda a plataforma).
// Para quem não é master a página "não existe": não revela que há uma área master.
// Exige ser a tesouraria da turma (ADR-0005). Os outros admins não veem quanto
// cada pessoa pagou.
export async function exigirTesouraria() {
  const membro = await exigirAdmin();
  if (!membro.tesouraria) redirect("/admin");
  return membro;
}

export async function exigirTesourariaEditavel() {
  const membro = await exigirTesouraria();
  if (membro.arquivadaEm) redirect("/admin/tesouraria");
  return membro;
}

export async function exigirMaster() {
  const { user } = await exigirSessao();
  if (!ehMaster(user)) notFound();
  return user;
}
