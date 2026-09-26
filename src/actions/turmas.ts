"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { exigirMembro, getMembro, getUsuarioAtual } from "@/lib/dal";
import { transacao } from "@/lib/db";
import { gerarCodigoConvite, normalizarCodigo } from "@/lib/convite";
import type { EstadoForm } from "./tipos";

const esquemaNome = z.object({
  nome: z
    .string()
    .trim()
    .min(3, "O nome da turma precisa ter pelo menos 3 caracteres.")
    .max(100, "O nome da turma pode ter no máximo 100 caracteres."),
});

const esquemaCodigo = z.object({
  codigo: z
    .string()
    .transform(normalizarCodigo)
    .pipe(z.string().min(6, "Informe o código de convite.").max(20)),
});

type ErroPg = { code?: string; constraint?: string };

export async function criarTurma(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const usuario = await getUsuarioAtual();
  if (await getMembro()) redirect("/dashboard");

  const dados = esquemaNome.safeParse({ nome: formData.get("nome") });
  if (!dados.success) return { erro: dados.error.issues[0].message };

  // O código é aleatório; se colidir com outro (raríssimo), tenta de novo.
  let criada = false;
  for (let tentativa = 0; tentativa < 5 && !criada; tentativa++) {
    try {
      await transacao(async (db) => {
        const { rows } = await db.query(
          `insert into turmas (nome, codigo_convite, criado_por)
           values ($1, $2, $3) returning id`,
          [dados.data.nome, gerarCodigoConvite(), usuario.id],
        );
        await db.query(
          `insert into membros (turma_id, usuario_id, papel)
           values ($1, $2, 'admin')`,
          [rows[0].id, usuario.id],
        );
      });
      criada = true;
    } catch (erro) {
      const { code, constraint } = erro as ErroPg;
      if (code === "23505" && constraint === "turmas_codigo_convite_key") {
        continue;
      }
      if (code === "23505" && constraint === "membros_usuario_id_key") {
        redirect("/dashboard");
      }
      throw erro;
    }
  }
  if (!criada) {
    return { erro: "Não foi possível gerar o código de convite. Tente de novo." };
  }
  redirect("/dashboard");
}

export async function entrarPorConvite(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const usuario = await getUsuarioAtual();
  if (await getMembro()) redirect("/dashboard");

  const dados = esquemaCodigo.safeParse({ codigo: formData.get("codigo") });
  if (!dados.success) return { erro: dados.error.issues[0].message };

  try {
    const resultado = await transacao(async (db) => {
      const { rows } = await db.query(
        "select id from turmas where codigo_convite = $1",
        [dados.data.codigo],
      );
      if (rows.length === 0) return "invalido" as const;
      await db.query(
        `insert into membros (turma_id, usuario_id, papel)
         values ($1, $2, 'participante')`,
        [rows[0].id, usuario.id],
      );
      return "ok" as const;
    });
    if (resultado === "invalido") return { erro: "Código de convite inválido." };
  } catch (erro) {
    if ((erro as ErroPg).code !== "23505") throw erro;
    // Já é membro de uma turma (corrida entre duas abas): segue para o painel.
  }
  redirect("/dashboard");
}

export async function sairDaTurma(): Promise<EstadoForm> {
  const membro = await exigirMembro();

  const resultado = await transacao(async (db) => {
    // Trava os membros da turma para que dois "sair" simultâneos não deixem
    // a turma sem administrador.
    const { rows } = await db.query(
      "select usuario_id, papel from membros where turma_id = $1 for update",
      [membro.turmaId],
    );
    const admins = rows.filter((r) => r.papel === "admin").length;
    if (membro.papel === "admin" && admins === 1 && rows.length > 1) {
      return "ultimo-admin" as const;
    }
    await db.query(
      "delete from membros where turma_id = $1 and usuario_id = $2",
      [membro.turmaId, membro.usuarioId],
    );
    // Turma sem ninguém é removida (apaga também votos, dúvidas e tarefas).
    if (rows.length === 1) {
      await db.query("delete from turmas where id = $1", [membro.turmaId]);
    }
    return "ok" as const;
  });

  if (resultado === "ultimo-admin") {
    return {
      erro: "Você é o único administrador. Promova outro membro antes de sair.",
    };
  }
  redirect("/convite");
}
