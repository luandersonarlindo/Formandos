"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { FormEnquete } from "@/components/features/form-enquete";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// "Adicionar pergunta" mora no cabeçalho de cada categoria: com dez categorias
// o formulário único no fim da página obrigava a rolar tudo e ainda escolher a
// categoria num dropdown. O botão já sabe a que categoria pertence, então
// ninguém precisa escolher.
//
// O diálogo é deste componente, e não o `FormDialog`, porque a pergunta traz a
// própria Server Action (`adicionarEnquete`, dentro do FormEnquete) e precisa
// do seu estado de "salvou" para fechar. O FormDialog sempre embrulha o
// conteúdo num form com a action dele, e dois forms aninhados quebram o envio.

export function DialogoNovaPergunta({
  categoria,
  categorias,
}: {
  categoria: { id: string; nome: string };
  categorias: { id: string; nome: string }[];
}) {
  const [aberto, setAberto] = useState(false);

  function aoSalvar(id?: string) {
    setAberto(false);
    // A página recarrega os dados da categoria quando a action revalida, e o
    // item novo entra no fim da lista. O evento diz qual é, para a página rolar
    // até ele e mover o foco — sem isso a pessoa perde o ponto.
    if (id) window.dispatchEvent(new CustomEvent("formandos:pergunta-criada", { detail: { id } }));
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="shrink-0">
          <Plus className="size-4" aria-hidden />
          Adicionar pergunta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova pergunta em {categoria.nome}</DialogTitle>
          <DialogDescription>
            Vai aparecer para a turma na votação, dentro desta categoria.
          </DialogDescription>
        </DialogHeader>
        <FormEnquete
          categorias={categorias}
          categoriaFixa={categoria}
          aoSucesso={aoSalvar}
        />
      </DialogContent>
    </Dialog>
  );
}