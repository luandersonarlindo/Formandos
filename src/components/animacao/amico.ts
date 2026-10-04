import { animate, stagger } from "animejs";

// Animação das ilustrações Amico (src/components/ilustracoes). Fica num módulo
// só porque a vitrine e as páginas internas usam o mesmo movimento: antes era o
// mesmo código dentro de vitrine-animada.tsx.
//
// Cada grupo do SVG tem uma classe — o conversor trocou os ids do Storyset por
// .amico-*, porque os ids se repetiam e id repetido é inválido em SVG:
//   .amico-chao, .amico-sombras   a base da cena, fica parada
//   .amico-plantas                balança de leve
//   .amico-personagens            flutua
//   .amico-objeto                 o elemento em destaque sobe e desce
//   .amico-estrelas > *           o confete pisca em cascata
// Os grupos usam transform-box: fill-box (globals.css); sem isso a rotação sai
// do centro de cada grupo e a ilustração fica torta.
//
// O laço é registrado no escopo que o chamador passar: é isso que faz a
// animação parar quando o componente é desmontado. Sem registro, um laço
// infinito continuaria rodando fora da tela.
export function animarAmico(
  alvo: HTMLElement,
  escopo: { add: (corpo: () => void) => void },
): void {
  escopo.add(() => {
    animate(alvo, {
      opacity: [0, 1],
      scale: [0.92, 1],
      rotate: [-4, 0],
      duration: 900,
      ease: "outExpo",
    });

    // Nem toda ilustração tem todo grupo (a "Team spirit" da vitrine não tem
    // .amico-objeto, por exemplo). Animar uma lista vazia faz o anime.js
    // reclamar no console, então o grupo só entra se existir.
    const laco = (seletor: string, params: Record<string, unknown>) => {
      const els = alvo.querySelectorAll<SVGElement>(seletor);
      if (els.length === 0) return;
      animate(els, { loop: true, ...params });
    };

    // Personagens e plantas se movem em ritmos diferentes, para a cena não
    // parecer uma imagem só.
    laco(".amico-personagens", {
      translateY: [0, -8, 0],
      duration: 4200,
      ease: "inOutSine",
    });
    laco(".amico-plantas", {
      rotate: [0, 2.5, 0],
      duration: 5200,
      ease: "inOutSine",
    });
    laco(".amico-objeto", {
      translateY: [0, -6, 0],
      duration: 3600,
      ease: "inOutSine",
    });
    laco(".amico-estrelas > *", {
      opacity: [1, 0.25, 1],
      scale: [1, 0.7, 1],
      duration: (_t: unknown, i = 0) => 1400 + i * 260,
      delay: stagger(180),
      ease: "inOutQuad",
    });
  });
}