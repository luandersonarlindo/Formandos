import type { Metadata } from "next";
import { AbasEvento } from "@/components/features/abas-evento";
import { CabecalhoPagina } from "@/components/features/cabecalho-pagina";
import { EventoAdmin } from "@/components/features/evento-admin";
import { exigirAdmin } from "@/lib/dal";
import { getDadosEvento, listarProgramacao } from "@/lib/dashboard";
import { getUltimaMudancaEvento } from "@/lib/evento-publico";

export const metadata: Metadata = { title: "Evento e presença" };

// Gestão do evento pela comissão (D-08 do plano de UX). Antes morava no meio do
// dashboard, com ~340 linhas de formulário entre o que a turma precisa ver; o
// dashboard agora mostra só o resumo, com o link "Editar" para cá.
export default async function EventoAdminPage() {
  const membro = await exigirAdmin();
  const [programacao, { evento }, mudanca] = await Promise.all([
    listarProgramacao(membro),
    getDadosEvento(membro),
    getUltimaMudancaEvento(membro.turmaId),
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl 2xl:max-w-6xl">
      <CabecalhoPagina
        titulo="Evento e presença"
        descricao="Data, local, programação e o link público do evento. A turma vê tudo isso no Início."
      />
      <AbasEvento atual="evento" />
      {evento ? <EventoAdmin evento={evento} programacao={programacao} mudanca={mudanca?.mudancas} /> : null}
    </div>
  );
}
