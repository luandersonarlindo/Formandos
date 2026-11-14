"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirAdminEditavel, exigirMembroEditavel } from "@/lib/dal";
import { pool, transacao } from "@/lib/db";
import { registrarAuditoria } from "@/lib/auditoria";
import { formatarDataHora } from "@/lib/datas";
import { lerPrazoLocal } from "@/lib/opcao-detalhe";
import {
  lerAcompanhantes,
  presencaFechada,
  STATUS_PRESENCA,
  TETO_ACOMPANHANTES,
} from "@/lib/presenca-regras";
import type { EstadoForm } from "./tipos";

// Cada membro responde só por si: a turma e a pessoa vêm da sessão. Quantos
// acompanhantes são permitidos é o limite que o admin da turma escolheu.

const esquema = z.object({
  status: z.enum(STATUS_PRESENCA, "Escolha se você vai."),
  observacao: z
    .string()
    .trim()
    .max(255, "A observação pode ter no máximo 255 caracteres.")
    .transform((v) => v || null),
});

// A lista de acompanhantes vem em campos repetidos (`acompanhante-nome` e
// `acompanhante-tipo`, um par por linha). A quantidade gravada em `presencas`
// é o tamanho da lista, na mesma transação (ADR-0013).
export async function responderPresenca(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const membro = await exigirMembroEditavel();
  // Depois do prazo a lista fecha (ADR-0013). A comissão reabre mudando a data.
  // Sem revalidar aqui: o card deixaria de ter o formulário e a mensagem
  // sumiria junto com o diálogo, antes de a pessoa ler.
  if (presencaFechada(membro.presencaAte, new Date())) {
    return {
      erro: `A lista de presença fechou em ${formatarDataHora.format(membro.presencaAte!)}. Para mudar, fale com a comissão.`,
    };
  }
  const dados = esquema.safeParse({
    status: formData.get("status"),
    observacao: formData.get("observacao") ?? "",
  });
  if (!dados.success) return { erro: dados.error.issues[0].message };
  const { status, observacao } = dados.data;
  const nomes = formData.getAll("acompanhante-nome").map(String);
  const tipos = formData.getAll("acompanhante-tipo").map(String);

  const erro = await transacao(async (db) => {
    const { rows } = await db.query(
      `select acompanhantes from presencas
        where turma_id = $1 and usuario_id = $2 and status = 'vou' for update`,
      [membro.turmaId, membro.usuarioId],
    );
    const lido = lerAcompanhantes(status, nomes, tipos, {
      limite: membro.maxAcompanhantes,
      atuais: rows[0]?.acompanhantes ?? 0,
    });
    if ("erro" in lido) return lido.erro;
    await db.query(
      `insert into presencas (turma_id, usuario_id, status, acompanhantes, observacao)
       values ($1, $2, $3, $4, $5)
       on conflict (turma_id, usuario_id)
       do update set status = excluded.status, acompanhantes = excluded.acompanhantes,
                     observacao = excluded.observacao, updated_at = now()`,
      [membro.turmaId, membro.usuarioId, status, lido.lista.length, observacao],
    );
    await db.query("delete from acompanhantes where turma_id = $1 and usuario_id = $2", [
      membro.turmaId,
      membro.usuarioId,
    ]);
    if (lido.lista.length > 0) {
      await db.query(
        `insert into acompanhantes (turma_id, usuario_id, nome, tipo, ordem)
         select $1, $2, x.nome, x.tipo, x.ordem::smallint
           from unnest($3::text[], $4::text[]) with ordinality as x(nome, tipo, ordem)`,
        [membro.turmaId, membro.usuarioId, lido.lista.map((a) => a.nome), lido.lista.map((a) => a.tipo)],
      );
    }
    return null;
  });
  if (erro) return { erro };
  revalidatePath("/dashboard");
  revalidatePath("/admin/presenca", "layout");
  return { ok: "Resposta salva." };
}

const esquemaLimite = z.object({
  maxAcompanhantes: z.coerce
    .number("Informe um número.")
    .int("Informe um número inteiro.")
    .min(0, "O limite não pode ser negativo.")
    .max(TETO_ACOMPANHANTES, `O limite não pode passar de ${TETO_ACOMPANHANTES}.`),
});

// Limite de acompanhantes da turma. Baixar o limite não corta ninguém
// (ADR-0013): com nomes, cortar seria o sistema escolher qual convidado sai.
// Quem já estava acima mantém a lista, aparece marcado no painel e só pode
// remover nomes.
export async function salvarLimiteAcompanhantes(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const admin = await exigirAdminEditavel();
  const dados = esquemaLimite.safeParse(Object.fromEntries(formData));
  if (!dados.success) return { erro: dados.error.issues[0].message };
  const limite = dados.data.maxAcompanhantes;

  await pool.query("update turmas set max_acompanhantes = $1 where id = $2", [limite, admin.turmaId]);
  const { rows } = await pool.query(
    `select count(*)::int as n from presencas p
       join membros m on m.turma_id = p.turma_id and m.usuario_id = p.usuario_id
      where p.turma_id = $1 and p.status = 'vou' and p.acompanhantes > $2`,
    [admin.turmaId, limite],
  );
  const acima: number = rows[0].n;

  revalidatePath("/admin/presenca");
  revalidatePath("/dashboard");
  return {
    ok:
      acima > 0
        ? `Limite salvo. ${acima} ${acima === 1 ? "resposta ficou" : "respostas ficaram"} acima do limite novo. Ninguém foi cortado: converse com ${acima === 1 ? "a pessoa" : "as pessoas"}.`
        : "Limite salvo.",
  };
}

// Prazo para confirmar presença (ADR-0013). Vazio = sem prazo. Mudar a data
// reabre a lista, vai para o histórico da turma e libera o lembrete de novo.
export async function salvarPrazoPresenca(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const admin = await exigirAdminEditavel();
  const prazo = lerPrazoLocal(String(formData.get("prazo") ?? ""));
  if (prazo === "invalido") return { erro: "Prazo inválido. Escolha a data e a hora." };

  const mudou = await transacao(async (db) => {
    const fmt = `coalesce(to_char(presenca_ate at time zone 'America/Sao_Paulo', 'YYYY-MM-DD"T"HH24:MI'), '')`;
    const { rows } = await db.query(`select ${fmt} as prazo from turmas where id = $1 for update`, [
      admin.turmaId,
    ]);
    const antes: string | null = rows[0].prazo || null;
    if (antes === prazo) return false;
    await db.query(
      "update turmas set presenca_ate = $1::timestamp at time zone 'America/Sao_Paulo' where id = $2",
      [prazo, admin.turmaId],
    );
    await db.query("delete from lembretes_enviados where tipo = 'presenca' and turma_id = $1", [
      admin.turmaId,
    ]);
    await registrarAuditoria(db, {
      usuarioId: admin.usuarioId,
      turmaId: admin.turmaId,
      acao: "presenca.prazo",
      entidade: "turma",
      entidadeId: admin.turmaId,
      detalhe: { antes, depois: prazo },
    });
    return true;
  });
  if (!mudou) return { ok: "Nada mudou." };
  revalidatePath("/admin/presenca");
  revalidatePath("/dashboard");
  return { ok: prazo ? "Prazo salvo. A turma vê a data no dashboard." : "Prazo removido. A lista está aberta." };
}
