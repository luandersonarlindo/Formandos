import "server-only";
import { headers } from "next/headers";
import type { PoolClient } from "pg";
import { transacao } from "./db";

// Limite de tentativas erradas de código de convite (ADR-0002), usado ao
// entrar na turma e ao mostrar o nome da turma na tela de convite (ADR-0020).
// As duas contam na mesma tabela, então ler o nome não abre outro caminho para
// adivinhar códigos.
export const MAX_TENTATIVAS = 10;
export const JANELA_MINUTOS = 15;
// Teto por endereço (todas as contas juntas): 50 erros/15min só bate em força
// bruta distribuída em várias contas. Usuário normal erra poucas vezes.
export const MAX_TENTATIVAS_POR_IP = 50;

// IP do cliente atrás de proxy (Vercel encadeia em x-forwarded-for, o real
// é o primeiro). Sem header, volta null e só vale o limite por usuário.
export async function ipDoCliente(): Promise<string | null> {
  const cabecalhos = await headers();
  const cadeia = cabecalhos.get("x-forwarded-for") ?? cabecalhos.get("x-real-ip") ?? "";
  const primeiro = cadeia.split(",")[0]?.trim();
  return primeiro ? primeiro.slice(0, 45) : null;
}

// Já passou do limite de erros na janela, por usuário ou por endereço?
export async function tentativasEsgotadas(
  db: PoolClient,
  usuarioId: string,
  ip: string | null,
): Promise<boolean> {
  const recentes = await db.query(
    `select count(*)::int as n from tentativas_convite
      where usuario_id = $1
        and created_at > now() - make_interval(mins => $2)`,
    [usuarioId, JANELA_MINUTOS],
  );
  if (recentes.rows[0].n >= MAX_TENTATIVAS) return true;
  if (ip) {
    const porIp = await db.query(
      `select count(*)::int as n from tentativas_convite
        where ip = $1
          and created_at > now() - make_interval(mins => $2)`,
      [ip, JANELA_MINUTOS],
    );
    if (porIp.rows[0].n >= MAX_TENTATIVAS_POR_IP) return true;
  }
  return false;
}

// Conta um código errado e aproveita para descartar tentativas antigas.
export async function registrarTentativaErrada(
  db: PoolClient,
  usuarioId: string,
  ip: string | null,
): Promise<void> {
  await db.query("insert into tentativas_convite (usuario_id, ip) values ($1, $2)", [usuarioId, ip]);
  await db.query(
    "delete from tentativas_convite where usuario_id = $1 and created_at < now() - interval '1 day'",
    [usuarioId],
  );
}

export type TurmaDoConvite = { turma: string; criador: string | null };

// Nome da turma e de quem a criou, para a tela de convite (ADR-0020). Só para
// código vindo do link ou do cookie de convite, nunca do campo digitado. Código
// errado conta no mesmo limite de `entrarPorConvite`; com o limite esgotado,
// não mostra nada. Turma arquivada também não aparece: o convite dela não entra.
export async function getTurmaDoConvite(codigo: string, usuarioId: string): Promise<TurmaDoConvite | null> {
  const ip = await ipDoCliente();
  return transacao(
    async (db) => {
      if (await tentativasEsgotadas(db, usuarioId, ip)) return null;
      const { rows } = await db.query(
        `select t.nome as turma, u.name as criador, t.arquivada_em
           from turmas t left join usuarios u on u.id = t.criado_por
          where t.codigo_convite = $1`,
        [codigo],
      );
      if (rows.length === 0) {
        await registrarTentativaErrada(db, usuarioId, ip);
        return null;
      }
      if (rows[0].arquivada_em) return null;
      return { turma: rows[0].turma as string, criador: (rows[0].criador as string | null) ?? null };
    },
    { acao: "convite.ler_turma" },
  );
}
