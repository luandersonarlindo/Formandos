import Link from "next/link";
import { trocarTurma } from "@/actions/turmas";
import { Plus, type LucideIcon } from "lucide-react";
import { AnimarPagina } from "@/components/animacao/animar-pagina";
import { AvatarUsuario } from "./avatar-usuario";
import { BotaoSair } from "./botao-sair";
import { ConteudoTurma } from "./conteudo-turma";
import { MenuMobile } from "./menu-mobile";
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
  lista: { id: string; nome: string; papel: "admin" | "participante"; arquivada: boolean }[];
  podeAdicionar: boolean;
};

type AppShellProps = {
  titulo: string;
  turmas?: SeletorTurmas;
  itens: ItemMenu[];
  // Data em que a turma foi arquivada (ISO), ou null. Deixa o conteúdo só leitura.
  arquivadaEm?: string | null;
  rodape?: Rodape | Rodape[];
  usuario: { nome: string; email: string; imagem?: string | null };
  children: React.ReactNode;
};

// Barra lateral fixa no desktop (a partir de `lg`); abaixo disso, um cabeçalho
// com botão de menu abre a mesma lista numa gaveta deslizante (MenuMobile).
export function AppShell({
  titulo,
  turmas,
  itens,
  arquivadaEm = null,
  rodape,
  usuario,
  children,
}: AppShellProps) {
  const rodapes = rodape ? [rodape].flat() : [];
  const mostrarTurmas = !!turmas && (turmas.lista.length > 1 || turmas.podeAdicionar);

  // Turmas, navegação, rodapé e o usuário: o mesmo conteúdo aparece na barra
  // fixa do desktop e dentro da gaveta do celular.
  const conteudoMenu = (
    <>
      {mostrarTurmas && turmas && (
        <div className="px-3 pb-3 lg:pb-4">
          <p aria-hidden className="px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Minhas turmas
          </p>
          <ul aria-label="Minhas turmas" className="mt-1.5 flex flex-col gap-1">
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
                      {t.arquivada && (
                        <span className="shrink-0 rounded-full border px-1.5 text-[10px] font-normal text-muted-foreground">
                          arquivada
                        </span>
                      )}
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
      <nav aria-label={titulo} className="flex flex-col gap-1 px-3 pb-3 lg:pb-0">
        {itens.map(({ href, rotulo, icone: Icone, exato }) => (
          <NavLink key={href} href={href} exato={exato}>
            <Icone className="size-4" aria-hidden />
            {rotulo}
          </NavLink>
        ))}
        {rodapes.length > 0 && (
          <div className="flex flex-col gap-1 border-t pt-4 lg:mt-4">
            {rodapes.map((r) => (
              <NavLink key={r.href} href={r.href} exato>
                {r.rotulo}
              </NavLink>
            ))}
          </div>
        )}
      </nav>
      <div className="mt-auto flex items-center gap-3 border-t px-4 py-3">
        <AvatarUsuario nome={usuario.nome} imagem={usuario.imagem} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{usuario.nome}</p>
          <p className="truncate text-xs text-muted-foreground">{usuario.email}</p>
        </div>
        <BotaoSair />
      </div>
    </>
  );

  return (
    <div className="flex min-h-full flex-1 flex-col lg:flex-row">
      <MenuMobile titulo={titulo}>{conteudoMenu}</MenuMobile>

      <aside className="hidden bg-muted/30 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:border-r">
        <div className="px-5 pt-6 pb-4">
          <Link href="/dashboard" className="text-lg font-semibold tracking-tight whitespace-nowrap">
            Formandos <span aria-hidden>🎓</span>
          </Link>
          <span className="mt-1 block truncate text-xs font-medium text-muted-foreground">{titulo}</span>
        </div>
        {conteudoMenu}
      </aside>

      <main id="conteudo" tabIndex={-1} className="min-w-0 flex-1 p-4 outline-none sm:p-6 lg:p-8 2xl:p-12">
        <ConteudoTurma arquivadaEm={arquivadaEm}>
          <AnimarPagina>{children}</AnimarPagina>
        </ConteudoTurma>
      </main>
    </div>
  );
}
