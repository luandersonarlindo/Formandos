import { contaComoFormandoSql } from "./papeis";
import "server-only";
import { pool } from "./db";
import { normalizar } from "./busca";
import { calcularPaginas, deslocamento, limitarPagina } from "./paginacao";
import {
  calcularSituacao,
  type Lancamento,
  type Parcela,
  type Situacao,
  type TipoLancamento,
} from "./situacao-regras";

// Leituras do dinheiro que entra (ADR-0005). Quanto cada pessoa pagou só sai
// daqui para a própria pessoa (getMinhaSituacao) ou para a tesouraria (as
// demais). As páginas chamam exigirMembro / exigirTesouraria antes.

export type FormaPagamento = "pix" | "dinheiro" | "transferencia" | "outro";
export type StatusLancamento = "informado" | "confirmado" | "recusado";

export const ROTULO_FORMA: Record<FormaPagamento, string> = {
  pix: "Pix",
  dinheiro: "Dinheiro",
  transferencia: "Transferência",
  outro: "Outro",
};

export const ROTULO_TIPO: Record<TipoLancamento, string> = {
  pagamento: "Pagamento",
  devolucao: "Devolução",
  ajuste: "Ajuste",
};

export type LancamentoDetalhe = {
  id: string;
  tipo: TipoLancamento;
  valor: number;
  pagoEm: string; // AAAA-MM-DD
  forma: FormaPagamento;
  pagoPor: string | null;
  referencia: string | null;
  status: StatusLancamento;
  motivoRecusa: string | null;
  lancadoPor: string | null;
  atualizadoEm: Date;
};

export async function getPlano(turmaId: string): Promise<Parcela[]> {
  const { rows } = await pool.query(
    `select numero, valor::float8 as valor, to_char(vencimento, 'YYYY-MM-DD') as vencimento
       from parcelas where turma_id = $1 order by vencimento, numero`,
    [turmaId],
  );
  return rows;
}

async function lancamentosDe(turmaId: string, usuarioId: string): Promise<LancamentoDetalhe[]> {
  const { rows } = await pool.query(
    `select p.id, p.tipo, p.valor::float8 as valor, to_char(p.pago_em, 'YYYY-MM-DD') as "pagoEm",
            p.forma, p.pago_por as "pagoPor", p.referencia, p.status,
            p.motivo_recusa as "motivoRecusa", u.name as "lancadoPor", p.updated_at as "atualizadoEm"
       from pagamentos p
       left join usuarios u on u.id = p.lancado_por
      where p.turma_id = $1 and p.usuario_id = $2
      order by p.pago_em desc, p.created_at desc`,
    [turmaId, usuarioId],
  );
  return rows;
}

const confirmados = (lista: LancamentoDetalhe[]): Lancamento[] =>
  lista.filter((l) => l.status === "confirmado").map((l) => ({ tipo: l.tipo, valor: l.valor }));

export type MinhaSituacao = {
  situacao: Situacao;
  lancamentos: LancamentoDetalhe[];
  // Última vez que a tesouraria mexeu em qualquer lançamento da turma: diz à
  // pessoa que o site está sendo atualizado, mesmo que não seja o dela.
  ultimaAtualizacao: Date | null;
  tesouraria: string[];
};

export async function getMinhaSituacao(
  turmaId: string,
  usuarioId: string,
  hoje: string,
): Promise<MinhaSituacao> {
  const [plano, lancamentos, extra] = await Promise.all([
    getPlano(turmaId),
    lancamentosDe(turmaId, usuarioId),
    pool.query(
      `select
         (select max(updated_at) from pagamentos where turma_id = $1 and status <> 'informado') as ultima,
         (select coalesce(array_agg(u.name order by u.name), '{}')
            from membros m join usuarios u on u.id = m.usuario_id
           where m.turma_id = $1 and m.tesouraria and m.papel = 'admin') as tesouraria`,
      [turmaId],
    ),
  ]);
  return {
    situacao: calcularSituacao(plano, confirmados(lancamentos), hoje),
    lancamentos,
    ultimaAtualizacao: extra.rows[0].ultima,
    tesouraria: extra.rows[0].tesouraria,
  };
}

// ---- Tesouraria ------------------------------------------------------------

export type FiltroTesouraria = "todos" | "atrasado" | "em_dia" | "quitado" | "aguardando";

export type LinhaTesouraria = {
  usuarioId: string;
  nome: string;
  email: string;
  imagem: string | null;
  situacao: Situacao;
  aguardando: number; // lançamentos "informado"
};

export const POR_PAGINA_TESOURARIA = 20;

