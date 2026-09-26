import Link from "next/link";
import { ArrowLeft, BarChart3, CircleHelp, ClipboardList, Store } from "lucide-react";
import { AnimarPagina } from "@/components/animacao/animar-pagina";

const BENEFICIOS = [
  { icone: BarChart3, titulo: "Votações com resultado", texto: "A comissão vê o que a turma prefere, com números." },
  { icone: CircleHelp, titulo: "Dúvidas respondidas", texto: "Pergunte e vote nas dúvidas dos colegas." },
  { icone: ClipboardList, titulo: "Tarefas sob controle", texto: "Cada tarefa com responsável e prazo." },
  { icone: Store, titulo: "Fornecedores em um lugar", texto: "Sugira e compare quem vai atender a festa." },
];

// Moldura das páginas de acesso (entrar, definir senha): painel de marca no
// desktop e o conteúdo (formulário) ao lado. No celular só aparece o conteúdo.
export function LayoutAuth({
  voltar = { href: "/", rotulo: "Início" },
  children,
}: {
  voltar?: { href: string; rotulo: string };
  children: React.ReactNode;
}) {
  return (
    <main id="conteudo" tabIndex={-1} className="grid flex-1 outline-none lg:grid-cols-2">
      <aside className="vitrine-fundo-hero hidden border-r bg-muted/30 p-12 lg:flex lg:flex-col lg:justify-between">
        <AnimarPagina className="flex h-full flex-col justify-between gap-10">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Formandos <span aria-hidden>🎓</span>
          </Link>
          <div>
            <h2 className="max-w-md text-4xl font-semibold tracking-tight text-balance">
              A formatura da <span className="vitrine-texto-gradiente">sua turma</span>, do convite à festa.
            </h2>
            <ul data-grupo className="mt-10 grid max-w-md gap-5">
              {BENEFICIOS.map(({ icone: Icone, titulo, texto }) => (
                <li key={titulo} className="flex gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background">
                    <Icone className="size-4 text-[var(--vitrine-a)]" aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-medium">{titulo}</p>
                    <p className="text-sm text-muted-foreground">{texto}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-muted-foreground">Gestão de formaturas e eventos.</p>
        </AnimarPagina>
      </aside>

      <section className="flex flex-col p-6 md:p-10">
        <div className="flex items-center justify-between">
          <Link
            href={voltar.href}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden /> {voltar.rotulo}
          </Link>
          <span className="text-lg font-semibold tracking-tight lg:hidden">
            Formandos <span aria-hidden>🎓</span>
          </span>
        </div>
        <div className="flex flex-1 items-center justify-center py-8">
          <AnimarPagina className="w-full max-w-sm">{children}</AnimarPagina>
        </div>
      </section>
    </main>
  );
}
