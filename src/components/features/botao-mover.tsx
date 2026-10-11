"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { EstadoForm } from "@/actions/tipos";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

// Subir ou descer uma categoria ou uma pergunta.
//
// Botão, e não arrastar: WCAG 2.2 SC 2.5.7 (Dragging Movements) exige
// alternativa de ponteiro único, e a forma mais simples de cumpri-la é
// exatamente esta. Arrastar sozinho também é ruim no celular.
//
// Depois do movimento o foco volta para o botão e a nova posição é dita em voz
// alta: a lista reordena inteira, então quem usa leitor de tela precisa ouvir
// o resultado para saber que deu certo.

export function BotaoMover({
  acao,
  id,
  tipo,
  nome,
  direcao,
  desabilitado,
}: {
  acao: (estado: EstadoForm, formData: FormData) => Promise<EstadoForm>;
  /** "categoria" ou "pergunta": muda o nome do campo e o texto do anúncio. */
  id: string;
  tipo: "categoria" | "pergunta";
  nome: string;
  direcao: "cima" | "baixo";
  /** Na ponta da lista o botão some, em vez de mandar a pessoa para fora. */
  desabilitado: boolean;
}) {
  const [estado, formAcao, pendente] = useActionState(acao, {});
  const [anuncio, setAnuncio] = useState("");
  // O botão que disparou, para o foco voltar a ele: o servidor reordena a lista
  // inteira e o React recria os nós.
  const botao = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!estado.ok) return;
    setAnuncio(estado.ok);
    botao.current?.focus();
  }, [estado]);

  if (desabilitado) return null;

  const rotulo = direcao === "cima" ? "Subir" : "Descer";
  const descricao = `${rotulo} ${tipo === "categoria" ? "a categoria" : "a pergunta"} ${nome}`;
  const Seta = direcao === "cima" ? ArrowUp : ArrowDown;

  return (
    <form action={formAcao} className="contents">
      <input
        type="hidden"
        name={tipo === "categoria" ? "categoriaId" : "enqueteId"}
        value={id}
      />
      <input type="hidden" name="direcao" value={direcao} />
      <Button
        ref={botao}
        type="submit"
        variant="ghost"
        size="icon-sm"
        disabled={pendente}
        aria-label={descricao}
        title={descricao}
      >
        <Seta className="size-4" aria-hidden />
      </Button>
      {/* Vive junto do botão e existe desde o começo (vazia), então o leitor de
          tela anuncia quando o texto muda. */}
      <span role="status" aria-live="polite" className="sr-only">
        {anuncio}
      </span>
    </form>
  );
}