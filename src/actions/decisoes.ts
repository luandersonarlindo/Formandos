"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import { exigirAdminEditavel } from "@/lib/dal";
import { catalogoVisivelSql } from "@/lib/catalogo-visibilidade";
import { transacao } from "@/lib/db";
import { registrarAuditoria } from "@/lib/auditoria";
import { emailDecisao, urlDoSite } from "@/lib/email";
import { destinatariosDaTurma, enviarParaTurma } from "@/lib/email-turma";
import { avaliarDecisao, validarJustificativa, type MotivoForaDaRegra } from "@/lib/decisao-regras";
import type { EstadoForm } from "./tipos";

// A decisão vale para a turma do administrador (vem da sessão). O id da enquete
// e das opções vêm do formulário e são conferidos: a enquete precisa ser do
// catálogo padrão ou da turma, e as opções precisam ser dela.

const esquemaFixar = z.object({
  enqueteId: z.uuid(),
  opcaoIds: z.array(z.uuid()).min(1, "Escolha pelo menos uma opção."),
  justificativa: z.string().default(""),
});

function revalidarDecisoes() {
  // Com "layout" de propósito: a decisão aparece nas filhas
  // /votacoes/[catalogoId], /votacoes/relatorio e /admin/votacoes/*.
  // Revalidar só a página exata deixava as filhas stale. Ação rara de admin,
  // fan-out irrelevante aqui.
  revalidatePath("/dashboard");
  revalidatePath("/votacoes", "layout");
  revalidatePath("/admin/votacoes", "layout");
}

// Fixa (ou troca) a decisão da turma em uma enquete. Enquanto houver decisão, a
// enquete não aceita mais votos; reabrir a votação apaga a decisão.
//
// Regra (ADR-0003): a comissão pode fixar qualquer opção, mas se a decisão
// fugir do combinado (não é a mais votada, empate, sem quórum, antes do prazo,
// sem votos) a justificativa é obrigatória. Os números do dia ficam gravados
// em `decisoes` e o histórico na auditoria, que a turma vê.
export async function fixarDecisao(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const admin = await exigirAdminEditavel();
  const dados = esquemaFixar.safeParse({
    enqueteId: formData.get("enqueteId"),
    opcaoIds: [...new Set(formData.getAll("opcaoId"))],
    justificativa: formData.get("justificativa") ?? "",
  });
  if (!dados.success) return { erro: dados.error.issues[0].message };
  const { enqueteId, opcaoIds } = dados.data;
  const justificativa = dados.data.justificativa.trim();

  const resultado = await transacao(
    async (db) => {
    // Dois admins fixando a mesma enquete ao mesmo tempo esperam a vez.
    // Sem isso, dois delete+insert concorrentes deixam 2 decisões numa
    // pergunta de escolha única (PK é por opcao, não por enquete).
    await db.query("select pg_advisory_xact_lock(hashtext($1))", [
      `${admin.turmaId}:${enqueteId}`,
    ]);
    const { rows: enquetes } = await db.query(
      `select e.tipo, e.titulo
         from enquetes e
         join categorias ca on ca.id = e.categoria_id
         join catalogos c on c.id = ca.catalogo_id
        where e.id = $1 and ${catalogoVisivelSql("$2")}`,
      [enqueteId, admin.turmaId],
    );
    if (enquetes.length === 0) return { estado: "inexistente" as const };
    if (enquetes[0].tipo === "unica" && opcaoIds.length !== 1) return { estado: "unica" as const };

    // Todas as opções da pergunta, com os votos desta turma: servem para
    // conferir as escolhidas e para avaliar a regra.
    const { rows: opcoes } = await db.query(
      `select o.id, o.texto, o.exclusiva,
              (select count(*)::int from votos v
                where v.opcao_id = o.id and v.turma_id = $2) as votos
         from opcoes o
        where o.enquete_id = $1
        order by o.ordem`,
      [enqueteId, admin.turmaId],
    );
    const escolhidas = opcoes.filter((o) => opcaoIds.includes(o.id));
    if (escolhidas.length !== opcaoIds.length) return { estado: "opcao" as const };
    if (escolhidas.length > 1 && escolhidas.some((o) => o.exclusiva)) {
      return { estado: "exclusiva" as const };
    }

    const [{ rows: contagem }, { rows: regras }] = await Promise.all([
      db.query(
        `select
           (select count(distinct v.usuario_id)::int
              from votos v join opcoes o on o.id = v.opcao_id
             where o.enquete_id = $1 and v.turma_id = $2) as votantes,
           (select count(*)::int from membros where turma_id = $2) as membros`,
        [enqueteId, admin.turmaId],
      ),
      db.query(
        `select prazo, quorum_pct as "quorumPct"
           from regras_enquete where turma_id = $1 and enquete_id = $2`,
        [admin.turmaId, enqueteId],
      ),
    ]);
    const { votantes, membros } = contagem[0];
    const motivos = avaliarDecisao({
      contagem: opcoes.map((o) => ({ id: o.id, votos: o.votos })),
      escolhidas: opcaoIds,
      votantes,
      membros,
      regra: regras[0] ?? null,
      agora: new Date(),
    });
    const erroJustificativa = validarJustificativa(motivos, justificativa);
    if (erroJustificativa) {
      return { estado: "justificativa" as const, mensagem: erroJustificativa };
    }

    await db.query("delete from decisoes where turma_id = $1 and enquete_id = $2", [
      admin.turmaId,
      enqueteId,
    ]);
    await db.query(
      `insert into decisoes
         (turma_id, enquete_id, opcao_id, decidido_por, justificativa, votantes, membros, fora_da_regra)
       select $1, $2, unnest($3::uuid[]), $4, $5, $6, $7, $8::text[]`,
      [
        admin.turmaId,
        enqueteId,
        opcaoIds,
        admin.usuarioId,
        justificativa || null,
        votantes,
        membros,
        motivos,
      ],
    );
    // Guarda textos, não só ids: a opção pode ser renomeada ou apagada depois.
    await registrarAuditoria(db, {
      usuarioId: admin.usuarioId,
      turmaId: admin.turmaId,
      acao: "decisao.fixada",
      entidade: "enquete",
      entidadeId: enqueteId,
      detalhe: {
        pergunta: enquetes[0].titulo,
        escolhidas: escolhidas.map((o) => o.texto),
        contagem: opcoes.map((o) => ({ texto: o.texto, votos: o.votos })),
        votantes,
        membros,
        foraDaRegra: motivos,
        justificativa: justificativa || null,
      },
    });
    return {
      estado: "ok" as const,
      motivos,
      email: {
        pergunta: enquetes[0].titulo as string,
        escolhas: escolhidas.map((o) => o.texto as string),
        votantes: votantes as number,
        membros: membros as number,
      },
    };
    },
    { acao: "decisoes.fixar" },
  );

  if (resultado.estado === "inexistente") return { erro: "Enquete não encontrada." };
  if (resultado.estado === "unica") return { erro: "Escolha apenas uma opção." };
  if (resultado.estado === "opcao") return { erro: "Opção inválida para esta enquete." };
  if (resultado.estado === "exclusiva") {
    return { erro: "Essa opção não pode ser combinada com as outras." };
  }
  if (resultado.estado === "justificativa") {
    return { erro: resultado.mensagem, valores: { justificativa } };
  }
  revalidarDecisoes();
  // Email "Decidido" para a turma (ADR-0006), depois da resposta: a tela não
  // espera os envios.
  const dadosEmail = resultado.email;
  after(async () => {
    const destinatarios = await destinatariosDaTurma(admin.turmaId, admin.usuarioId);
    await enviarParaTurma(destinatarios, (d) =>
      emailDecisao({
        nome: d.nome,
        turma: admin.turmaNome,
        ...dadosEmail,
        justificativa: justificativa || null,
        url: urlDoSite("/dashboard"),
      }),
    );
  });
  return { ok: mensagemFixada(resultado.motivos) };
}

