"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { registrarAuditoria } from "@/lib/auditoria";
import { exigirAdminEditavel, exigirMembroEditavel, exigirTesourariaEditavel } from "@/lib/dal";
import { consumirLimite } from "@/lib/throttle";
import { transacao } from "@/lib/db";
import { lerValorPessoa } from "@/lib/opcao-detalhe";
import { MAX_PARCELAS, gerarPlano } from "@/lib/situacao-regras";
import type { EstadoForm } from "./tipos";

// Dinheiro que entra (ADR-0005). Toda action confere a turma da sessão; os ids
// que vêm do formulário só valem se forem desta turma. Lançar, editar e montar
// o plano é só da tesouraria. Marcar quem é a tesouraria é de qualquer admin.

function revalidarDinheiro() {
  revalidatePath("/minha-situacao");
  revalidatePath("/admin/tesouraria", "layout");
}

const data = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Escolha a data.");

// ---- Quem é a tesouraria ---------------------------------------------------

export async function alternarTesouraria(formData: FormData) {
  const admin = await exigirAdminEditavel();
  const dados = z.object({ usuarioId: z.uuid() }).safeParse(Object.fromEntries(formData));
  if (!dados.success) return;
  await transacao(async (db) => {
    const { rows } = await db.query(
      `update membros set tesouraria = not tesouraria
        where turma_id = $1 and usuario_id = $2 and papel = 'admin'
        returning tesouraria`,
      [admin.turmaId, dados.data.usuarioId],
    );
    if (rows.length === 0) return;
    await registrarAuditoria(db, {
      usuarioId: admin.usuarioId,
      turmaId: admin.turmaId,
      acao: "papel.tesouraria",
      entidade: "membro",
      entidadeId: dados.data.usuarioId,
      detalhe: { tesouraria: rows[0].tesouraria },
    });
  });
  revalidatePath("/admin/membros");
  revalidatePath("/", "layout");
}

// ---- Plano de parcelas -----------------------------------------------------

type ParcelaTexto = { numero: number; valor: number; vencimento: string };

async function planoAtual(db: Parameters<Parameters<typeof transacao>[0]>[0], turmaId: string) {
  const { rows } = await db.query(
    `select numero, valor::float8 as valor, to_char(vencimento, 'YYYY-MM-DD') as vencimento
       from parcelas where turma_id = $1 order by numero for update`,
    [turmaId],
  );
  return rows as ParcelaTexto[];
}

const esquemaPlano = z.object({
  quantidade: z.coerce
    .number()
    .int("Use um número inteiro de parcelas.")
    .min(1, "Pelo menos 1 parcela.")
    .max(MAX_PARCELAS, `No máximo ${MAX_PARCELAS} parcelas.`),
  valor: z.string(),
  primeira: data,
});

// Monta (ou refaz) o plano inteiro: N parcelas mensais de mesmo valor. Os
// lançamentos não dependem das parcelas, então refazer o plano não perde nada:
// a situação de cada um é recalculada.
export async function salvarPlano(_estado: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const tesouraria = await exigirTesourariaEditavel();
  const enviados = Object.fromEntries(formData) as Record<string, string>;
  const dados = esquemaPlano.safeParse(enviados);
  if (!dados.success) return { erro: dados.error.issues[0].message, valores: enviados };
  const valor = lerValorPessoa(dados.data.valor);
  if (valor === null || valor === "invalido" || valor <= 0) {
    return { erro: "Valor da parcela inválido. Use só números, como 150 ou 150,50.", valores: enviados };
  }
  const novo = gerarPlano(dados.data.quantidade, valor, dados.data.primeira);

  await transacao(
    async (db) => {
      const antes = await planoAtual(db, tesouraria.turmaId);
      await db.query("delete from parcelas where turma_id = $1", [tesouraria.turmaId]);
      for (const p of novo) {
        await db.query(
          "insert into parcelas (turma_id, numero, valor, vencimento) values ($1, $2, $3, $4)",
          [tesouraria.turmaId, p.numero, p.valor, p.vencimento],
        );
      }
      await registrarAuditoria(db, {
        usuarioId: tesouraria.usuarioId,
        turmaId: tesouraria.turmaId,
        acao: "plano.alterado",
        entidade: "turma",
        entidadeId: tesouraria.turmaId,
        detalhe: { antes, depois: novo },
      });
    },
    { acao: "tesouraria.plano" },
  );
  revalidarDinheiro();
  return { ok: `Plano salvo: ${novo.length} ${novo.length === 1 ? "parcela" : "parcelas"}.` };
}

