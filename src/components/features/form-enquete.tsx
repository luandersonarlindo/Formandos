"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { adicionarEnquete } from "@/actions/catalogos";
import type { EstadoForm } from "@/actions/tipos";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditorOpcoes } from "@/components/features/editor-opcoes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";

const inicial: EstadoForm = {};

// Uma pergunta só. A categoria vem no formulário, e não de uma lista de
// formulários repetidos: o servidor devolve `categoriaId` junto dos valores
// quando rejeita o envio, então a escolha sobrevive ao erro.
export function FormEnquete({
  categorias,
  categoriaFixa,
  aoSucesso,
}: {
  categorias: { id: string; nome: string }[];
  /** Temida por `catálogoId` + nome: o botão "Adicionar pergunta" da categoria
   *  sabe onde está, e a pessoa não precisa escolher num dropdown. */
  categoriaFixa?: { id: string; nome: string };
  /** Quem abre a pergunta num diálogo (dialogo-nova-pergunta) usa isto para
   *  fechar depois de salvar. Fora dele, não é preciso. */
  aoSucesso?: () => void;
}) {
  const [estado, acao, pendente] = useActionState(adicionarEnquete, inicial);
  const [tipo, setTipo] = useState<"unica" | "multipla">("unica");
  // Se houve erro, o servidor devolve o que foi digitado.
  const v = estado.valores;
  const [categoriaId, setCategoriaId] = useState(v?.categoriaId ?? categorias[0]?.id ?? "");
  const id = "enq";
  // Na edição em contexto a categoria é a do botão: fixa e já escolhida.
  const categoriaAtual = categoriaFixa?.id ?? categoriaId;

  // Fecha o diálogo logo após salvar, para a pessoa criar a próxima pergunta
  // sem clicar fora primeiro.
  const sucesso = useRef(aoSucesso);
  sucesso.current = aoSucesso;
  useEffect(() => {
    if (estado.ok) sucesso.current?.();
  }, [estado]);

  return (
    <form action={acao} className="grid gap-3">
      {categoriaFixa || categorias.length === 1 ? (
        <input
          type="hidden"
          name="categoriaId"
          value={categoriaFixa?.id ?? categorias[0].id}
        />
      ) : (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${id}-categoria`}>Categoria</Label>
          <NativeSelect
            id={`${id}-categoria`}
            name="categoriaId"
            value={categoriaAtual}
            onChange={(e) => setCategoriaId(e.target.value)}
          >
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </NativeSelect>
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${id}-titulo`}>Pergunta</Label>
        <Input id={`${id}-titulo`} name="titulo" defaultValue={v?.titulo} maxLength={500} required />
      </div>
      <fieldset className="flex flex-wrap gap-4 text-sm">
        <legend className="mb-1.5 text-sm font-medium">Tipo</legend>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="tipo"
            value="unica"
            checked={tipo === "unica"}
            onChange={() => setTipo("unica")}
            className="accent-[var(--vitrine-a)]"
          />
          Escolha única
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="tipo"
            value="multipla"
            checked={tipo === "multipla"}
            onChange={() => setTipo("multipla")}
            className="accent-[var(--vitrine-a)]"
          />
          Escolha múltipla
        </label>
      </fieldset>
      <div className="flex flex-col gap-1.5">
        <Label>Opções (de 2 a 12)</Label>
        <EditorOpcoes modo="nova" tipo={tipo} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm" disabled={pendente}>
          {pendente && <LoaderCircle className="animate-spin" aria-hidden />}
          {pendente ? "Adicionando…" : "Adicionar pergunta"}
        </Button>
        <p
          role="status"
          className={estado.erro ? "text-sm text-destructive" : "text-sm text-muted-foreground"}
        >
          {estado.erro ?? estado.ok}
        </p>
      </div>
    </form>
  );
}
