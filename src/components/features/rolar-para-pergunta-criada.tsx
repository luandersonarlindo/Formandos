"use client";

import { useEffect } from "react";

// Rola até a pergunta que acabou de ser criada e põe o foco nela.
//
// A pergunta nova entra no fim da categoria, e num catálogo com 50 perguntas a
// pessoa ficaria olhando para o topo do navegador sem entender o que aconteceu
// depois de fechar o diálogo. Aqui o foco volta para o item novo: quem usa
// teclado já sai pronto para a próxima ação, e quem usa leitor de tela ouve o
// título da pergunta.
//
// Dois detalhes que só apareceram no teste:
//
// - A espera é feita por timer, não por estado do React. O item ainda não
//   existe quando a action responde (a página só o recebe na revalidação
//   seguinte), e guardar o id num `useState` faz o efeito refazer — com o
//   cleanup cancelando a busca a meio caminho.
//
// - Focar só depois que o diálogo sai. O Radix fecha o diálogo com animação e,
//   enquanto ela roda, prende o foco dentro dele: focar antes devolve o foco
//   para o diálogo na hora. E o Radix ainda devolve o foco ao botão de origem
//   quando termina. Por isso a espera só conta quando não há nenhum diálogo
//   na tela, nem o que está fechando.
const ESPERA_MS = 8000;
const INTERVALO_MS = 150;
const FIRMAR_FOCO_MS = 600;

// Conta também o diálogo que está saindo (data-state="closed", ainda na
// tela durante a animação): só depois que ele sai de vez o Radix devolve o
// foco ao botão de origem. Focar antes disso perde o foco para o botão.
const dialogoNaTela = () => document.querySelector('[role="dialog"]') !== null;

export function RolarParaPerguntaCriada() {
  useEffect(() => {
    const aoCriar = (evento: Event) => {
      const id = (evento as CustomEvent<{ id?: string }>).detail?.id;
      if (!id) return;

      const limite = Date.now() + ESPERA_MS;
      const tentar = () => {
        const item = document.getElementById(`enq-${id}`);
        if (item && !dialogoNaTela()) {
          // smooth + preventScroll: o scrollIntoView posiciona a rolagem, e
          // focar sem rolar de novo evita o salto.
          item.scrollIntoView({ block: "center", behavior: "smooth" });
          (item as HTMLElement).focus?.({ preventScroll: true });
          item.classList.add("ring-2", "ring-[var(--vitrine-a)]");
          window.setTimeout(
            () => item.classList.remove("ring-2", "ring-[var(--vitrine-a)]"),
            2000,
          );
          // O Radix devolve o foco ao botão de origem num setTimeout próprio,
          // que às vezes roda depois daqui; e a revalidação pode trocar o
          // elemento. Por meio segundo, se o foco sair da pergunta, volta.
          const firmeAte = Date.now() + FIRMAR_FOCO_MS;
          const firmar = () => {
            const atual = document.getElementById(`enq-${id}`);
            if (atual && !atual.contains(document.activeElement)) {
              atual.focus({ preventScroll: true });
            }
            if (Date.now() < firmeAte) window.setTimeout(firmar, 100);
          };
          window.setTimeout(firmar, 100);
          return;
        }
        // O item ainda não chegou, ou o diálogo de criação ainda está saindo. O
        // prazo evita espera eterna se a revalidação falhar.
        if (Date.now() < limite) window.setTimeout(tentar, INTERVALO_MS);
      };
      tentar();
    };

    window.addEventListener("formandos:pergunta-criada", aoCriar);
    return () => window.removeEventListener("formandos:pergunta-criada", aoCriar);
  }, []);

  return null;
}