const esquemaParcela = z.object({
  numero: z.coerce.number().int().min(1).max(MAX_PARCELAS),
  valor: z.string(),
  vencimento: data,
});

// Ajusta uma parcela (valor ou vencimento). A mudança fica no histórico.
export async function atualizarParcela(_estado: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const tesouraria = await exigirTesourariaEditavel();
  const dados = esquemaParcela.safeParse(Object.fromEntries(formData));
  if (!dados.success) return { erro: dados.error.issues[0].message };
  const valor = lerValorPessoa(dados.data.valor);
  if (valor === null || valor === "invalido" || valor <= 0) {
    return { erro: "Valor da parcela inválido. Use só números, como 150 ou 150,50." };
  }
  const { numero, vencimento } = dados.data;

  const resultado = await transacao(
    async (db) => {
      const antes = await planoAtual(db, tesouraria.turmaId);
      const atual = antes.find((p) => p.numero === numero);
      if (!atual) return "inexistente" as const;
      if (atual.valor === valor && atual.vencimento === vencimento) return "igual" as const;
      await db.query(
        "update parcelas set valor = $1, vencimento = $2 where turma_id = $3 and numero = $4",
        [valor, vencimento, tesouraria.turmaId, numero],
      );
      await registrarAuditoria(db, {
        usuarioId: tesouraria.usuarioId,
        turmaId: tesouraria.turmaId,
        acao: "plano.alterado",
        entidade: "turma",
        entidadeId: tesouraria.turmaId,
        detalhe: { parcela: numero, antes: atual, depois: { numero, valor, vencimento } },
      });
      return "ok" as const;
    },
    { acao: "tesouraria.parcela" },
  );
  if (resultado === "inexistente") return { erro: "Parcela não encontrada." };
  if (resultado === "igual") return { ok: "Nada mudou." };
  revalidarDinheiro();
  return { ok: `Parcela ${numero} atualizada.` };
}

// ---- Lançamentos -----------------------------------------------------------

const esquemaLancamento = z.object({
  usuarioId: z.uuid(),
  tipo: z.enum(["pagamento", "devolucao", "ajuste"], "Escolha o tipo."),
  valor: z.string(),
  pagoEm: data,
  forma: z.enum(["pix", "dinheiro", "transferencia", "outro"], "Escolha a forma."),
  pagoPor: z.string().trim().max(120, "Quem pagou: no máximo 120 caracteres.").optional().default(""),
  referencia: z
    .string()
    .trim()
    .max(120, "Referência: no máximo 120 caracteres.")
    .optional()
    .default(""),
});

type DadosLancamento = {
  tipo: "pagamento" | "devolucao" | "ajuste";
  valor: number;
  pagoEm: string;
  forma: string;
  pagoPor: string | null;
  referencia: string | null;
};

