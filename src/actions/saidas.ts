"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { registrarAuditoria } from "@/lib/auditoria";
import { exigirTesourariaEditavel } from "@/lib/dal";
import { transacao } from "@/lib/db";
import { lerValorPessoa } from "@/lib/opcao-detalhe";
import { detalheAuditoria } from "@/lib/saidas-regras";
import type { EstadoForm } from "./tipos";

// Saídas do caixa (ADR-0022). Só a tesouraria lança, edita e exclui. O
// fornecedor, quando vem, precisa ser da mesma turma. Tudo vai para o
// histórico da turma, mas a saída "só da comissão" vai como "Outras despesas".

function revalidarCaixa() {
  revalidatePath("/minha-situacao");
  revalidatePath("/admin/tesouraria", "layout");
  revalidatePath("/registro");
  revalidatePath("/admin/turma", "layout");
}

const esquemaSaida = z.object({
  descricao: z
    .string()
    .trim()
    .min(2, "Escreva a descrição da saída.")
    .max(200, "A descrição pode ter no máximo 200 caracteres."),
  valor: z.string(),
  pagoEm: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Escolha a data."),
  fornecedorId: z.union([z.uuid(), z.literal("")]).optional().default(""),
  referencia: z.string().trim().max(120, "A referência pode ter no máximo 120 caracteres.").optional().default(""),
  soComissao: z.string().optional().default(""),
});

type DadosSaida = {
  descricao: string;
  valor: number;
  pagoEm: string;
  fornecedorId: string | null;
  referencia: string | null;
  soComissao: boolean;
};

function lerSaida(formData: FormData) {
  const enviados = Object.fromEntries(formData) as Record<string, string>;
  const dados = esquemaSaida.safeParse(enviados);
  if (!dados.success) return { erro: dados.error.issues[0].message, enviados } as const;
  const valor = lerValorPessoa(dados.data.valor);
  if (valor === null || valor === "invalido" || valor <= 0) {
    return { erro: "Valor inválido. Use só números, como 1500 ou 1500,50.", enviados } as const;
  }
  const saida: DadosSaida = {
    descricao: dados.data.descricao,
    valor,
    pagoEm: dados.data.pagoEm,
    fornecedorId: dados.data.fornecedorId || null,
    referencia: dados.data.referencia || null,
    soComissao: dados.data.soComissao !== "",
  };
  return { saida, enviados } as const;
}

type Db = { query: (sql: string, params: unknown[]) => Promise<{ rows: { nome: string }[] }> };

// Nome do fornecedor, se for desta turma; null sem fornecedor; false se for de outra.
async function nomeDoFornecedor(db: Db, turmaId: string, fornecedorId: string | null): Promise<string | null | false> {
  if (!fornecedorId) return null;
  const { rows } = await db.query("select nome from fornecedores where id = $1 and turma_id = $2", [fornecedorId, turmaId]);
  return rows[0]?.nome ?? false;
}

export async function lancarSaida(_estado: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const tesouraria = await exigirTesourariaEditavel();
  const lido = lerSaida(formData);
  if ("erro" in lido) return { erro: lido.erro, valores: lido.enviados };
  const s = lido.saida;

  const resultado = await transacao(
    async (db) => {
      const fornecedor = await nomeDoFornecedor(db, tesouraria.turmaId, s.fornecedorId);
      if (fornecedor === false) return "fornecedor" as const;
      const { rows } = await db.query(
        `insert into saidas (turma_id, fornecedor_id, descricao, valor, pago_em, referencia, so_comissao, lancado_por)
         values ($1, $2, $3, $4, $5, $6, $7, $8) returning id`,
        [tesouraria.turmaId, s.fornecedorId, s.descricao, s.valor, s.pagoEm, s.referencia, s.soComissao, tesouraria.usuarioId],
      );
      await registrarAuditoria(db, {
        usuarioId: tesouraria.usuarioId,
        turmaId: tesouraria.turmaId,
        acao: "saida.lancada",
        entidade: "saida",
        entidadeId: rows[0].id,
        detalhe: detalheAuditoria({ ...s, fornecedor }),
      });
      return "ok" as const;
    },
    { acao: "saidas.lancar" },
  );
  if (resultado === "fornecedor") return { erro: "Fornecedor não encontrado.", valores: lido.enviados };
  revalidarCaixa();
  return { ok: "Saída registrada." };
}

export async function editarSaida(_estado: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const tesouraria = await exigirTesourariaEditavel();
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return { erro: "Saída não encontrada." };
  const lido = lerSaida(formData);
  if ("erro" in lido) return { erro: lido.erro };
  const s = lido.saida;

  const resultado = await transacao(
    async (db) => {
      const { rows: antes } = await db.query(
        `select s.descricao, s.valor::float8 as valor, to_char(s.pago_em, 'YYYY-MM-DD') as "pagoEm",
                s.so_comissao as "soComissao", f.nome as fornecedor
           from saidas s left join fornecedores f on f.id = s.fornecedor_id
          where s.id = $1 and s.turma_id = $2 for update of s`,
        [id.data, tesouraria.turmaId],
      );
      if (antes.length === 0) return "inexistente" as const;
      const fornecedor = await nomeDoFornecedor(db, tesouraria.turmaId, s.fornecedorId);
      if (fornecedor === false) return "fornecedor" as const;
      await db.query(
        `update saidas
            set fornecedor_id = $1, descricao = $2, valor = $3, pago_em = $4, referencia = $5,
                so_comissao = $6, updated_at = now()
          where id = $7`,
        [s.fornecedorId, s.descricao, s.valor, s.pagoEm, s.referencia, s.soComissao, id.data],
      );
      await registrarAuditoria(db, {
        usuarioId: tesouraria.usuarioId,
        turmaId: tesouraria.turmaId,
        acao: "saida.editada",
        entidade: "saida",
        entidadeId: id.data,
        detalhe: { antes: detalheAuditoria(antes[0]), depois: detalheAuditoria({ ...s, fornecedor }) },
      });
      return "ok" as const;
    },
    { acao: "saidas.editar" },
  );
  if (resultado === "inexistente") return { erro: "Saída não encontrada." };
  if (resultado === "fornecedor") return { erro: "Fornecedor não encontrado." };
  revalidarCaixa();
  return { ok: "Saída atualizada." };
}

export async function excluirSaida(formData: FormData) {
  const tesouraria = await exigirTesourariaEditavel();
  const dados = z.object({ id: z.uuid() }).safeParse(Object.fromEntries(formData));
  if (!dados.success) return;
  await transacao(
    async (db) => {
      const { rows } = await db.query(
        `with apagada as (
           delete from saidas where id = $1 and turma_id = $2
           returning descricao, valor::float8 as valor, to_char(pago_em, 'YYYY-MM-DD') as "pagoEm",
                     so_comissao as "soComissao", fornecedor_id
         )
         select a.descricao, a.valor, a."pagoEm", a."soComissao", f.nome as fornecedor
           from apagada a left join fornecedores f on f.id = a.fornecedor_id`,
        [dados.data.id, tesouraria.turmaId],
      );
      if (rows.length === 0) return;
      await registrarAuditoria(db, {
        usuarioId: tesouraria.usuarioId,
        turmaId: tesouraria.turmaId,
        acao: "saida.excluida",
        entidade: "saida",
        entidadeId: dados.data.id,
        detalhe: detalheAuditoria(rows[0]),
      });
    },
    { acao: "saidas.excluir" },
  );
  revalidarCaixa();
}
