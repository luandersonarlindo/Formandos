"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";

type SidebarNavLinkProps = {
  href: string;
  // Rotas "raiz" (ex.: /admin) só ficam ativas quando a URL é exatamente igual.
  exato?: boolean;
  // Legenda mostrada como dica quando a sidebar está recolhida a só ícones.
  tooltip?: string;
  children: React.ReactNode;
};

// Item de navegação da sidebar: sabe se está na página atual (para o
// destaque). O ícone vem já renderizado em `children` (não dá para passar o
// componente do ícone como prop de Server para Client Component).
//
// No celular a sidebar é uma gaveta por cima da página: tocar num link fecha a
// gaveta, senão a página nova abre escondida atrás dela.
export function SidebarNavLink({ href, exato = false, tooltip, children }: SidebarNavLinkProps) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const ativo = exato ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <SidebarMenuButton asChild isActive={ativo} tooltip={tooltip}>
      <Link href={href} onClick={() => setOpenMobile(false)}>
        {children}
      </Link>
    </SidebarMenuButton>
  );
}
