import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, History } from "lucide-react";
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
// cada pessoa só aparecem para a tesouraria (ADR-0005).
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
    <div className="mx-auto w-full max-w-3xl">
      <Link
        href="/admin/turma"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden /> Turma
      </Link>
      <h1 className="mt-3 flex items-center gap-2 text-2xl font-semibold tracking-tight md:text-3xl">
        <History className="size-6 text-[var(--vitrine-a)]" aria-hidden /> Histórico da turma
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground text-pretty">
        Quem mudou o quê e quando. Nada aqui pode ser editado ou apagado.
        {admin.tesouraria ? "" : " Os pagamentos de cada pessoa ficam só com a tesouraria."}
      </p>

      <nav
        aria-label="Filtrar por assunto"
        className="mt-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {(["todos", ...Object.keys(ASSUNTOS_HISTORICO)] as (AssuntoHistorico | "todos")[]).map((a) => {
          const ativo = (assunto ?? "todos") === a;
          return (
            <Link
              key={a}
              href={a === "todos" ? "/admin/turma/historico" : `/admin/turma/historico?assunto=${a}`}
              aria-current={ativo ? "true" : undefined}
              className={
                ativo
                  ? "inline-flex shrink-0 items-center rounded-full border border-[var(--vitrine-a)]/40 bg-[color-mix(in_oklch,var(--vitrine-a)_10%,transparent)] px-3 py-1 text-sm font-medium"
                  : "inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              }
            >
              {ROTULO[a]}
            </Link>
          );
        })}
      </nav>

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
