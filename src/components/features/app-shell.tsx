import Link from "next/link";
import { trocarTurma } from "@/actions/turmas";
import type { LucideIcon } from "lucide-react";
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
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      <aside className="flex flex-col border-b md:w-60 md:shrink-0 md:border-r md:border-b-0">
        <div className="flex items-center justify-between px-4 py-3 md:py-5">
          <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
            Formandos 🎓
          </Link>
          <span className="text-xs font-medium text-muted-foreground md:hidden">
            {titulo}
          </span>
        </div>
        {turmas && (turmas.lista.length > 1 || turmas.podeAdicionar) && (
          <div className="px-3 pb-3 md:pb-4">
            <p id="rotulo-turmas" className="px-2 text-xs font-medium text-muted-foreground">
              Minhas turmas
            </p>
            <ul aria-labelledby="rotulo-turmas" className="mt-1 flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
              {turmas.lista.map((t) => (
                <li key={t.id}>
                  <form action={trocarTurma}>
                    <input type="hidden" name="turmaId" value={t.id} />
                    <button
                      type="submit"
                      aria-current={t.id === turmas.ativaId ? "true" : undefined}
                      className={
                        t.id === turmas.ativaId
                          ? "w-full rounded-md bg-muted px-2 py-1.5 text-left text-sm font-medium whitespace-nowrap"
                          : "w-full rounded-md px-2 py-1.5 text-left text-sm whitespace-nowrap text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }
                    >
                      {t.nome}
                    </button>
                  </form>
                </li>
              ))}
              {turmas.podeAdicionar && (
                <li>
                  <Link
                    href="/convite"
                    className="block rounded-md px-2 py-1.5 text-sm whitespace-nowrap text-muted-foreground underline underline-offset-4 hover:text-foreground"
                  >
                    + Entrar em outra turma ou criar
                  </Link>
                </li>
              )}
            </ul>
          </div>
        )}
        <nav
          aria-label={titulo}
          className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible md:pb-0"
        >
          {itens.map(({ href, rotulo, icone: Icone, exato }) => (
            <NavLink key={href} href={href} exato={exato}>
              <Icone className="size-4" aria-hidden />
              {rotulo}
            </NavLink>
          ))}
          {rodapes.length > 0 && (
            <div className="flex md:mt-4 md:flex-col md:border-t md:pt-4">
              {rodapes.map((r) => (
                <NavLink key={r.href} href={r.href} exato>
                  {r.rotulo}
                </NavLink>
              ))}
            </div>
          )}
        </nav>
        <div className="flex items-center gap-3 border-t px-4 py-3 md:mt-auto">
          {usuario.imagem && (
            <img
              src={usuario.imagem}
              alt=""
              referrerPolicy="no-referrer"
              className="size-8 rounded-full"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{usuario.nome}</p>
            <p className="truncate text-xs text-muted-foreground">
              {usuario.email}
            </p>
          </div>
          <BotaoSair />
        </div>
      </aside>
      <main id="conteudo" tabIndex={-1} className="flex-1 p-4 outline-none md:p-8">{children}</main>
    </div>
  );
}
