"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  definirTurmaAtiva,
  exigirMembro,
  getUsuarioAtual,
} from "@/lib/dal";
import { podeEntrarEmOutraTurma, type Papel } from "@/lib/vinculos";
import { pool, transacao } from "@/lib/db";
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

const MAX_TENTATIVAS = 10;
const JANELA_MINUTOS = 15;

type ErroPg = { code?: string; constraint?: string };

const ERRO_SO_ADMIN =
  "Só administradores podem participar de mais de uma turma. Saia da sua turma atual antes de entrar em outra.";

// Confere, dentro da transação, se o usuário pode entrar em mais uma turma.
// O lock evita que duas abas passem juntas pela checagem.
async function podeEntrar(
  db: { query: (sql: string, params: unknown[]) => Promise<{ rows: { papel: Papel }[] }> },
  usuarioId: string,
) {
  await db.query("select pg_advisory_xact_lock(hashtext($1))", [usuarioId]);
  const { rows } = await db.query(
    "select papel from membros where usuario_id = $1",
    [usuarioId],
  );
  return podeEntrarEmOutraTurma(rows.map((r) => r.papel));
}

export async function criarTurma(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const usuario = await getUsuarioAtual();

  const dados = esquemaNome.safeParse({ nome: formData.get("nome") });
  if (!dados.success) return { erro: dados.error.issues[0].message };

  // O código é aleatório; se colidir com outro (raríssimo), tenta de novo.
  let turmaId: string | null = null;
  for (let tentativa = 0; tentativa < 5 && !turmaId; tentativa++) {
    try {
      const resultado = await transacao(async (db) => {
        if (!(await podeEntrar(db, usuario.id))) return "so-admin" as const;
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
        return rows[0].id as string;
      });
      if (resultado === "so-admin") return { erro: ERRO_SO_ADMIN };
      turmaId = resultado;
    } catch (erro) {
      const { code, constraint } = erro as ErroPg;
      if (code === "23505" && constraint === "turmas_codigo_convite_key") {
        continue;
      }
      throw erro;
    }
  }
  if (!turmaId) {
    return { erro: "Não foi possível gerar o código de convite. Tente de novo." };
  }
  await definirTurmaAtiva(turmaId);
  redirect("/dashboard");
}

export async function entrarPorConvite(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const usuario = await getUsuarioAtual();

  const dados = esquemaCodigo.safeParse({ codigo: formData.get("codigo") });
  if (!dados.success) return { erro: dados.error.issues[0].message };

  let turmaId: string | undefined;
  try {
    const resultado = await transacao(async (db) => {
      // Limite de tentativas erradas por usuário, para não dar para adivinhar
      // o código de convite por força bruta.
      const recentes = await db.query(
        `select count(*)::int as n from tentativas_convite
          where usuario_id = $1
            and created_at > now() - make_interval(mins => $2)`,
        [usuario.id, JANELA_MINUTOS],
      );
      if (recentes.rows[0].n >= MAX_TENTATIVAS) return "bloqueado" as const;

      const { rows } = await db.query(
        "select id from turmas where codigo_convite = $1",
        [dados.data.codigo],
      );
      if (rows.length === 0) {
        await db.query(
          "insert into tentativas_convite (usuario_id) values ($1)",
          [usuario.id],
        );
        // Aproveita para descartar tentativas antigas deste usuário.
        await db.query(
          "delete from tentativas_convite where usuario_id = $1 and created_at < now() - interval '1 day'",
          [usuario.id],
        );
        return "invalido" as const;
      }
      // Já ser membro desta turma não conta como "outra turma".
      const jaMembro = await db.query(
        "select 1 from membros where turma_id = $1 and usuario_id = $2",
        [rows[0].id, usuario.id],
      );
      if (jaMembro.rows.length > 0) return { turmaId: rows[0].id as string };
      if (!(await podeEntrar(db, usuario.id))) return "so-admin" as const;
      await db.query(
        `insert into membros (turma_id, usuario_id, papel)
         values ($1, $2, 'participante')`,
        [rows[0].id, usuario.id],
      );
      return { turmaId: rows[0].id as string };
    });
    if (resultado === "so-admin") return { erro: ERRO_SO_ADMIN };
    if (resultado === "bloqueado") {
      return {
        erro: "Muitas tentativas com código inválido. Tente de novo em alguns minutos.",
      };
    }
    if (resultado === "invalido") return { erro: "Código de convite inválido." };
    turmaId = resultado.turmaId;
  } catch (erro) {
    if ((erro as ErroPg).code !== "23505") throw erro;
    // Já é membro desta turma (corrida entre duas abas): segue para o painel.
  }
  if (turmaId) await definirTurmaAtiva(turmaId);
  redirect("/dashboard");
}

// Troca a turma em uso. O id vem da tela, mas só vale se o usuário for
// membro dessa turma (conferido no banco).
export async function trocarTurma(formData: FormData) {
  const usuario = await getUsuarioAtual();
  const dados = z.object({ turmaId: z.uuid() }).safeParse(Object.fromEntries(formData));
  if (!dados.success) return;

  const { rows } = await pool.query(
    "select 1 from membros where turma_id = $1 and usuario_id = $2",
    [dados.data.turmaId, usuario.id],
  );
  if (rows.length === 0) return;
  await definirTurmaAtiva(dados.data.turmaId);
  revalidatePath("/", "layout");
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
  // Com outra turma, segue para ela; sem nenhuma, o /dashboard leva ao /convite.
  redirect("/dashboard");
}
