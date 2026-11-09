"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import { exigirAdminEditavel } from "@/lib/dal";
import { pool, transacao } from "@/lib/db";
import { ehLinkHttps } from "@/lib/evento";
import { registrarAuditoria } from "@/lib/auditoria";
import { emailEventoMudou, urlDoSite } from "@/lib/email";
import { destinatariosDaTurma, enviarParaTurma } from "@/lib/email-turma";
import { listarRotulos, mudancasEvento, type EstadoEvento } from "@/lib/lembretes-regras";
import type { EstadoForm } from "./tipos";

// <input type="datetime-local"> envia "AAAA-MM-DDTHH:mm" (sem fuso).
// O horário é interpretado como horário de Brasília.
const dataHora = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Data ou hora inválida.");

const opcional = (max: number, mensagem: string) =>
  z
    .string()
    .trim()
    .max(max, mensagem)
    .transform((v) => v || null);

const esquemaEvento = z.object({
  nome: z
    .string()
    .trim()
    .min(3, "O nome da turma precisa ter pelo menos 3 caracteres.")
    .max(100, "O nome da turma pode ter no máximo 100 caracteres."),
  dataEvento: z.union([z.literal("").transform(() => null), dataHora]),
  dataFimEvento: z.union([z.literal("").transform(() => null), dataHora]),
  localEvento: z
    .string()
    .trim()
    .max(255, "O local pode ter no máximo 255 caracteres.")
    .transform((v) => v || null),
  descricao: opcional(1000, "A descrição pode ter no máximo 1000 caracteres."),
  endereco: opcional(255, "O endereço pode ter no máximo 255 caracteres."),
  linkMapa: z
    .string()
    .trim()
    .max(500, "O link do mapa pode ter no máximo 500 caracteres.")
    .refine((v) => v === "" || ehLinkHttps(v), "O link do mapa precisa começar com https://.")
    .transform((v) => v || null),
  traje: opcional(100, "O traje pode ter no máximo 100 caracteres."),
  observacoesLocal: opcional(500, "As observações podem ter no máximo 500 caracteres."),
});

const esquemaItem = z.object({
  horario: dataHora,
  titulo: z
    .string()
    .trim()
    .min(2, "O título precisa ter pelo menos 2 caracteres.")
    .max(255, "O título pode ter no máximo 255 caracteres."),
  descricao: z
    .string()
    .trim()
    .max(500, "A descrição pode ter no máximo 500 caracteres.")
    .transform((v) => v || null),
});

const MAX_ITENS_PROGRAMACAO = 100;

function revalidarEvento() {
  revalidatePath("/dashboard");
}

// A programação também é "o evento" para a página pública (ADR-0008).
async function marcarEventoAtualizado(turmaId: string) {
  await pool.query("update turmas set evento_atualizado_em = now() where id = $1", [turmaId]);
}

export async function salvarEvento(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const admin = await exigirAdminEditavel();
  const dados = esquemaEvento.safeParse(Object.fromEntries(formData));
  if (!dados.success) return { erro: dados.error.issues[0].message };
  const { nome, dataEvento, dataFimEvento, localEvento, descricao, endereco, linkMapa, traje, observacoesLocal } =
    dados.data;
  if (dataFimEvento && !dataEvento) {
    return { erro: "Informe a data de início para usar um horário de término." };
  }
  // Mesmo formato ("AAAA-MM-DDTHH:mm"), então comparar como texto funciona.
  if (dataFimEvento && dataEvento && dataFimEvento <= dataEvento) {
    return { erro: "O término precisa ser depois do início." };
  }

  // Lê o estado anterior na mesma transação para saber o que mudou e avisar a
  // turma por email ("Mudou: horário da formatura", ADR-0006).
  const mudancas = await transacao(
    async (db) => {
      const { rows } = await db.query(
        `select coalesce(to_char(data_evento at time zone 'America/Sao_Paulo', 'YYYY-MM-DD"T"HH24:MI'), '') as inicio,
                coalesce(local_evento, '') as local, coalesce(endereco, '') as endereco
           from turmas where id = $1 for update`,
        [admin.turmaId],
      );
      // evento_atualizado_em (ADR-0008) só muda se algum dado mudou de fato:
      // salvar sem mexer em nada não pode dizer "Atualizado agora".
      await db.query(
        `update turmas
            set evento_atualizado_em = case
                  when (nome, data_evento, data_fim_evento, local_evento, descricao, endereco,
                        link_mapa, traje, observacoes_local)
                       is distinct from
                       ($1::varchar, $2::timestamp at time zone 'America/Sao_Paulo',
                        $3::timestamp at time zone 'America/Sao_Paulo', $4::varchar, $5::text,
                        $6::varchar, $7::varchar, $8::varchar, $9::text)
                  then now() else evento_atualizado_em end,
                nome = $1,
                data_evento = $2::timestamp at time zone 'America/Sao_Paulo',
                data_fim_evento = $3::timestamp at time zone 'America/Sao_Paulo',
                local_evento = $4, descricao = $5, endereco = $6, link_mapa = $7,
                traje = $8, observacoes_local = $9
          where id = $10`,
        [nome, dataEvento, dataFimEvento, localEvento, descricao, endereco, linkMapa, traje, observacoesLocal, admin.turmaId],
      );
      const depois: EstadoEvento = {
        inicio: dataEvento ?? "",
        local: localEvento ?? "",
        endereco: endereco ?? "",
      };
      const lista = mudancasEvento(rows[0] as EstadoEvento, depois);
      // Data, horário, local ou endereço mudaram: fica no histórico, visível à
      // turma e na página pública (ADR-0008).
      if (lista.length > 0) {
        await registrarAuditoria(db, {
          usuarioId: admin.usuarioId,
          turmaId: admin.turmaId,
          acao: "evento.alterado",
          entidade: "turma",
          entidadeId: admin.turmaId,
          detalhe: { mudancas: lista },
        });
      }
      return lista;
    },
    { acao: "evento.salvar" },
  );
  if (mudancas.length > 0) {
    after(async () => {
      const { rows: t } = await pool.query("select token_publico from turmas where id = $1", [admin.turmaId]);
      const linkPublico = t[0]?.token_publico ? urlDoSite(`/evento/${t[0].token_publico}`) : null;
      const destinatarios = await destinatariosDaTurma(admin.turmaId, admin.usuarioId);
      await enviarParaTurma(destinatarios, (d) =>
        emailEventoMudou({
          nome: d.nome,
          turma: nome || admin.turmaNome,
          oQue: listarRotulos(mudancas),
          mudancas,
          url: urlDoSite("/dashboard"),
          linkPublico,
        }),
      );
    });
  }
  revalidarEvento();
  revalidatePath("/", "layout");
  return { ok: "Dados do evento salvos." };
}

