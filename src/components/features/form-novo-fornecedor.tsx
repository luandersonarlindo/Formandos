"use client";

import { useActionState } from "react";
import { criarFornecedor } from "@/actions/terceiros";
import type { EstadoForm } from "@/actions/tipos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";

const inicial: EstadoForm = {};

export function FormNovoFornecedor({ categorias }: { categorias: readonly string[] }) {
  const [estado, acao, pendente] = useActionState(criarFornecedor, inicial);

  return (
    <form action={acao} className="grid gap-3 md:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nome">Nome</Label>
        <Input id="nome" name="nome" maxLength={255} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="categoria">Categoria</Label>
        <NativeSelect id="categoria" name="categoria" defaultValue="" required>
          <option value="" disabled>
            Escolha…
          </option>
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-1.5 md:col-span-2">
        <Label htmlFor="descricao">Descrição (opcional)</Label>
        <Textarea id="descricao" name="descricao" rows={2} maxLength={1000} />
      </div>
      <div className="flex flex-col gap-1.5 md:col-span-2">
        <Label htmlFor="contato">Contato (opcional)</Label>
        <Input
          id="contato"
          name="contato"
          maxLength={255}
          placeholder="Telefone, e-mail ou endereço do site"
        />
      </div>
      <div className="flex items-center gap-3 md:col-span-2">
        <Button type="submit" disabled={pendente}>
          {pendente ? "Adicionando…" : "Adicionar fornecedor"}
        </Button>
        <p
          role="status"
          className={
            estado.erro
              ? "text-sm text-destructive"
              : "text-sm text-muted-foreground"
          }
        >
          {estado.erro ?? estado.ok}
        </p>
      </div>
    </form>
  );
}