function lerLancamento(formData: FormData) {
  const enviados = Object.fromEntries(formData) as Record<string, string>;
  const dados = esquemaLancamento.safeParse(enviados);
  if (!dados.success) return { erro: dados.error.issues[0].message, enviados } as const;
  const valor = lerValorPessoa(dados.data.valor);
  if (valor === null || valor === "invalido" || valor <= 0) {
    return { erro: "Valor inválido. Use só números, como 150 ou 150,50.", enviados } as const;
  }
  if (dados.data.tipo === "ajuste" && !dados.data.referencia) {
    return { erro: "No ajuste, escreva o motivo em “Referência”.", enviados } as const;
  }
  const lancamento: DadosLancamento = {
    tipo: dados.data.tipo,
    valor,
    pagoEm: dados.data.pagoEm,
    forma: dados.data.forma,
    pagoPor: dados.data.pagoPor || null,
    referencia: dados.data.referencia || null,
  };
  return { usuarioId: dados.data.usuarioId, lancamento, enviados } as const;
}

// Lançamento feito pela tesouraria já nasce confirmado.
export async function lancarPagamento(_estado: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const tesouraria = await exigirTesourariaEditavel();
  const lido = lerLancamento(formData);
  if ("erro" in lido) return { erro: lido.erro, valores: lido.enviados };
  const { usuarioId, lancamento: l } = lido;

  const resultado = await transacao(
    async (db) => {
      const { rowCount } = await db.query(
        "select 1 from membros where turma_id = $1 and usuario_id = $2",
        [tesouraria.turmaId, usuarioId],
      );
      if (!rowCount) return "inexistente" as const;
      const { rows } = await db.query(
        `insert into pagamentos
           (turma_id, usuario_id, tipo, valor, pago_em, forma, pago_por, referencia,
            status, lancado_por, confirmado_por)
         values ($1, $2, $3, $4, $5, $6, $7, $8, 'confirmado', $9, $9)
         returning id`,
        [tesouraria.turmaId, usuarioId, l.tipo, l.valor, l.pagoEm, l.forma, l.pagoPor, l.referencia, tesouraria.usuarioId],
      );
      await registrarAuditoria(db, {
        usuarioId: tesouraria.usuarioId,
        turmaId: tesouraria.turmaId,
        acao: "pagamento.lancado",
        entidade: "pagamento",
        entidadeId: rows[0].id,
        detalhe: { membro: usuarioId, tipo: l.tipo, valor: l.valor, pagoEm: l.pagoEm },
      });
      return "ok" as const;
    },
    { acao: "tesouraria.lancar" },
  );
  if (resultado === "inexistente") return { erro: "Essa pessoa não é da turma." };
  revalidarDinheiro();
  return { ok: "Lançamento registrado." };
}

const esquemaEditar = esquemaLancamento.extend({ id: z.uuid() });

export async function editarPagamento(_estado: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const tesouraria = await exigirTesourariaEditavel();
  const id = esquemaEditar.shape.id.safeParse(formData.get("id"));
  if (!id.success) return { erro: "Lançamento não encontrado." };
  const lido = lerLancamento(formData);
  if ("erro" in lido) return { erro: lido.erro };
  const { usuarioId, lancamento: l } = lido;

  const resultado = await transacao(
    async (db) => {
      const { rows: antes } = await db.query(
        `select tipo, valor::float8 as valor, to_char(pago_em, 'YYYY-MM-DD') as "pagoEm", forma,
                pago_por as "pagoPor", referencia
           from pagamentos where id = $1 and turma_id = $2 and usuario_id = $3 for update`,
        [id.data, tesouraria.turmaId, usuarioId],
      );
      if (antes.length === 0) return "inexistente" as const;
      await db.query(
        `update pagamentos
            set tipo = $1, valor = $2, pago_em = $3, forma = $4, pago_por = $5, referencia = $6,
                updated_at = now()
          where id = $7`,
        [l.tipo, l.valor, l.pagoEm, l.forma, l.pagoPor, l.referencia, id.data],
      );
      await registrarAuditoria(db, {
        usuarioId: tesouraria.usuarioId,
        turmaId: tesouraria.turmaId,
        acao: "pagamento.editado",
        entidade: "pagamento",
        entidadeId: id.data,
        detalhe: { membro: usuarioId, antes: antes[0], depois: l },
      });
      return "ok" as const;
    },
    { acao: "tesouraria.editar" },
  );
  if (resultado === "inexistente") return { erro: "Lançamento não encontrado." };
  revalidarDinheiro();
  return { ok: "Lançamento atualizado." };
}

