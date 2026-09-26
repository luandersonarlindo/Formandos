import Link from "next/link";
import { trocarTurma } from "@/actions/turmas";
import { Plus, type LucideIcon } from "lucide-react";
import { AnimarPagina } from "@/components/animacao/animar-pagina";
import { AvatarUsuario } from "./avatar-usuario";
import { BotaoSair } from "./botao-sair";
import { NavLink } from "./nav-link";

export type ItemMenu = {
  href: string;
  rotulo: string;
  icone: LucideIcon;
  exato?: boolean;
};

type Rodape = { href: string; rotulo: string };

export type SeletorTurmas = {
  ativaId: string;
  lista: { id: string; nome: string; papel: "admin" | "participante" }[];
  podeAdicionar: boolean;
};

type AppShellProps = {
  titulo: string;
  turmas?: SeletorTurmas;
  itens: ItemMenu[];
  rodape?: Rodape | Rodape[];
  usuario: { nome: string; email: string; imagem?: string | null };
  children: React.ReactNode;
};

// Barra lateral no desktop, barra de rolagem horizontal no celular.
export function AppShell({
  titulo,
  turmas,
  itens,
  rodape,
  usuario,
  children,
}: AppShellProps) {
  const rodapes = rodape ? [rodape].flat() : [];
  return (
    <div className="flex min-h-full flex-1 flex-col lg:flex-row">
      <aside className="flex flex-col border-b bg-muted/30 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between gap-3 px-4 py-3 lg:block lg:px-5 lg:pt-6 lg:pb-4">
          <Link href="/dashboard" className="shrink-0 text-lg font-semibold tracking-tight whitespace-nowrap">
            Formandos <span aria-hidden>🎓</span>
          </Link>
          <span className="min-w-0 flex-1 truncate text-right text-xs font-medium text-muted-foreground lg:mt-1 lg:block lg:text-left">
            {titulo}
          </span>
          <div className="lg:hidden">
            <BotaoSair />
          </div>
        </div>
        {turmas && (turmas.lista.length > 1 || turmas.podeAdicionar) && (
          <div className="px-3 pb-3 lg:pb-4">
            <p id="rotulo-turmas" className="px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Minhas turmas
            </p>
            <ul aria-labelledby="rotulo-turmas" className="mt-1.5 flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {turmas.lista.map((t) => {
                const ativa = t.id === turmas.ativaId;
                return (
                  <li key={t.id}>
                    <form action={trocarTurma}>
                      <input type="hidden" name="turmaId" value={t.id} />
                      <button
                        type="submit"
                        aria-current={ativa ? "true" : undefined}
                        className={
                          ativa
                            ? "flex w-full items-center gap-2 rounded-lg border bg-background px-2.5 py-1.5 text-left text-sm font-medium whitespace-nowrap shadow-sm"
                            : "flex w-full items-center gap-2 rounded-lg border border-transparent px-2.5 py-1.5 text-left text-sm whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        }
                      >
                        <span
                          aria-hidden
                          className={
                            ativa
                              ? "size-2 shrink-0 rounded-full bg-[var(--vitrine-a)]"
                              : "size-2 shrink-0 rounded-full bg-border"
                          }
                        />
                        <span className="min-w-0 flex-1 truncate">{t.nome}</span>
                      </button>
                    </form>
                  </li>
                );
              })}
              {turmas.podeAdicionar && (
                <li>
                  <Link
                    href="/convite"
                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Plus className="size-4 shrink-0" aria-hidden />
                    Outra turma
                  </Link>
                </li>
              )}
            </ul>
          </div>
        )}
        <nav
          aria-label={titulo}
          className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {itens.map(({ href, rotulo, icone: Icone, exato }) => (
            <NavLink key={href} href={href} exato={exato}>
              <Icone className="size-4" aria-hidden />
              {rotulo}
            </NavLink>
          ))}
          {rodapes.length > 0 && (
            <div className="flex gap-1 lg:mt-4 lg:flex-col lg:border-t lg:pt-4">
              {rodapes.map((r) => (
                <NavLink key={r.href} href={r.href} exato>
                  {r.rotulo}
                </NavLink>
              ))}
            </div>
          )}
        </nav>
        <div className="mt-auto hidden items-center gap-3 border-t px-4 py-3 lg:flex">
          <AvatarUsuario nome={usuario.nome} imagem={usuario.imagem} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{usuario.nome}</p>
            <p className="truncate text-xs text-muted-foreground">
              {usuario.email}
            </p>
          </div>
          <BotaoSair />
        </div>
      </aside>
      <main id="conteudo" tabIndex={-1} className="min-w-0 flex-1 p-4 outline-none sm:p-6 lg:p-8 2xl:p-12">
        <AnimarPagina>{children}</AnimarPagina>
      </main>
    </div>
  );
}
