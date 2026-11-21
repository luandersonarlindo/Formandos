import type { Metadata } from "next";
import { AbasTurma } from "@/components/features/abas-turma";
import { CabecalhoPagina } from "@/components/features/cabecalho-pagina";
import { FiltrosPilula } from "@/components/features/filtros-pilula";
import { HistoricoDecisoes } from "@/components/features/historico-decisoes";
import { Paginacao } from "@/components/features/paginacao";
import { ASSUNTOS_HISTORICO, listarHistoricoTurma, type AssuntoHistorico } from "@/lib/auditoria";
import { exigirAdmin } from "@/lib/dal";
import { lerPagina } from "@/lib/paginacao";

export const metadata: Metadata = { title: "Histórico da turma" };

const ROTULO: Record<AssuntoHistorico | "todos", string> = {
  todos: "Tudo",
  decisoes: "Decisões e votações",
  evento: "Evento",
  dinheiro: "Dinheiro",
  membros: "Membros e papéis",
  turma: "Turma",
};

// Histórico da comissão (ADR-0008): quem mudou o quê e quando. Pagamentos de
// cada pessoa só aparecem para a tesouraria (ADR-0005). É a aba "Histórico"
// da área Turma (P-12).
export default async function HistoricoTurmaPage({ searchParams }: PageProps<"/admin/turma/historico">) {
  const admin = await exigirAdmin();
  const params = await searchParams;
  const assunto = (Object.keys(ASSUNTOS_HISTORICO) as AssuntoHistorico[]).find((a) => a === params.assunto);
  const { itens, pagina, totalPaginas, total } = await listarHistoricoTurma(
    admin.turmaId,
    admin.tesouraria ? "tesouraria" : "comissao",
    { assunto, pagina: lerPagina(params.pagina) },
  );

  return (
    <div className="mx-auto w-full max-w-4xl 2xl:max-w-6xl">
      <CabecalhoPagina
        titulo="Histórico da turma"
        descricao={`Quem mudou o quê e quando. Nada aqui pode ser editado ou apagado.${
          admin.tesouraria ? "" : " Os pagamentos de cada pessoa ficam só com a tesouraria."
        }`}
      />
      <AbasTurma atual="historico" />

      <FiltrosPilula
        rotulo="Filtrar por assunto"
        className="mt-6"
        filtros={(["todos", ...Object.keys(ASSUNTOS_HISTORICO)] as (AssuntoHistorico | "todos")[]).map((a) => ({
          rotulo: ROTULO[a],
          href: a === "todos" ? "/admin/turma/historico" : `/admin/turma/historico?assunto=${a}`,
          ativo: (assunto ?? "todos") === a,
        }))}
      />

      <p className="mt-3 text-sm text-muted-foreground tabular-nums">
        {total} {total === 1 ? "registro" : "registros"}
      </p>
      <div className="mt-3">
        <HistoricoDecisoes itens={itens} />
      </div>
      <Paginacao
        pagina={pagina}
        totalPaginas={totalPaginas}
        caminho="/admin/turma/historico"
        parametros={{ assunto }}
      />
    </div>
  );
}
