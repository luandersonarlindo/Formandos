"use client";

import * as React from "react";
import { Pencil } from "lucide-react";
import { atualizarItemProgramacao } from "@/actions/evento";
import { FormAcao } from "@/components/features/form-acao";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Item = {
  id: string;
  titulo: string;
  descricao: string | null;
  /** Já no formato de <input type="datetime-local">, vindo do servidor. */
  horarioLocal: string;
};

// Editar um item da programação em diálogo, e não em <details> solto na lista.
//
// O <details> empurrava os itens seguintes para baixo a cada edição e ficava
// espremido em 16rem ao lado do botão de remover. O diálogo dá a largura do
// formulário, não move a lista e devolve o foco para a lista ao fechar.
export function BotaoEditarItem({ item }: { item: Item }) {
  const [aberto, setAberto] = React.useState(false);

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil aria-hidden /> Editar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar item</DialogTitle>
          <DialogDescription>
            Horário, título e descrição. A ordem da lista segue o horário.
          </DialogDescription>
        </DialogHeader>
        <FormAcao
          acao={atualizarItemProgramacao}
          rotulo="Salvar"
          rotuloPendente="Salvando…"
          onSucesso={() => setAberto(false)}
        >
          <input type="hidden" name="id" value={item.id} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`horario-${item.id}`}>Data e hora</Label>
            <Input
              id={`horario-${item.id}`}
              name="horario"
              type="datetime-local"
              defaultValue={item.horarioLocal}
              className="h-10"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`titulo-${item.id}`}>Título</Label>
            <Input id={`titulo-${item.id}`} name="titulo" defaultValue={item.titulo} maxLength={255} className="h-10" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`descricao-${item.id}`}>Descrição</Label>
            <Textarea id={`descricao-${item.id}`} name="descricao" defaultValue={item.descricao ?? ""} maxLength={500} rows={3} />
          </div>
        </FormAcao>
      </DialogContent>
    </Dialog>
  );
}