export async function excluirPagamento(formData: FormData) {
  const tesouraria = await exigirTesourariaEditavel();
  const dados = z.object({ id: z.uuid() }).safeParse(Object.fromEntries(formData));
  if (!dados.success) return;
  await transacao(
    async (db) => {
      const { rows } = await db.query(
        `delete from pagamentos where id = $1 and turma_id = $2
         returning usuario_id, tipo, valor::float8 as valor, to_char(pago_em, 'YYYY-MM-DD') as "pagoEm", status`,
        [dados.data.id, tesouraria.turmaId],
      );
      if (rows.length === 0) return;
      await registrarAuditoria(db, {
        usuarioId: tesouraria.usuarioId,
        turmaId: tesouraria.turmaId,
        acao: "pagamento.excluido",
        entidade: "pagamento",
        entidadeId: dados.data.id,
        detalhe: { membro: rows[0].usuario_id, ...rows[0], usuario_id: undefined },
      });
    },
    { acao: "tesouraria.excluir" },
  );
  revalidarDinheiro();
}

// ---- "Já paguei" (ADR-0005, parte 2) -----------------------------------------

// Arquivo "use server" só pode exportar funções async.
const MAX_INFORMES_POR_DIA = 10;

// O formando informa um pagamento que fez. Entra como "informado" e só conta
// na situação depois que a tesouraria confirma. Tipo é sempre pagamento.
export async function informarPagamento(_estado: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const membro = await exigirMembroEditavel();
  formData.set("usuarioId", membro.usuarioId);
  formData.set("tipo", "pagamento");
  const lido = lerLancamento(formData);
  if ("erro" in lido) return { erro: lido.erro, valores: lido.enviados };
  const l = lido.lancamento;

  const resultado = await transacao(
    async (db) => {
      const livre = await consumirLimite(
        db,
        `informe:${membro.usuarioId}:${membro.turmaId}`,
        MAX_INFORMES_POR_DIA,
        24 * 60,
      );
      if (!livre) return "limite" as const;
      const { rows } = await db.query(
        `insert into pagamentos
           (turma_id, usuario_id, tipo, valor, pago_em, forma, pago_por, referencia, status, lancado_por)
         values ($1, $2, 'pagamento', $3, $4, $5, $6, $7, 'informado', $2)
         returning id`,
        [membro.turmaId, membro.usuarioId, l.valor, l.pagoEm, l.forma, l.pagoPor, l.referencia],
      );
      await registrarAuditoria(db, {
        usuarioId: membro.usuarioId,
        turmaId: membro.turmaId,
        acao: "pagamento.informado",
        entidade: "pagamento",
        entidadeId: rows[0].id,
        detalhe: { valor: l.valor, pagoEm: l.pagoEm },
      });
      return "ok" as const;
    },
    { acao: "tesouraria.informar" },
  );
  if (resultado === "limite") {
    return { erro: `Você já informou ${MAX_INFORMES_POR_DIA} pagamentos hoje. Tente amanhã ou fale com a tesouraria.` };
  }
  revalidarDinheiro();
  return { ok: "Pagamento informado. Ele conta depois que a tesouraria confirmar." };
}

// O próprio formando desiste de um informe que ainda não foi conferido.
export async function cancelarInforme(formData: FormData) {
  const membro = await exigirMembroEditavel();
  const dados = z.object({ id: z.uuid() }).safeParse(Object.fromEntries(formData));
  if (!dados.success) return;
  await transacao(async (db) => {
    const { rows } = await db.query(
      `delete from pagamentos
        where id = $1 and turma_id = $2 and usuario_id = $3 and status = 'informado'
        returning valor::float8 as valor`,
      [dados.data.id, membro.turmaId, membro.usuarioId],
    );
    if (rows.length === 0) return;
    await registrarAuditoria(db, {
      usuarioId: membro.usuarioId,
      turmaId: membro.turmaId,
      acao: "pagamento.excluido",
      entidade: "pagamento",
      entidadeId: dados.data.id,
      detalhe: { cancelado: true, valor: rows[0].valor },
    });
  });
  revalidarDinheiro();
}

