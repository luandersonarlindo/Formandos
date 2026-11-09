"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import { linkConvite } from "@/lib/convite-link";
import { lerListaConvites } from "@/lib/convite-lista";
import { exigirAdminEditavel } from "@/lib/dal";
import { pool, transacao } from "@/lib/db";
import { emailConviteTurma, urlDoSite } from "@/lib/email";
import { enviarParaTurma } from "@/lib/email-turma";
import { consumirLimite } from "@/lib/throttle";
import type { EstadoForm } from "./tipos";

// Convidar por lista (ADR-0007). A comissão cola emails; cada um recebe o link
// de convite com o código (ADR-0002). Ninguém ganha conta nem entra na turma
// sem clicar. Os envios contam no teto diário de email (ADR-0006).

function revalidarMembros() {
  revalidatePath("/admin/membros");
}

async function separar(turmaId: string, texto: string) {
  const lista = lerListaConvites(texto);
  const emails = lista.validos.map((v) => v.email);
  const [membros, convidados] = await Promise.all([
    pool.query(
      `select lower(u.email) as email from membros m join usuarios u on u.id = m.usuario_id
        where m.turma_id = $1 and lower(u.email) = any($2::text[])`,
      [turmaId, emails],
    ),
    pool.query("select email from convites_email where turma_id = $1 and email = any($2::text[])", [
      turmaId,
      emails,
    ]),
  ]);
  const jaMembros = new Set(membros.rows.map((r) => r.email));
  const jaConvidados = new Set(convidados.rows.map((r) => r.email));
  return {
    lista,
    novos: lista.validos.filter((v) => !jaMembros.has(v.email) && !jaConvidados.has(v.email)),
    jaMembros: jaMembros.size,
    jaConvidados: [...jaConvidados].filter((e) => !jaMembros.has(e)).length,
  };
}

const esquema = z.object({
  lista: z.string().max(40000, "A lista está grande demais. Cole até 200 pessoas por vez."),
  etapa: z.enum(["previa", "enviar"]).default("previa"),
});

// Um formulário, dois botões: "Ver prévia" conta e mostra os problemas;
// "Enviar convites" grava e manda os emails.
export async function convidarPorLista(_estado: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const admin = await exigirAdminEditavel();
  const dados = esquema.safeParse(Object.fromEntries(formData));
  if (!dados.success) return { erro: dados.error.issues[0].message };
  const { lista: texto, etapa } = dados.data;
  const valores = { lista: texto };
  const s = await separar(admin.turmaId, texto);

  const partes = [
    `${s.novos.length} ${s.novos.length === 1 ? "convite novo" : "convites novos"}`,
    s.jaMembros > 0 && `${s.jaMembros} já ${s.jaMembros === 1 ? "é membro" : "são membros"}`,
    s.jaConvidados > 0 && `${s.jaConvidados} já ${s.jaConvidados === 1 ? "foi convidado" : "foram convidados"}`,
    s.lista.repetidos > 0 && `${s.lista.repetidos} ${s.lista.repetidos === 1 ? "repetido" : "repetidos"}`,
    s.lista.invalidas.length > 0 &&
      `${s.lista.invalidas.length} sem email válido (${s.lista.invalidas.slice(0, 3).join(" | ")}${s.lista.invalidas.length > 3 ? "…" : ""})`,
    s.lista.excedeu && "passou de 200: o resto ficou de fora",
  ].filter(Boolean);
  const resumo = `${partes.join(", ")}.`;

  if (etapa === "previa" || s.novos.length === 0) {
    return s.novos.length === 0
      ? { erro: `Nada para enviar: ${resumo}`, valores }
      : { ok: `Prévia: ${resumo} Confira e toque em “Enviar convites”.`, valores };
  }

  const gravados = await transacao(async (db) => {
    const livre = await consumirLimite(db, `convite-lista:${admin.turmaId}`, 10, 60);
    if (!livre) return null;
    for (const c of s.novos) {
      await db.query(
        `insert into convites_email (turma_id, email, nome, enviado_por) values ($1, $2, $3, $4)
         on conflict (turma_id, email) do nothing`,
        [admin.turmaId, c.email, c.nome, admin.usuarioId],
      );
    }
    const { rows } = await db.query("select codigo_convite, nome from turmas where id = $1", [admin.turmaId]);
    const { rows: eu } = await db.query("select name from usuarios where id = $1", [admin.usuarioId]);
    return { codigo: rows[0].codigo_convite as string, turma: rows[0].nome as string, por: eu[0].name as string };
  });
  if (!gravados) return { erro: "Muitas listas em pouco tempo. Tente de novo daqui a uma hora.", valores };

  const link = linkConvite(urlDoSite(""), gravados.codigo);
  const destinatarios = s.novos.map((c) => ({ usuarioId: "", nome: c.nome ?? "", email: c.email }));
  after(async () => {
    await enviarParaTurma(destinatarios, (d) =>
      emailConviteTurma({ nome: d.nome || null, turma: gravados.turma, convidadoPor: gravados.por, link }),
    );
  });
  revalidarMembros();
  return { ok: `Convites enviados: ${resumo}` };
}

const esquemaEmail = z.object({ email: z.string().email().max(255) });

// Reenviar no máximo uma vez por dia por email.
export async function reenviarConvite(formData: FormData) {
  const admin = await exigirAdminEditavel();
  const dados = esquemaEmail.safeParse(Object.fromEntries(formData));
  if (!dados.success) return;
  const { rows } = await pool.query(
    `update convites_email set enviado_em = now(), enviado_por = $3
      where turma_id = $1 and email = $2 and enviado_em < now() - interval '1 day'
      returning nome, (select codigo_convite from turmas where id = $1) as codigo,
                (select nome from turmas where id = $1) as turma,
                (select name from usuarios where id = $3) as por`,
    [admin.turmaId, dados.data.email.toLowerCase(), admin.usuarioId],
  );
  if (rows.length === 0) return;
  const r = rows[0];
  const link = linkConvite(urlDoSite(""), r.codigo);
  after(async () => {
    await enviarParaTurma([{ usuarioId: "", nome: r.nome ?? "", email: dados.data.email.toLowerCase() }], (d) =>
      emailConviteTurma({ nome: d.nome || null, turma: r.turma, convidadoPor: r.por, link }),
    );
  });
  revalidarMembros();
}

export async function removerConvite(formData: FormData) {
  const admin = await exigirAdminEditavel();
  const dados = esquemaEmail.safeParse(Object.fromEntries(formData));
  if (!dados.success) return;
  await pool.query("delete from convites_email where turma_id = $1 and email = $2", [
    admin.turmaId,
    dados.data.email.toLowerCase(),
  ]);
  revalidarMembros();
}