export async function adicionarItemProgramacao(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const admin = await exigirAdminEditavel();
  const dados = esquemaItem.safeParse(Object.fromEntries(formData));
  if (!dados.success) return { erro: dados.error.issues[0].message };
  const { horario, titulo, descricao } = dados.data;

  // Conta e insere na mesma transação com lock: dois cliques seguidos
  // passavam juntos pelo teto (mesmo padrão do limite de catálogos).
  const total = await transacao(async (db) => {
    await db.query("select 1 from turmas where id = $1 for update", [admin.turmaId]);
    const { rows } = await db.query(
      "select count(*)::int as total from programacao where turma_id = $1",
      [admin.turmaId],
    );
    if (rows[0].total >= MAX_ITENS_PROGRAMACAO) return null;
    await db.query(
      `insert into programacao (turma_id, horario, titulo, descricao)
       values ($1, $2::timestamp at time zone 'America/Sao_Paulo', $3, $4)`,
      [admin.turmaId, horario, titulo, descricao],
    );
    return true;
  });
  if (!total) {
    return { erro: `A programação pode ter no máximo ${MAX_ITENS_PROGRAMACAO} itens.` };
  }
  await marcarEventoAtualizado(admin.turmaId);
  revalidarEvento();
  return { ok: "Item adicionado." };
}

export async function atualizarItemProgramacao(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const admin = await exigirAdminEditavel();
  const dados = esquemaItem
    .extend({ id: z.uuid() })
    .safeParse(Object.fromEntries(formData));
  if (!dados.success) return { erro: dados.error.issues[0].message };
  const { id, horario, titulo, descricao } = dados.data;

  const { rowCount } = await pool.query(
    `update programacao
        set horario = $1::timestamp at time zone 'America/Sao_Paulo', titulo = $2, descricao = $3
      where id = $4 and turma_id = $5`,
    [horario, titulo, descricao, id, admin.turmaId],
  );
  if (!rowCount) return { erro: "Item não encontrado." };
  await marcarEventoAtualizado(admin.turmaId);
  revalidarEvento();
  return { ok: "Item atualizado." };
}

export async function removerItemProgramacao(formData: FormData) {
  const admin = await exigirAdminEditavel();
  const dados = z.object({ id: z.uuid() }).safeParse(Object.fromEntries(formData));
  if (!dados.success) return;
  await pool.query("delete from programacao where id = $1 and turma_id = $2", [
    dados.data.id,
    admin.turmaId,
  ]);
  await marcarEventoAtualizado(admin.turmaId);
  revalidarEvento();
}

// ---- Link público do evento (ADR-0008) ------------------------------------

// 128 bits em base64url: 22 caracteres, impossível de adivinhar. Diferente do
// código de convite, que dá entrada na turma.
const novoToken = () => randomBytes(16).toString("base64url");

async function mudarLinkPublico(estado: "criado" | "trocado" | "desligado") {
  const admin = await exigirAdminEditavel();
  await transacao(async (db) => {
    await db.query("update turmas set token_publico = $1 where id = $2", [
      estado === "desligado" ? null : novoToken(),
      admin.turmaId,
    ]);
    await registrarAuditoria(db, {
      usuarioId: admin.usuarioId,
      turmaId: admin.turmaId,
      acao: "evento.link_publico",
      entidade: "turma",
      entidadeId: admin.turmaId,
      detalhe: { estado },
    });
  });
  revalidarEvento();
}

export async function ligarPaginaPublica() {
  await mudarLinkPublico("criado");
}

export async function trocarLinkPublico() {
  await mudarLinkPublico("trocado");
}

export async function desligarPaginaPublica() {
  await mudarLinkPublico("desligado");
}