function mensagemFixada(motivos: MotivoForaDaRegra[]) {
  return motivos.length > 0
    ? "Decisão fixada. Como foge da regra, a turma vê o motivo junto com ela."
    : "Decisão fixada. A votação desta pergunta foi encerrada.";
}

export async function reabrirVotacao(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const admin = await exigirAdminEditavel();
  const dados = z.object({ enqueteId: z.uuid() }).safeParse(Object.fromEntries(formData));
  if (!dados.success) return { erro: "Enquete não encontrada." };
  await transacao(
    async (db) => {
      await db.query("select pg_advisory_xact_lock(hashtext($1))", [
        `${admin.turmaId}:${dados.data.enqueteId}`,
      ]);
      // Antes de apagar, registra o que estava fixado: reabrir não pode
      // sumir com a decisão (ADR-0003).
      const { rows: fixadas } = await db.query(
        `select e.titulo, o.texto
           from decisoes d
           join enquetes e on e.id = d.enquete_id
           join opcoes o on o.id = d.opcao_id
          where d.turma_id = $1 and d.enquete_id = $2
          order by o.ordem`,
        [admin.turmaId, dados.data.enqueteId],
      );
      if (fixadas.length === 0) return;
      await db.query("delete from decisoes where turma_id = $1 and enquete_id = $2", [
        admin.turmaId,
        dados.data.enqueteId,
      ]);
      await registrarAuditoria(db, {
        usuarioId: admin.usuarioId,
        turmaId: admin.turmaId,
        acao: "decisao.reaberta",
        entidade: "enquete",
        entidadeId: dados.data.enqueteId,
        detalhe: {
          pergunta: fixadas[0].titulo,
          escolhidas: fixadas.map((f) => f.texto),
        },
      });
    },
    { acao: "decisoes.reabrir" },
  );
  revalidarDecisoes();
  return { ok: "Votação reaberta." };
}