export async function confirmarPagamento(formData: FormData) {
  const tesouraria = await exigirTesourariaEditavel();
  const dados = z.object({ id: z.uuid() }).safeParse(Object.fromEntries(formData));
  if (!dados.success) return;
  await transacao(async (db) => {
    const { rows } = await db.query(
      `update pagamentos
          set status = 'confirmado', confirmado_por = $3, motivo_recusa = null, updated_at = now()
        where id = $1 and turma_id = $2 and status = 'informado'
        returning usuario_id, valor::float8 as valor`,
      [dados.data.id, tesouraria.turmaId, tesouraria.usuarioId],
    );
    if (rows.length === 0) return;
    await registrarAuditoria(db, {
      usuarioId: tesouraria.usuarioId,
      turmaId: tesouraria.turmaId,
      acao: "pagamento.confirmado",
      entidade: "pagamento",
      entidadeId: dados.data.id,
      detalhe: { membro: rows[0].usuario_id, valor: rows[0].valor },
    });
  });
  revalidarDinheiro();
}

const esquemaRecusa = z.object({
  id: z.uuid(),
  motivo: z
    .string()
    .trim()
    .min(3, "Escreva o motivo, para a pessoa saber o que fazer.")
    .max(255, "O motivo pode ter no máximo 255 caracteres."),
});

export async function recusarPagamento(_estado: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const tesouraria = await exigirTesourariaEditavel();
  const dados = esquemaRecusa.safeParse(Object.fromEntries(formData));
  if (!dados.success) return { erro: dados.error.issues[0].message };
  const resultado = await transacao(async (db) => {
    const { rows } = await db.query(
      `update pagamentos
          set status = 'recusado', motivo_recusa = $3, confirmado_por = $4, updated_at = now()
        where id = $1 and turma_id = $2 and status = 'informado'
        returning usuario_id, valor::float8 as valor`,
      [dados.data.id, tesouraria.turmaId, dados.data.motivo, tesouraria.usuarioId],
    );
    if (rows.length === 0) return "inexistente" as const;
    await registrarAuditoria(db, {
      usuarioId: tesouraria.usuarioId,
      turmaId: tesouraria.turmaId,
      acao: "pagamento.recusado",
      entidade: "pagamento",
      entidadeId: dados.data.id,
      detalhe: { membro: rows[0].usuario_id, valor: rows[0].valor, motivo: dados.data.motivo },
    });
    return "ok" as const;
  });
  if (resultado === "inexistente") return { erro: "Esse informe já foi conferido." };
  revalidarDinheiro();
  return { ok: "Informe recusado. A pessoa vê o motivo em “Minha situação”." };
}

// ---- Regras do dinheiro (ADR-0005, parte 3) ----------------------------------

const MAX_REGRAS = 2000;

// Texto livre da tesouraria: desistência, devolução, multa. Aparece para a
// turma em "Minha situação".
export async function salvarRegrasDinheiro(_estado: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const tesouraria = await exigirTesourariaEditavel();
  const texto = String(formData.get("regras") ?? "").trim();
  if (texto.length > MAX_REGRAS) {
    return { erro: `O texto pode ter no máximo ${MAX_REGRAS} caracteres.`, valores: { regras: texto } };
  }
  await transacao(async (db) => {
    await db.query("update turmas set regras_dinheiro = $1 where id = $2", [
      texto || null,
      tesouraria.turmaId,
    ]);
  });
  revalidarDinheiro();
  return { ok: "Regras salvas. A turma vê em “Minha situação”." };
}
