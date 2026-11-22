import type { Metadata } from "next";
import { AbasVotacoes } from "@/components/features/abas-votacoes";
import { CabecalhoPagina } from "@/components/features/cabecalho-pagina";
import { DecisoesTurma } from "@/components/features/decisoes-turma";
import { EstadoVazio } from "@/components/features/estado-vazio";
import { listarHistoricoDecisoes } from "@/lib/auditoria";
import { exigirMembro } from "@/lib/dal";
import { listarDecisoes } from "@/lib/dashboard";

export const metadata: Metadata = { title: "Decisões da turma" };

// O que a comissão já fixou depois das votações. Antes ficava no Início; agora
// é uma aba de Votações, ao lado de Votar e Resultados.
export default async function DecisoesPage() {
  const membro = await exigirMembro();
  const [decisoes, historico] = await Promise.all([listarDecisoes(membro), listarHistoricoDecisoes(membro.turmaId)]);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <CabecalhoPagina titulo="Votações" descricao="Decisões da turma: o que a comissão já fixou depois das votações." />
      <AbasVotacoes atual="decisoes" className="mt-4" />
      <div className="mt-6">
        {decisoes.length === 0 && historico.length === 0 ? (
          <EstadoVazio
            titulo="Nenhuma decisão ainda"
            descricao="Quando a comissão fixar a escolha de uma pergunta, ela aparece aqui."
          />
        ) : (
          <section aria-labelledby="decisoes">
            <h2 id="decisoes" className="sr-only">
              Decisões da turma
            </h2>
            <DecisoesTurma decisoes={decisoes} historico={historico} />
          </section>
        )}
      </div>
    </div>
  );
}
