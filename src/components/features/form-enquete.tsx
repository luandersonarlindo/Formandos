"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { adicionarEnquete } from "@/actions/catalogos";
import type { EstadoForm } from "@/actions/tipos";
import { Button } from "@/components/ui/button";
import { EditorOpcoes } from "@/components/features/editor-opcoes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Tipo = "unica" | "multipla";

// Tipo da pergunta, igual ao criar e ao editar: duas opções viram ToggleGroup
// (kit do plano de UX), com 44px no toque. Os rádios nativos não tinham área de
// toque e a edição usava um NativeSelect. O valor vai num campo oculto `tipo`.
export function CampoTipo({
  valor,
  aoMudar,
  id = "tipo",
}: {
  valor?: Tipo;
  aoMudar?: (tipo: Tipo) => void;
  id?: string;
}) {
  const [aqui, setAqui] = useState<Tipo>(valor ?? "unica");
  const atual = aoMudar ? (valor ?? "unica") : aqui;
  return (
    <div role="group" aria-labelledby={`${id}-rotulo`} className="flex flex-col gap-1.5">
      <span id={`${id}-rotulo`} className="text-sm font-medium">
        Tipo
      </span>
      <ToggleGroup
        type="single"
        variant="outline"
        value={atual}
        onValueChange={(v) => {
          if (v !== "unica" && v !== "multipla") return; // clicar no marcado não desmarca
          setAqui(v);
          aoMudar?.(v);
        }}
        className="w-full sm:w-fit"
      >
        <ToggleGroupItem value="unica" className="flex-1 px-3 pointer-coarse:h-11">
          Escolha única
        </ToggleGroupItem>
        <ToggleGroupItem value="multipla" className="flex-1 px-3 pointer-coarse:h-11">
          Escolha múltipla
        </ToggleGroupItem>
      </ToggleGroup>
      <input type="hidden" name="tipo" value={atual} />
    </div>
  );
}

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
   *  fechar depois de salvar e avisar qual pergunta foi criada. */
  aoSucesso?: (id?: string) => void;
}) {
  const [estado, acao, pendente] = useActionState(adicionarEnquete, inicial);
  const [tipo, setTipo] = useState<Tipo>("unica");
  // Se houve erro, o servidor devolve o que foi digitado.
  const v = estado.valores;
  const [categoriaId, setCategoriaId] = useState(v?.categoriaId ?? categorias[0]?.id ?? "");
  const id = "enq";
  // Na edição em contexto a categoria é a do botão: fixa e já escolhida.
  const categoriaAtual = categoriaFixa?.id ?? categoriaId;

  // Fecha o diálogo logo após salvar, para a pessoa criar a próxima pergunta
  // sem clicar fora primeiro. O id volta do servidor para a página rolar até a
  // pergunta nova.
  const sucesso = useRef(aoSucesso);
  sucesso.current = aoSucesso;
  useEffect(() => {
    if (estado.ok) sucesso.current?.(estado.id);
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
        <Input id={`${id}-titulo`} name="titulo" defaultValue={v?.titulo} minLength={5} maxLength={500} required />
      </div>
      <CampoTipo valor={tipo} aoMudar={setTipo} id={`${id}-tipo`} />
      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 p-0 text-sm font-medium">Opções (de 2 a 12)</legend>
        <EditorOpcoes modo="nova" tipo={tipo} />
      </fieldset>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm" disabled={pendente}>
          {pendente && <Spinner />}
          {pendente ? "Adicionando…" : "Adicionar pergunta"}
        </Button>
        <p
          role={estado.erro ? "alert" : "status"}
          className={estado.erro ? "text-sm text-destructive" : "text-sm text-muted-foreground"}
        >
          {estado.erro ?? estado.ok}
        </p>
      </div>
    </form>
  );
}
