"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Cabeçalho fixo (com o botão de menu) e a gaveta que desliza da esquerda com
// o conteúdo da barra lateral (`children`). Vale em qualquer tamanho de tela:
// computador, tablet, celular e TV — não há mais uma barra sempre visível.
//
// O painel fica sempre montado (só escondido por CSS, com `inert` quando
// fechado) em vez de sumir do DOM ao fechar: os formulários lá dentro (trocar
// de turma, sair) fazem a própria navegação redirecionar, e desmontá-los no
// meio disso causava "Router action dispatched before initialization" no
// Next.js. Escondido por CSS, o formulário continua no ar até a ação terminar.
export function MenuGaveta({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  const [aberto, setAberto] = useState(false);
  const pathname = usePathname();
  const botaoAbrir = useRef<HTMLButtonElement>(null);
  const botaoFechar = useRef<HTMLButtonElement>(null);

  // Fecha ao navegar para outra página (link do menu, trocar de turma, sair…).
  useEffect(() => setAberto(false), [pathname]);

  // O painel fica sempre montado (veja o comentário acima do componente), então
  // o foco é movido manualmente ao abrir e fechar, em vez de um `autoFocus`.
  // A primeira renderização (`aberto` começa fechado) não deve roubar o foco.
  const primeiraRenderizacao = useRef(true);
  useEffect(() => {
    if (primeiraRenderizacao.current) {
      primeiraRenderizacao.current = false;
      return;
    }
    if (aberto) botaoFechar.current?.focus();
    else botaoAbrir.current?.focus();
  }, [aberto]);

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
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur">
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

      <div
        className="fixed inset-0 z-40 transition-opacity duration-200"
        style={{ opacity: aberto ? 1 : 0, pointerEvents: aberto ? "auto" : "none" }}
      >
        <button
          type="button"
          aria-label="Fechar menu"
          tabIndex={aberto ? 0 : -1}
          className="absolute inset-0 bg-black/40"
          onClick={() => setAberto(false)}
        />
        <div
          role="dialog"
          aria-modal={aberto}
          aria-label="Menu"
          inert={!aberto}
          className={cn(
            "absolute inset-y-0 left-0 flex w-64 max-w-[85vw] flex-col overflow-y-auto border-r bg-background pb-4 shadow-xl transition-transform duration-200",
            aberto ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <Link href="/dashboard" className="text-lg font-semibold tracking-tight whitespace-nowrap">
              Formandos <span aria-hidden>🎓</span>
            </Link>
            <Button variant="ghost" size="icon" aria-label="Fechar menu" onClick={() => setAberto(false)}>
              <X aria-hidden />
            </Button>
          </div>
          {children}
        </div>
      </div>
    </>
  );
}
