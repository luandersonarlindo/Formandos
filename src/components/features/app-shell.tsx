import { cookies } from "next/headers";
import Link from "next/link";
import { Ellipsis } from "lucide-react";
import { AnimarPagina } from "@/components/animacao/animar-pagina";
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
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { GrupoMenu, ItemMenu } from "@/lib/menu";
import type { Papel } from "@/lib/papeis";
import { ConteudoTurma } from "./conteudo-turma";
import { GrupoMais } from "./grupo-mais";
import { MenuUsuario } from "./menu-usuario";
import { SeletorTurma } from "./seletor-turma";
import { SidebarAutoClose } from "./sidebar-auto-close";
import { SidebarNavLink } from "./sidebar-nav-link";

export type { GrupoMenu, ItemMenu };

export type SeletorTurmas = {
  ativaId: string;
  lista: { id: string; nome: string; papel: Papel; arquivada: boolean }[];
  podeAdicionar: boolean;
};

type AppShellProps = {
  /** Nome da turma (ou da área, no master), mostrado no topo. */
  titulo: string;
  turmas?: SeletorTurmas;
  grupos: GrupoMenu[];
  // Data em que a turma foi arquivada (ISO), ou null. Deixa o conteúdo só leitura.
  arquivadaEm?: string | null;
  // Data de exclusão da turma arquivada (AAAA-MM-DD, ADR-0009).
  excluirEm?: string | null;
  usuario: { nome: string; email: string; imagem?: string | null };
  master?: boolean;
  /** Links a mais no menu da pessoa (ex.: "Voltar para a turma" no master). */
  extrasUsuario?: { href: string; rotulo: string }[];
  children: React.ReactNode;
};

function Item({ item, sub = false, className }: { item: ItemMenu; sub?: boolean; className?: string }) {
  const { href, rotulo, icone: Icone, exato, tambem } = item;
  const link = (
    <SidebarNavLink href={href} exato={exato} tooltip={rotulo} tambem={tambem}>
      <Icone aria-hidden />
      <span>{rotulo}</span>
    </SidebarNavLink>
  );
  return sub ? (
    <SidebarMenuSubItem className={className}>{link}</SidebarMenuSubItem>
  ) : (
    <SidebarMenuItem className={className}>{link}</SidebarMenuItem>
  );
}

// Sidebar do shadcn (ui.shadcn.com/docs/components/base/sidebar): fica sempre
// aberta em computador, tablet e TV (a partir de 768px, breakpoint `md` do
// componente); abaixo disso vira uma gaveta (Sheet), aberta pelo mesmo botão.
// Fica lembrada em cookie (`sidebar_state`), sem toggle é sempre aberta.
export async function AppShell({
  titulo,
  turmas,
  grupos,
  arquivadaEm = null,
  excluirEm = null,
  usuario,
  master = false,
  extrasUsuario,
  children,
}: AppShellProps) {
  const ativa = turmas?.lista.find((t) => t.id === turmas.ativaId);
  const seletor = turmas && ativa ? { ativa: { id: ativa.id, nome: ativa.nome }, lista: turmas.lista, podeAdicionar: turmas.podeAdicionar } : null;
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
              className="flex items-center gap-2 overflow-hidden px-2 py-1 text-lg font-semibold tracking-tight whitespace-nowrap group-data-[collapsible=icon]:hidden"
            >
              Formandos <span aria-hidden>🎓</span>
            </Link>
            <SidebarMenu>
              <SidebarMenuItem>
                {seletor ? (
                  <SeletorTurma {...seletor} />
                ) : (
                  <span className="block truncate px-2 text-xs font-medium text-muted-foreground group-data-[collapsible=icon]:hidden">
                    {titulo}
                  </span>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent>
            {grupos.map((g, i) =>
              g.recolhivel ? (
                <SidebarGroup key={g.rotulo ?? i} className="py-0">
                  <SidebarMenu>
                    {/* Sidebar aberta: "Mais" recolhível. Recolhida a só ícones: os
                        itens aparecem direto (o submenu não cabe). */}
                    <GrupoMais
                      rotulo={g.rotulo ?? "Mais"}
                      hrefs={g.itens.map((x) => x.href)}
                      icone={<Ellipsis aria-hidden />}
                      className="group-data-[collapsible=icon]:hidden"
                    >
                      {g.itens.map((item) => (
                        <Item key={item.href} item={item} sub />
                      ))}
                    </GrupoMais>
                    {g.itens.map((item) => (
                      <Item key={item.href} item={item} className="hidden group-data-[collapsible=icon]:block" />
                    ))}
                  </SidebarMenu>
                </SidebarGroup>
              ) : (
                <SidebarGroup key={g.rotulo ?? i}>
                  {g.rotulo && <SidebarGroupLabel>{g.rotulo}</SidebarGroupLabel>}
                  <SidebarMenu>
                    {g.itens.map((item) => (
                      <Item key={item.href} item={item} />
                    ))}
                  </SidebarMenu>
                </SidebarGroup>
              ),
            )}
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <MenuUsuario usuario={usuario} master={master} extras={extrasUsuario} />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        {/* min-w-0: sem ele, uma faixa com rolagem lateral (pílulas de categoria,
            tabelas) alarga a coluna inteira entre 768px e 1024px, quando a
            barra lateral já aparece e sobra pouco espaço para o conteúdo. */}
        <SidebarInset className="min-w-0">
          <header className="sticky top-0 z-10 flex items-center gap-2 border-b bg-background/95 px-4 py-2 backdrop-blur print:hidden">
            <SidebarTrigger />
            {/* Celular: o nome da turma é o próprio seletor (D-02). */}
            <div className="flex min-w-0 flex-1 justify-end md:hidden">
              {seletor ? (
                <SeletorTurma {...seletor} compacto />
              ) : (
                <span className="truncate text-sm font-medium text-muted-foreground">{titulo}</span>
              )}
            </div>
          </header>
          <main id="conteudo" tabIndex={-1} className="min-w-0 flex-1 p-4 outline-none sm:p-6 lg:p-8 2xl:p-12">
            <ConteudoTurma arquivadaEm={arquivadaEm} excluirEm={excluirEm}>
              <AnimarPagina>{children}</AnimarPagina>
            </ConteudoTurma>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
