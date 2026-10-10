"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { registrarAuditoria } from "@/lib/auditoria";
import { COOKIE_TURMA, exigirAdmin } from "@/lib/dal";
import { pool, transacao } from "@/lib/db";
import type { EstadoForm } from "./tipos";

// Ações do administrador sobre a turma inteira. Usam exigirAdmin (e não a
// versão "Editável"), porque precisam funcionar também com a turma arquivada.
// A turma vem da sessão, nunca de um campo da tela.

export async function arquivarTurma(): Promise<EstadoForm> {
  const admin = await exigirAdmin();
  await pool.query(
    "update turmas set arquivada_em = now() where id = $1 and arquivada_em is null",
    [admin.turmaId],
  );
  await registrarAuditoria(pool, {
    usuarioId: admin.usuarioId,
    turmaId: admin.turmaId,
    acao: "turma.arquivada",
    entidade: "turma",
    entidadeId: admin.turmaId,
    detalhe: { nome: admin.turmaNome },
  });
  revalidatePath("/", "layout");
  return { ok: "Turma arquivada." };
}

export async function desarquivarTurma(): Promise<EstadoForm> {
  const admin = await exigirAdmin();
  await pool.query("update turmas set arquivada_em = null where id = $1", [admin.turmaId]);
  await registrarAuditoria(pool, {
    usuarioId: admin.usuarioId,
    turmaId: admin.turmaId,
    acao: "turma.desarquivada",
    entidade: "turma",
    entidadeId: admin.turmaId,
    detalhe: { nome: admin.turmaNome },
  });
  revalidatePath("/", "layout");
  return { ok: "Turma desarquivada." };
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
    await registrarAuditoria(db, {
      usuarioId: admin.usuarioId,
      turmaId: admin.turmaId,
      acao: "turma.excluida",
      entidade: "turma",
      entidadeId: admin.turmaId,
      detalhe: { nome: rows[0].nome, por: "admin" },
    });
    // Apaga em cascata membros, catálogos, votos, dúvidas, tarefas e terceiros.
    await db.query("delete from turmas where id = $1", [admin.turmaId]);
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
