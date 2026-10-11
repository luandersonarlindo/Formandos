"use client";

import { useState } from "react";
import type { EstadoForm } from "@/actions/tipos";
import { Check, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Renomear sem abrir diálogo: clica no nome, digita, salva.
//
// Um campo de uma linha não precisa de modal. O padrão dos survey builders
// (Qualtrics: "change at any time by clicking directly on the name and typing a
// new one") é clicar e editar no lugar. Antes era um botão "Renomear" que
// abria um diálogo inteiro para um `Input` — três cliques e uma camada de foco
// a mais para trocar uma palavra.
//
// Esc sai sem salvar e Enter salva, para o teclado não ficar preso na edição.

export function RenomearInline({
  valor,
  acao,
  campos,
  rotuloBotao,
  rotuloCampo,
  className,
  inputClassName,
}: {
  valor: string;
  acao: (estado: EstadoForm, formData: FormData) => Promise<EstadoForm>;
  campos: Record<string, string>;
  /** "Renomear o catálogo": o aria-label do botão. */
  rotuloBotao: string;
  /** "Nome novo do catálogo": o aria-label do campo que aparece. */
  rotuloCampo: string;
  className?: string;
  inputClassName?: string;
}) {
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(valor);
  const [estado, setEstado] = useState<EstadoForm>({});
  const [pendente, setPendente] = useState(false);

  async function salvar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const novo = texto.trim();
    // Não suja a base com um regravamento sem mudança: o botão some depois.
    if (novo === valor || novo.length < 2) return;
    setPendente(true);
    // O id vai por campo escondido, então ele precisa ser montado aqui: o
    // <input name="nome"> sozinho não chega ao servidor.
    const dados = new FormData();
    dados.set("nome", novo);
    for (const [chave, valorCampo] of Object.entries(campos)) dados.set(chave, valorCampo);
    const resposta = await acao({}, dados);
    setEstado(resposta);
    setPendente(false);
    if (!resposta.erro) setEditando(false);
  }

  if (!editando) {
    return (
      <span className={`inline-flex items-center gap-1.5 ${className ?? ""}`}>
        <span className="truncate">{valor}</span>
        <button
          type="button"
          onClick={() => {
            setTexto(valor);
            setEstado({});
            setEditando(true);
          }}
          aria-label={rotuloBotao}
          title={rotuloBotao}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Pencil className="size-3.5" aria-hidden />
        </button>
      </span>
    );
  }

  return (
    <form onSubmit={salvar} className={`flex flex-wrap items-center gap-2 ${className ?? ""}`}>
      <Input
        name="nome"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            setTexto(valor);
            setEstado({});
            setEditando(false);
          }
        }}
        maxLength={100}
        autoFocus
        required
        aria-label={rotuloCampo}
        className={`h-9 ${inputClassName ?? "w-64"}`}
      />
      <Button type="submit" size="sm" disabled={pendente}>
        <Check className="size-3.5" aria-hidden />
        <span className="sr-only">Salvar novo nome</span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => {
          setTexto(valor);
          setEstado({});
          setEditando(false);
        }}
        aria-label="Cancelar renomeação"
      >
        <X className="size-3.5" aria-hidden />
      </Button>
      {estado.erro && (
        <span role="alert" className="text-sm text-destructive">
          {estado.erro}
        </span>
      )}
    </form>
  );
}