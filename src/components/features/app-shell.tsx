import { cookies } from "next/headers";
import Link from "next/link";
import { ChevronDown, Plus, type LucideIcon } from "lucide-react";
import { AnimarPagina } from "@/components/animacao/animar-pagina";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { trocarTurma } from "@/actions/turmas";
import { AvatarUsuario } from "./avatar-usuario";
import { BotaoSair } from "./botao-sair";
import { ConteudoTurma } from "./conteudo-turma";
import { SidebarAutoClose } from "./sidebar-auto-close";
import { SidebarNavLink } from "./sidebar-nav-link";

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

// Sidebar do shadcn (ui.shadcn.com/docs/components/base/sidebar): fica sempre
// aberta em computador, tablet e TV (a partir de 768px, breakpoint `md` do
// componente); abaixo disso vira uma gaveta (Sheet), aberta pelo mesmo botão.
// Fica lembrada em cookie (`sidebar_state`), sem toggle é sempre aberta.
export async function AppShell({
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
  // Sem cookie ainda (primeira visita), começa aberta; só fica fechada se a
  // pessoa mesma recolheu da última vez.
  const estadoSalvo = (await cookies()).get("sidebar_state")?.value;
  const defaultOpen = estadoSalvo !== "false";

  return (
    <TooltipProvider delayDuration={300}>
      <SidebarProvider defaultOpen={defaultOpen}>
        <SidebarAutoClose />
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 overflow-hidden px-2 py-1.5 text-lg font-semibold tracking-tight whitespace-nowrap group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
            >
              <span className="group-data-[collapsible=icon]:hidden">Formandos</span>
              <span aria-hidden>🎓</span>
            </Link>
            <span className="truncate px-2 text-xs font-medium text-muted-foreground group-data-[collapsible=icon]:hidden">
              {titulo}
            </span>
          </SidebarHeader>

          <SidebarContent>
            {mostrarTurmas && turmas && (
              <SidebarGroup>
                <Collapsible defaultOpen className="group/turmas">
                  <SidebarGroupLabel asChild>
                    <CollapsibleTrigger className="flex w-full items-center justify-between">
                      Minhas turmas
                      <ChevronDown className="size-4 shrink-0 transition-transform group-data-[state=closed]/turmas:-rotate-90" aria-hidden />
                    </CollapsibleTrigger>
                  </SidebarGroupLabel>
                  <CollapsibleContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuSub>
                        {turmas.lista.map((t) => {
                          const ativa = t.id === turmas.ativaId;
                          return (
                            <SidebarMenuSubItem key={t.id}>
                              <form action={trocarTurma}>
                                <input type="hidden" name="turmaId" value={t.id} />
                                <SidebarMenuSubButton asChild isActive={ativa}>
                                  <button type="submit" className="w-full">
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
                                </SidebarMenuSubButton>
                              </form>
                            </SidebarMenuSubItem>
                          );
                        })}
                        {turmas.podeAdicionar && (
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild>
                              <Link href="/convite">
                                <Plus aria-hidden />
                                <span>Outra turma</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )}
                      </SidebarMenuSub>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </CollapsibleContent>
                </Collapsible>
              </SidebarGroup>
            )}

            <SidebarGroup>
              <SidebarMenu>
                {itens.map(({ href, rotulo, icone: Icone, exato }) => (
                  <SidebarMenuItem key={href}>
                    <SidebarNavLink href={href} exato={exato} tooltip={rotulo}>
                      <Icone aria-hidden />
                      <span>{rotulo}</span>
                    </SidebarNavLink>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>

            {/* Sem ícone próprio: some inteiro no modo só ícones, não dá pra mostrar nada útil. */}
            {rodapes.length > 0 && (
              <SidebarGroup className="mt-auto group-data-[collapsible=icon]:hidden">
                <SidebarMenu>
                  {rodapes.map((r) => (
                    <SidebarMenuItem key={r.href}>
                      <SidebarNavLink href={r.href} exato>
                        {r.rotulo}
                      </SidebarNavLink>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroup>
            )}
          </SidebarContent>

          <SidebarFooter>
            <div className="flex items-center gap-3 px-1 py-1 group-data-[collapsible=icon]:justify-center">
              <AvatarUsuario nome={usuario.nome} imagem={usuario.imagem} />
              <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <p className="truncate text-sm font-medium">{usuario.nome}</p>
                <p className="truncate text-xs text-muted-foreground">{usuario.email}</p>
              </div>
              <div className="group-data-[collapsible=icon]:hidden">
                <BotaoSair />
              </div>
            </div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset>
          <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur">
            <SidebarTrigger />
            <Link href="/dashboard" className="shrink-0 text-lg font-semibold tracking-tight whitespace-nowrap md:hidden">
              Formandos <span aria-hidden>🎓</span>
            </Link>
            <span className="min-w-0 flex-1 truncate text-right text-xs font-medium text-muted-foreground md:hidden">
              {titulo}
            </span>
          </header>
          <main id="conteudo" tabIndex={-1} className="min-w-0 flex-1 p-4 outline-none sm:p-6 lg:p-8 2xl:p-12">
            <ConteudoTurma arquivadaEm={arquivadaEm}>
              <AnimarPagina>{children}</AnimarPagina>
            </ConteudoTurma>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
