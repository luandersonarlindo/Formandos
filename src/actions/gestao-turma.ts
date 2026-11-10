"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";
import { registrarAuditoria } from "@/lib/auditoria";
import { COOKIE_TURMA, exigirAdmin } from "@/lib/dal";
import { transacao } from "@/lib/db";
import { apagarTurma, avisarExclusaoMarcada } from "@/lib/fim-da-turma";
import { dataExclusao, ePrazoValido, type PrazoExclusao } from "@/lib/fim-da-turma-regras";
import { dataBr, hojeBrasil } from "@/lib/situacao-regras";
import type { EstadoForm } from "./tipos";

// Ações do administrador sobre a turma inteira. Usam exigirAdmin (e não a
// versão "Editável"), porque precisam funcionar também com a turma arquivada.
// A turma vem da sessão, nunca de um campo da tela.

const esquemaPrazo = z.object({ dias: z.coerce.number().int() });

function lerPrazo(formData: FormData): PrazoExclusao | null {
  const dados = esquemaPrazo.safeParse(Object.fromEntries(formData));
  return dados.success && ePrazoValido(dados.data.dias) ? dados.data.dias : null;
}

// Arquivar exige a data de exclusão (ADR-0009): 30, 60, 90 ou 180 dias. Os
// membros recebem o aviso por email, mesmo quem desligou os emails da turma.
export async function arquivarTurma(_estado: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const admin = await exigirAdmin();
  const dias = lerPrazo(formData);
  if (!dias) return { erro: "Escolha em quantos dias a turma será excluída." };
  const excluirEm = dataExclusao(hojeBrasil(), dias);

  const quem = await transacao(async (db) => {
    const { rowCount } = await db.query(
      "update turmas set arquivada_em = now(), excluir_em = $2 where id = $1 and arquivada_em is null",
      [admin.turmaId, excluirEm],
    );
    if (rowCount === 0) return null;
    // Marcas de um aviso de 7 dias antigo não valem para a data nova.
    await db.query("delete from lembretes_enviados where tipo = 'exclusao' and turma_id = $1", [admin.turmaId]);
    await registrarAuditoria(db, {
      usuarioId: admin.usuarioId,
      turmaId: admin.turmaId,
      acao: "turma.arquivada",
      entidade: "turma",
      entidadeId: admin.turmaId,
      detalhe: { nome: admin.turmaNome, excluirEm, dias },
    });
    const { rows } = await db.query("select name from usuarios where id = $1", [admin.usuarioId]);
    return (rows[0]?.name as string | undefined) ?? "";
  });
  if (quem === null) return { erro: "A turma já está arquivada." };

  after(() =>
    avisarExclusaoMarcada({
      turmaId: admin.turmaId,
      turma: admin.turmaNome,
      excluirEm,
      quem: quem || null,
      momento: "arquivada",
      exceto: admin.usuarioId,
    }),
  );
  revalidatePath("/", "layout");
  return { ok: `Turma arquivada. Tudo será excluído em ${dataBr(excluirEm)}.` };
}

// Com a turma arquivada, a comissão muda a data (contada a partir de hoje).
export async function mudarPrazoExclusao(_estado: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const admin = await exigirAdmin();
  const dias = lerPrazo(formData);
  if (!dias) return { erro: "Escolha em quantos dias a turma será excluída." };
  const excluirEm = dataExclusao(hojeBrasil(), dias);

  const r = await transacao(async (db) => {
    const { rows } = await db.query(
      `select to_char(excluir_em, 'YYYY-MM-DD') as antes from turmas
        where id = $1 and arquivada_em is not null for update`,
      [admin.turmaId],
    );
    if (rows.length === 0) return { estado: "ativa" as const };
    const antes = rows[0].antes as string | null;
    if (antes === excluirEm) return { estado: "igual" as const };
    await db.query("update turmas set excluir_em = $2 where id = $1", [admin.turmaId, excluirEm]);
    await db.query("delete from lembretes_enviados where tipo = 'exclusao' and turma_id = $1", [admin.turmaId]);
    await registrarAuditoria(db, {
      usuarioId: admin.usuarioId,
      turmaId: admin.turmaId,
      acao: "turma.prazo_exclusao",
      entidade: "turma",
      entidadeId: admin.turmaId,
      detalhe: { nome: admin.turmaNome, antes, depois: excluirEm },
    });
    const { rows: u } = await db.query("select name from usuarios where id = $1", [admin.usuarioId]);
    return { estado: "ok" as const, quem: (u[0]?.name as string | undefined) ?? "" };
  });
  if (r.estado === "ativa") return { erro: "A turma não está arquivada." };
  if (r.estado === "igual") return { ok: `A data continua ${dataBr(excluirEm)}.` };

  after(() =>
    avisarExclusaoMarcada({
      turmaId: admin.turmaId,
      turma: admin.turmaNome,
      excluirEm,
      quem: r.quem || null,
      momento: "nova_data",
      exceto: admin.usuarioId,
    }),
  );
  revalidatePath("/", "layout");
  return { ok: `Nova data: tudo será excluído em ${dataBr(excluirEm)}.` };
}

// Desarquivar cancela a data de exclusão.
export async function desarquivarTurma(): Promise<EstadoForm> {
  const admin = await exigirAdmin();
  await transacao(async (db) => {
    await db.query("update turmas set arquivada_em = null, excluir_em = null where id = $1", [admin.turmaId]);
    await db.query("delete from lembretes_enviados where tipo = 'exclusao' and turma_id = $1", [admin.turmaId]);
    await registrarAuditoria(db, {
      usuarioId: admin.usuarioId,
      turmaId: admin.turmaId,
      acao: "turma.desarquivada",
      entidade: "turma",
      entidadeId: admin.turmaId,
      detalhe: { nome: admin.turmaNome },
    });
  });
  revalidatePath("/", "layout");
  return { ok: "Turma desarquivada. A data de exclusão foi cancelada." };
}

const esquemaExcluir = z.object({ confirmacao: z.string().trim() });

export async function excluirTurmaDoAdmin(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const admin = await exigirAdmin();
  const dados = esquemaExcluir.safeParse(Object.fromEntries(formData));
  if (!dados.success) return { erro: "Dados inválidos." };

  const resultado = await transacao(async (db) => {
    const { rows } = await db.query("select nome from turmas where id = $1 for update", [
      admin.turmaId,
    ]);
    if (rows.length === 0) return "inexistente" as const;
    if (dados.data.confirmacao !== rows[0].nome) return "confirmacao" as const;
    await apagarTurma(db, { turmaId: admin.turmaId, nome: rows[0].nome, usuarioId: admin.usuarioId, por: "admin" });
    return "ok" as const;
  });

  if (resultado === "confirmacao") {
    return { erro: "O nome digitado não confere com o da turma." };
  }
  // Com outra turma, o /dashboard segue para ela; sem nenhuma, leva ao /convite.
  (await cookies()).delete(COOKIE_TURMA);
  revalidatePath("/", "layout");
  redirect("/dashboard");
}
