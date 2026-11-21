"use client";

import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SidebarMenuButton, SidebarMenuItem, SidebarMenuSub } from "@/components/ui/sidebar";

// Grupo "Mais" da sidebar (Tarefas, Fornecedores, Registro). Começa fechado,
// a não ser que a página atual esteja nele. Com a sidebar recolhida a só
// ícones, o submenu não cabe: os itens aparecem direto, como ícones (ver
// AppShell), e este bloco some.
export function GrupoMais({
  rotulo,
  hrefs,
  icone,
  className,
  children,
}: {
  rotulo: string;
  hrefs: string[];
  icone: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const dentro = hrefs.some((h) => pathname === h || pathname.startsWith(`${h}/`));

  return (
    <Collapsible key={dentro ? "aberto" : "fechado"} defaultOpen={dentro} className="group/mais" asChild>
      <SidebarMenuItem className={className}>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            {icone}
            <span>{rotulo}</span>
            <ChevronRight
              className="ml-auto transition-transform group-data-[state=open]/mais:rotate-90"
              aria-hidden
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>{children}</SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
