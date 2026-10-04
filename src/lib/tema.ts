// Modo de cor da interface. "sistema" segue a preferência do aparelho; "claro" e
// "escuro" fixam. A escolha fica no localStorage e vira a classe .dark no <html>,
// que é o que o Tailwind e o shadcn já esperam (ver globals.css).
//
// Este módulo tem duas partes: as funções puras, testadas em tema.test.ts, e o
// SCRIPT_TEMA, que é injetado no <body> pelo layout. O script repete a mesma
// lógica de propósito: ele precisa rodar antes de o React hidratar e antes de o
// navegador pintar, e um módulo importado não dá conta disso. Se mudar um dos
// lados, mude o outro.

export type Tema = "sistema" | "claro" | "escuro";

export const CHAVE_TEMA = "formandos:tema";

/** Atributo no <html> que registra o modo escolhido (não o modo efetivo). */
export const ATRIBUTO_TEMA = "data-tema";

const OPCOES: readonly string[] = ["sistema", "claro", "escuro"];

export function ehTema(valor: unknown): valor is Tema {
  return typeof valor === "string" && OPCOES.includes(valor);
}

/** Se a interface deve ficar escura, dada a escolha e o que o aparelho pede. */
export function deveFicarEscuro(tema: Tema, sistemaEscuro: boolean): boolean {
  if (tema === "sistema") return sistemaEscuro;
  return tema === "escuro";
}

/** Lê a escolha guardada. Devolve "sistema" quando não há nada válido guardado. */
export function lerTemaGuardado(ler: (chave: string) => string | null): Tema {
  try {
    const valor = ler(CHAVE_TEMA);
    return ehTema(valor) ? valor : "sistema";
  } catch {
    // O localStorage lança em navegação privada, em cookies bloqueados e em
    // iframes sem mesma origem. Perder a preferência é melhor que quebrar a
    // página; "sistema" é o modo que o aparelho já está usando.
    return "sistema";
  }
}

/**
 * Roda antes da primeira pintura: sem isto, quem escolheu o modo escuro veria a
 * página clara e depois escura. Também marca data-sem-animacao já aqui, para
 * quem pede menos movimento não ver os blocos piscarem antes de o efeito de
 * animação rodar.
 */
export const SCRIPT_TEMA = `(function(){try{var r=document.documentElement;var t;try{t=localStorage.getItem("${CHAVE_TEMA}")}catch(e){}if(t!=="claro"&&t!=="escuro"){t="sistema"}var s=window.matchMedia("(prefers-color-scheme: dark)").matches;if(t==="escuro"||(t==="sistema"&&s)){r.classList.add("dark")}r.setAttribute("${ATRIBUTO_TEMA}",t);if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){r.setAttribute("data-sem-animacao","")}}catch(e){}})();`;