"use client";

import { useLayoutEffect, useRef } from "react";
import { animate, createScope, stagger } from "animejs";

// Entrada animada (Anime.js) das páginas internas. O conteúdo é renderizado no
// servidor e fica completo sem JavaScript; aqui só se acrescenta movimento.
//
// Sem marcação nenhuma na página:
//   filhos do conteúdo    sobem e aparecem em sequência
//   barras de progresso   enchem até o valor
// Com marcação:
//   [data-grupo]   os filhos diretos aparecem em cascata
//   [data-contar]  número que sobe até o valor final (o número vai no atributo)
//
// O layout continua montado entre as páginas, então um MutationObserver anima
// cada conteúdo novo que entra (troca de página, ou o fim do loading.tsx).
// Quem pede menos movimento vê tudo já pronto.
const ATRASO_BLOCO = 60;
const ATRASO_ITEM = 45;

const filhos = (el: Element) => Array.from(el.children) as HTMLElement[];

function animarEntrada(raiz: HTMLElement): () => void {
  const desfazer: Array<() => void> = [];
  const esconder = (els: HTMLElement[]) => {
    els.forEach((el) => {
      el.style.opacity = "0";
    });
    const limpar = () =>
      els.forEach((el) => {
        el.style.removeProperty("opacity");
        el.style.removeProperty("transform");
      });
    desfazer.push(limpar);
    return limpar;
  };

  // Blocos do topo da página. Grupos são animados item a item.
  const grupos = Array.from(raiz.querySelectorAll<HTMLElement>("[data-grupo]"));
  const blocos = (raiz.children.length > 0 ? filhos(raiz) : [raiz]).filter(
    (b) => !b.matches("[data-grupo]"),
  );
  if (blocos.length > 0) {
    const limpar = esconder(blocos);
    animate(blocos, {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 600,
      delay: stagger(ATRASO_BLOCO),
      ease: "outCubic",
      onComplete: limpar,
    });
  }

  grupos.forEach((grupo) => {
    const itens = filhos(grupo);
    if (itens.length === 0) return;
    const limpar = esconder(itens);
    animate(itens, {
      opacity: [0, 1],
      translateY: [24, 0],
      scale: [0.97, 1],
      duration: 600,
      delay: stagger(Math.min(ATRASO_ITEM, 600 / itens.length), { start: 150 }),
      ease: "outCubic",
      onComplete: limpar,
    });
  });

  raiz.querySelectorAll<HTMLElement>("[data-contar]").forEach((alvo) => {
    const final = Number(alvo.dataset.contar);
    if (!Number.isFinite(final)) return;
    const contador = { valor: 0 };
    alvo.textContent = "0";
    desfazer.push(() => {
      alvo.textContent = String(final);
    });
    animate(contador, {
      valor: final,
      duration: 1200,
      ease: "outExpo",
      onUpdate: () => {
        alvo.textContent = String(Math.round(contador.valor));
      },
      onComplete: () => {
        alvo.textContent = String(final);
      },
    });
  });

  // Barras de progresso (components/ui/progress): o valor está no transform.
  raiz.querySelectorAll<HTMLElement>("[data-slot='progress-indicator']").forEach((barra) => {
    const original = barra.style.transform;
    const falta = /translateX\(-?([\d.]+)%\)/.exec(original)?.[1];
    if (falta === undefined) return;
    const restaurar = () => {
      barra.style.transform = original;
      barra.style.removeProperty("transition");
    };
    desfazer.push(restaurar);
    barra.style.transition = "none";
    animate(barra, {
      translateX: ["-100%", `-${falta}%`],
      duration: 1000,
      delay: 200,
      ease: "outExpo",
      onComplete: restaurar,
    });
  });

  return () => desfazer.forEach((f) => f());
}

// O layout hidrata antes do conteúdo da página (que fica atrás de um Suspense).
// Mexer no DOM antes disso causa erro de hidratação, então a animação espera o
// React marcar o elemento como hidratado (propriedade __reactFiber$…). Depois
// de um limite, anima mesmo assim, para o conteúdo nunca ficar escondido.
const ESPERA_MAXIMA_MS = 3000;

const hidratado = (el: Element) => Object.keys(el).some((k) => k.startsWith("__reactFiber$"));

function esperarHidratacao(el: Element, cancelado: () => boolean): Promise<void> {
  const inicio = performance.now();
  return new Promise((resolver) => {
    const conferir = () => {
      if (cancelado() || hidratado(el) || performance.now() - inicio > ESPERA_MAXIMA_MS) {
        resolver();
        return;
      }
      requestAnimationFrame(conferir);
    };
    conferir();
  });
}

export function AnimarPagina({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const raiz = useRef<HTMLDivElement>(null);

  // useLayoutEffect: os blocos ficam escondidos antes da primeira pintura, sem
  // piscar o conteúdo pronto e depois escondê-lo.
  useLayoutEffect(() => {
    const el = raiz.current;
    if (!el) return;
    const html = document.documentElement;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.dataset.animar = "pronto";
      return;
    }

    const limpezas: Array<() => void> = [];
    let ativo = true;
    const escopo = createScope({ root: el });
    // Carregando (loading.tsx) usa role="status" e não precisa de entrada.
    const entrar = async (alvo: Node) => {
      if (!(alvo instanceof HTMLElement) || alvo.getAttribute("role") === "status") return;
      await esperarHidratacao(alvo, () => !ativo);
      if (!ativo || !alvo.isConnected) return;
      try {
        escopo.add(() => {
          limpezas.push(animarEntrada(alvo));
        });
      } catch (erro) {
        // Se algo falhar, mostra o conteúdo sem animação em vez de deixá-lo invisível.
        console.error("Falha ao animar a página", erro);
        html.dataset.semAnimacao = "";
      }
    };

    // O conteúdo só é liberado (data-animar="pronto") depois de assumido.
    Promise.all(filhos(el).map(entrar)).then(() => {
      if (ativo) el.dataset.animar = "pronto";
    });

    const observador = new MutationObserver((mudancas) => {
      mudancas.forEach((m) => m.addedNodes.forEach((n) => void entrar(n)));
    });
    observador.observe(el, { childList: true });

    return () => {
      ativo = false;
      observador.disconnect();
      escopo.revert();
      limpezas.forEach((f) => f());
      delete html.dataset.semAnimacao;
    };
  }, []);

  return (
    <div ref={raiz} data-animar="pendente" className={className}>
      {children}
    </div>
  );
}
