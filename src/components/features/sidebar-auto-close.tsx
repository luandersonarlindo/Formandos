"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";

// Fecha a gaveta do celular ao navegar (link do menu, trocar de turma, sair…).
// No computador, tablet e TV a sidebar não é uma gaveta, então isso não faz
// nada lá. Sem elemento próprio: só liga o efeito.
export function SidebarAutoClose() {
  const pathname = usePathname();
  const { isMobile, openMobile, setOpenMobile } = useSidebar();

  useEffect(() => {
    if (isMobile && openMobile) setOpenMobile(false);
    // Só quando a URL muda; abrir/fechar a própria gaveta não deve disparar isso.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
}
