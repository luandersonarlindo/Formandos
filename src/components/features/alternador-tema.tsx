"use client";

import * as React from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ATRIBUTO_TEMA, CHAVE_TEMA, deveFicarEscuro, lerTemaGuardado, type Tema } from "@/lib/tema";

// Escolha de claro/escuro/ sistema. Três modos, e não dois com botão de
// alternância: quem prefere seguir o aparelho (ou o aparelho muda de lado no
// meio do dia) precisa poder dizer isso uma vez e esquecer.
//
// O ícone do botão é escolhido por CSS a partir do data-tema que o <html> já
// traz no HTML inicial, e não pelo estado do React: o servidor não sabe o que
// está guardado no navegador, então usar o estado faria o ícone aparecer errado
// (ou piscar) antes de hidratar. O item marcado do menu vem do estado mesmo,
// porque o menu só abre depois do clique.

// null = ainda não lido no navegador (o HTML do servidor não sabe).
const OPCOES: { valor: Tema; rotulo: string; Icone: typeof Monitor }[] = [
  { valor: "sistema", rotulo: "Sistema", Icone: Monitor },
  { valor: "claro", rotulo: "Claro", Icone: Sun },
  { valor: "escuro", rotulo: "Escuro", Icone: Moon },
];

const nomeDoTema = (tema: Tema) => OPCOES.find((o) => o.valor === tema)?.rotulo ?? "Sistema";

function aplicar(tema: Tema): void {
  const html = document.documentElement;
  const escuro = deveFicarEscuro(tema, window.matchMedia("(prefers-color-scheme: dark)").matches);
  html.classList.toggle("dark", escuro);
  html.setAttribute(ATRIBUTO_TEMA, tema);
}

export function AlternadorTema({ rotulo = "Tema", className }: { rotulo?: string; className?: string }) {
  const [tema, setTema] = React.useState<Tema | null>(null);

  // Depois da hidratação, adota o que já está no <html> (posto pelo script do
  // layout). Se o script falhou, o atributo não existe e vale "sistema".
  React.useEffect(() => {
    const atual = document.documentElement.getAttribute(ATRIBUTO_TEMA);
    setTema(lerTemaGuardado(() => atual));
  }, []);

  const escolher = (proximo: Tema) => {
    aplicar(proximo);
    setTema(proximo);
    try {
      localStorage.setItem(CHAVE_TEMA, proximo);
    } catch {
      // Sem localStorage a escolha vale só nesta aba, e o modo ainda se aplica
      // na hora. Nada a fazer além de não quebrar.
    }
  };

  // No modo "sistema", a troca do aparelho tem que virar troca na tela.
  React.useEffect(() => {
    if (tema !== "sistema") return;
    const consulta = window.matchMedia("(prefers-color-scheme: dark)");
    const aoMudar = () => aplicar("sistema");
    consulta.addEventListener("change", aoMudar);
    return () => consulta.removeEventListener("change", aoMudar);
  }, [tema]);

  // A troca feita em outra aba do mesmo navegador.
  React.useEffect(() => {
    const aoMudar = (evento: StorageEvent) => {
      if (evento.key !== CHAVE_TEMA) return;
      const proximo = lerTemaGuardado(() => evento.newValue);
      aplicar(proximo);
      setTema(proximo);
    };
    window.addEventListener("storage", aoMudar);
    return () => window.removeEventListener("storage", aoMudar);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={className} aria-label={`${rotulo}: ${nomeDoTema(tema ?? "sistema")}`}>
          {OPCOES.map(({ valor, Icone }) => (
            <Icone key={valor} data-tema-icone={valor} aria-hidden />
          ))}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuLabel>{rotulo}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={tema ?? "sistema"} onValueChange={(v) => escolher(v as Tema)}>
          {OPCOES.map(({ valor, rotulo: nome, Icone }) => (
            <DropdownMenuRadioItem key={valor} value={valor}>
              <Icone aria-hidden />
              {nome}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}