// Todos os membros com a situação calculada. Cabe em memória: a turma tem
// dezenas ou poucas centenas de pessoas, e a situação depende do plano inteiro.
export async function listarSituacoes(
  turmaId: string,
  hoje: string,
  opcoes: { filtro: FiltroTesouraria; busca: string; pagina: number },
) {
  const [plano, membros, lancamentos] = await Promise.all([
    getPlano(turmaId),
    pool.query(
      `select u.id, u.name as nome, u.email, u.image as imagem
         from membros m join usuarios u on u.id = m.usuario_id
        where m.turma_id = $1 and ${contaComoFormandoSql("m")} order by u.name`,
      [turmaId],
    ),
    pool.query(
      `select usuario_id, tipo, valor::float8 as valor, status
         from pagamentos where turma_id = $1 and usuario_id is not null`,
      [turmaId],
    ),
  ]);

  const porPessoa = new Map<string, { tipo: TipoLancamento; valor: number; status: string }[]>();
  for (const l of lancamentos.rows) {
    const lista = porPessoa.get(l.usuario_id) ?? [];
    lista.push(l);
    porPessoa.set(l.usuario_id, lista);
  }

  const todas: LinhaTesouraria[] = membros.rows.map((m) => {
    const dela = porPessoa.get(m.id) ?? [];
    return {
      usuarioId: m.id,
      nome: m.nome,
      email: m.email,
      imagem: m.imagem,
      situacao: calcularSituacao(
        plano,
        dela.filter((l) => l.status === "confirmado"),
        hoje,
      ),
      aguardando: dela.filter((l) => l.status === "informado").length,
    };
  });

  const contagem: Record<FiltroTesouraria, number> = {
    todos: todas.length,
    atrasado: todas.filter((l) => l.situacao.estado === "atrasado").length,
    em_dia: todas.filter((l) => l.situacao.estado === "em_dia" || l.situacao.estado === "adiantado").length,
    quitado: todas.filter((l) => l.situacao.estado === "quitado").length,
    aguardando: todas.filter((l) => l.aguardando > 0).length,
  };

  const termo = normalizar(opcoes.busca);
  const filtradas = todas.filter((l) => {
    if (termo && !normalizar(`${l.nome} ${l.email}`).includes(termo)) return false;
    switch (opcoes.filtro) {
      case "atrasado":
        return l.situacao.estado === "atrasado";
      case "em_dia":
        return l.situacao.estado === "em_dia" || l.situacao.estado === "adiantado";
      case "quitado":
        return l.situacao.estado === "quitado";
      case "aguardando":
        return l.aguardando > 0;
      default:
        return true;
    }
  });

  const totalPaginas = calcularPaginas(filtradas.length, POR_PAGINA_TESOURARIA);
  const pagina = limitarPagina(opcoes.pagina, totalPaginas);
  const inicio = deslocamento(pagina, POR_PAGINA_TESOURARIA);
  return {
    plano,
    contagem,
    itens: filtradas.slice(inicio, inicio + POR_PAGINA_TESOURARIA),
    pagina,
    totalPaginas,
  };
}

// Uma pessoa, para a tesouraria: dados, situação e todos os lançamentos.
export async function getPessoaTesouraria(turmaId: string, usuarioId: string, hoje: string) {
  const { rows } = await pool.query(
    `select u.id, u.name as nome, u.email, u.image as imagem
       from membros m join usuarios u on u.id = m.usuario_id
      where m.turma_id = $1 and m.usuario_id = $2 and ${contaComoFormandoSql("m")}`,
    [turmaId, usuarioId],
  );
  if (rows.length === 0) return null;
  const [plano, lancamentos] = await Promise.all([
    getPlano(turmaId),
    lancamentosDe(turmaId, usuarioId),
  ]);
  return {
    pessoa: rows[0] as { id: string; nome: string; email: string; imagem: string | null },
    situacao: calcularSituacao(plano, confirmados(lancamentos), hoje),
    lancamentos,
  };
}

// Admins da turma, com a marcação de tesouraria (para /admin/membros).
export async function listarTesouraria(turmaId: string): Promise<string[]> {
  const { rows } = await pool.query(
    "select usuario_id from membros where turma_id = $1 and papel = 'admin' and tesouraria",
    [turmaId],
  );
  return rows.map((r) => r.usuario_id);
}

// Informes "Já paguei" esperando a tesouraria conferir, do mais antigo para o
// mais novo (ADR-0005, parte 2).
export type Informe = LancamentoDetalhe & { usuarioId: string; nome: string };

export async function listarInformados(turmaId: string): Promise<Informe[]> {
  const { rows } = await pool.query(
    `select p.id, p.usuario_id as "usuarioId", u.name as nome, p.tipo, p.valor::float8 as valor,
            to_char(p.pago_em, 'YYYY-MM-DD') as "pagoEm", p.forma, p.pago_por as "pagoPor",
            p.referencia, p.status, p.motivo_recusa as "motivoRecusa", u.name as "lancadoPor",
            p.updated_at as "atualizadoEm"
       from pagamentos p
       join usuarios u on u.id = p.usuario_id
      where p.turma_id = $1 and p.status = 'informado'
      order by p.created_at`,
    [turmaId],
  );
  return rows;
}

// Caixa da turma (ADR-0005, parte 3): só totais, para todos os membros. Entra
// tudo o que foi confirmado, inclusive de quem já saiu (usuario_id nulo).
// Nunca nomes nem quantas pessoas estão em atraso: numa turma pequena, a
// contagem identifica quem deve.
export async function getCaixa(turmaId: string) {
  const { rows } = await pool.query(
    `select
       coalesce((select sum(case when tipo = 'devolucao' then -valor else valor end)
                   from pagamentos where turma_id = $1 and status = 'confirmado'), 0)::float8 as arrecadado,
       coalesce((select sum(valor) from parcelas where turma_id = $1), 0)::float8 as "planoPorPessoa",
       (select count(*) from membros where turma_id = $1 and ${contaComoFormandoSql()})::int as membros,
       (select regras_dinheiro from turmas where id = $1) as "regrasDinheiro"`,
    [turmaId],
  );
  const r = rows[0];
  return {
    arrecadado: r.arrecadado as number,
    previsto: Math.round(r.planoPorPessoa * r.membros * 100) / 100,
    membros: r.membros as number,
    regrasDinheiro: (r.regrasDinheiro as string | null) ?? "",
  };
}
