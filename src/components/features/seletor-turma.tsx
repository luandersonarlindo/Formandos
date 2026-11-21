"use client";

import Link from "next/link";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { trocarTurma } from "@/actions/turmas";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export type TurmaDoSeletor = { id: string; nome: string; arquivada: boolean };

// Troca de turma no topo da sidebar (e no cabeçalho do celular), sempre à
// vista. Antes era um bloco "Minhas turmas" que abria expandido no meio do
// menu e empurrava a navegação para baixo. Cada turma é um <form> com
// trocarTurma: o item do menu só envia o form.
export function SeletorTurma({
  ativa,
  lista,
  podeAdicionar,
  compacto = false,
}: {
  ativa: { id: string; nome: string };
  lista: TurmaDoSeletor[];
  podeAdicionar: boolean;
  /** Versão do cabeçalho do celular: só o nome, sem o ícone grande. */
  compacto?: boolean;
}) {
  // Sem tooltip na gaveta do celular: aberto pelo foco, ele vira uma camada a
  // mais, e o primeiro Esc fechava a dica em vez da gaveta.
  const { setOpenMobile, isMobile } = useSidebar();
  const trocavel = lista.length > 1 || podeAdicionar;

  const nome = (
    <>
      {!compacto && (
        <span
          aria-hidden
          className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background text-base"
        >
          🎓
        </span>
      )}
      <span className="grid min-w-0 flex-1 text-left leading-tight">
        {!compacto && <span className="text-xs text-muted-foreground">Turma</span>}
        <span className="truncate text-sm font-medium">{ativa.nome}</span>
      </span>
    </>
  );

  if (!trocavel) {
    return (
      <div className={cn("flex min-w-0 items-center gap-2", compacto ? "" : "px-2 py-1.5 group-data-[collapsible=icon]:px-0")}>
        {nome}
      </div>
    );
  }

  const gatilho = compacto ? (
    <button
      type="button"
      className="flex min-w-0 max-w-full items-center gap-1.5 rounded-md px-2 py-1 text-sm outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 pointer-coarse:min-h-11"
      aria-label={`Turma: ${ativa.nome}. Trocar de turma`}
    >
      {nome}
      <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
    </button>
  ) : (
    <SidebarMenuButton size="lg" tooltip={isMobile ? undefined : `Turma: ${ativa.nome}`} aria-label={`Turma: ${ativa.nome}. Trocar de turma`}>
      {nome}
      <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" aria-hidden />
    </SidebarMenuButton>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{gatilho}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-60">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Minhas turmas</DropdownMenuLabel>
        {lista.map((t) => {
          const atual = t.id === ativa.id;
          return (
            <form key={t.id} action={trocarTurma}>
              <input type="hidden" name="turmaId" value={t.id} />
              <DropdownMenuItem asChild onSelect={() => setOpenMobile(false)}>
                <button type="submit" className="w-full" aria-current={atual ? "true" : undefined}>
                  <span className="min-w-0 flex-1 truncate text-left">{t.nome}</span>
                  {t.arquivada && (
                    <span className="shrink-0 rounded-full border px-1.5 text-[10px] text-muted-foreground">arquivada</span>
                  )}
                  {atual && <Check className="size-4 shrink-0 text-primary" aria-hidden />}
                </button>
              </DropdownMenuItem>
            </form>
          );
        })}
        {podeAdicionar && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/convite" onClick={() => setOpenMobile(false)}>
                <Plus aria-hidden />
                Outra turma
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
