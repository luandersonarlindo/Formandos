"use client";

import { useEffect, useRef } from "react";
import { animate, createScope, createTimeline, stagger } from "animejs";
import { animarAmico } from "@/components/animacao/amico";

// Anima a página inicial com o Anime.js. O conteúdo é renderizado no servidor
// (fica completo sem JavaScript); aqui só se acrescenta movimento:
//   [data-hero]    entrada do topo, em sequência (timeline)
//   [data-reveal]  aparece ao entrar na tela
//   [data-grupo]   os [data-item] de dentro aparecem em cascata
//   [data-contar]  número que sobe até o valor final
//   [data-barra]   barra que cresce até a largura em data-barra (%)
//   [data-linha]   linha que se desenha (escala de 0 a 1)
//   [data-flutuar] enfeite que flutua sem parar
//   [data-amico]   ilustração Amico: entra girando um pouco, e depois os
//                  personagens flutuam e as estrelas piscam sem parar
export function VitrineAnimada({ children }: { children: React.ReactNode }) {
  const raiz = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = raiz.current;
    if (!el) return;
    const html = document.documentElement;

    // Quem pede menos movimento vê tudo já pronto.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      html.dataset.semAnimacao = "";
      return () => {
        delete html.dataset.semAnimacao;
      };
    }

    const observadores: IntersectionObserver[] = [];

    const escopo = createScope({ root: el }).add(() => {
      try {
        // Topo da página
        createTimeline({ defaults: { ease: "outExpo", duration: 900 } })
          .add("[data-hero='selo']", { opacity: [0, 1], translateY: [-16, 0] })
          .add("[data-hero='palavra']", { opacity: [0, 1], translateY: [40, 0], rotate: [4, 0], delay: stagger(70) }, "-=600")
          .add("[data-hero='texto']", { opacity: [0, 1], translateY: [24, 0] }, "-=500")
          .add("[data-hero='botao']", { opacity: [0, 1], translateY: [20, 0], scale: [0.92, 1], delay: stagger(90) }, "-=600")
          .add("[data-hero='painel']", { opacity: [0, 1], translateY: [48, 0], scale: [0.96, 1] }, "-=800");

        // Enfeites flutuando
        animate("[data-flutuar]", {
          translateY: (_t: unknown, i = 0) => (i % 2 === 0 ? -14 : 14),
          rotate: (_t: unknown, i = 0) => (i % 2 === 0 ? 6 : -6),
          duration: (_t: unknown, i = 0) => 2600 + i * 450,
          alternate: true,
          loop: true,
          ease: "inOutSine",
        });

        // Ao entrar na tela
        const ver = (alvo: Element, fn: () => void) => {
          const obs = new IntersectionObserver(
            (entradas) => {
              if (!entradas[0].isIntersecting) return;
              obs.disconnect();
              fn();
            },
            { threshold: 0.2, rootMargin: "0px 0px -8% 0px" },
          );
          obs.observe(alvo);
          observadores.push(obs);
        };

        el.querySelectorAll<HTMLElement>("[data-reveal]").forEach((alvo) => {
          ver(alvo, () =>
            animate(alvo, { opacity: [0, 1], translateY: [32, 0], duration: 800, ease: "outCubic" }),
          );
        });

        el.querySelectorAll<HTMLElement>("[data-grupo]").forEach((grupo) => {
          ver(grupo, () =>
            animate(grupo.querySelectorAll("[data-item]"), {
              opacity: [0, 1],
              translateY: [36, 0],
              scale: [0.96, 1],
              duration: 700,
              delay: stagger(90),
              ease: "outCubic",
            }),
          );
        });

        el.querySelectorAll<HTMLElement>("[data-contar]").forEach((alvo) => {
          const final = Number(alvo.dataset.contar);
          if (!Number.isFinite(final)) return;
          alvo.textContent = "0";
          const contador = { valor: 0 };
          ver(alvo, () =>
            animate(contador, {
              valor: final,
              duration: 1600,
              ease: "outExpo",
              onUpdate: () => {
                alvo.textContent = String(Math.round(contador.valor));
              },
              onComplete: () => {
                alvo.textContent = String(final);
              },
            }),
          );
        });

        el.querySelectorAll<HTMLElement>("[data-barra]").forEach((barra) => {
          const largura = `${barra.dataset.barra}%`;
          barra.style.width = "0%";
          ver(barra, () =>
            animate(barra, { width: ["0%", largura], duration: 1200, ease: "outExpo", delay: Number(barra.dataset.atraso ?? 0) }),
          );
        });

        el.querySelectorAll<HTMLElement>("[data-linha]").forEach((linha) => {
          linha.style.transformOrigin = "top";
          linha.style.transform = "scaleY(0)";
          ver(linha, () => animate(linha, { scaleY: [0, 1], duration: 1400, ease: "inOutQuad" }));
        });

        // Ilustração Amico: entra girando um pouco e depois fica viva.
        el.querySelectorAll<HTMLElement>("[data-amico]").forEach((alvo) => {
          ver(alvo, () => animarAmico(alvo, escopo));
        });
      } catch (erro) {
        // Se algo falhar, mostra o conteúdo sem animação em vez de deixá-lo invisível.
        console.error("Falha ao iniciar as animações da vitrine", erro);
        html.dataset.semAnimacao = "";
      }
    });

    return () => {
      observadores.forEach((o) => o.disconnect());
      escopo.revert();
      delete html.dataset.semAnimacao;
    };
  }, []);

  // data-vitrine é o que permite ao globals.css esconder só a ilustração desta
  // página (e não a das páginas internas, que são estáticas).
  return (
    <div ref={raiz} data-vitrine>
      {children}
    </div>
  );
}
