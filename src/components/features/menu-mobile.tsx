"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Cabeçalho fixo do celular (com o botão de menu) e a gaveta que desliza da
// esquerda com o conteúdo da barra lateral (`children`, o mesmo do desktop).
// Só existe abaixo de `lg`; no desktop a barra lateral já fica sempre visível.
export function MenuMobile({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  const [aberto, setAberto] = useState(false);
  const pathname = usePathname();
  const botaoAbrir = useRef<HTMLButtonElement>(null);

  // Fecha ao navegar para outra página (link do menu, trocar de turma, sair…).
  useEffect(() => setAberto(false), [pathname]);

  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    document.addEventListener("keydown", aoTeclar);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = "";
    };
  }, [aberto]);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <Button
          ref={botaoAbrir}
          variant="ghost"
          size="icon"
          aria-label="Abrir menu"
          aria-expanded={aberto}
          onClick={() => setAberto(true)}
        >
          <Menu aria-hidden />
        </Button>
        <Link href="/dashboard" className="shrink-0 text-lg font-semibold tracking-tight whitespace-nowrap">
          Formandos <span aria-hidden>🎓</span>
        </Link>
        <span className="min-w-0 flex-1 truncate text-right text-xs font-medium text-muted-foreground">
          {titulo}
        </span>
      </header>

      {aberto && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            className="absolute inset-0 bg-black/40 animate-in fade-in duration-200"
            onClick={() => setAberto(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="animate-in slide-in-from-left absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col overflow-y-auto border-r bg-background pb-4 shadow-xl duration-200"
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <Link href="/dashboard" className="text-lg font-semibold tracking-tight whitespace-nowrap">
                Formandos <span aria-hidden>🎓</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Fechar menu"
                autoFocus
                onClick={() => setAberto(false)}
              >
                <X aria-hidden />
              </Button>
            </div>
            {children}
          </div>
        </div>
      )}
    </>
  );
}
