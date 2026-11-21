"use client";

import * as React from "react";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Ellipsis } from "lucide-react";
import { toast } from "sonner";
import type { EstadoForm } from "@/actions/tipos";
import { ConfirmarExclusao } from "@/components/features/confirmar-exclusao";
import { FormDialog } from "@/components/features/form-dialog";
import { PreviaEnquete } from "@/components/features/previa-enquete";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";

// Menu "⋯" das linhas de gestão que o MenuAcoes do kit não cobre: membros,
// categorias e perguntas do catálogo (D-05 do plano de UX). Dois motivos para
// um menu próprio:
//
// - Trocar papel e mexer na tesouraria pedem confirmação em AlertDialog (P-16),
//   porque a action não tem "desfazer" — mas não são exclusões, então o botão
//   não pode ser vermelho nem dizer "Excluindo…".
// - Subir e descer reordenam a lista inteira. O foco volta para o "⋯" da linha
//   que andou e a nova posição é dita em voz alta (era o que o BotaoMover fazia
//   com o próprio botão, que agora mora dentro do menu e some ao fechar).
//
// Mesma anatomia do MenuAcoes: o gatilho tem data-menu-acoes={nome} (os testes
// abrem por aí) e os diálogos ficam fora do menu, que desmonta ao fechar.

type AcaoEstado = (estado: EstadoForm, formData: FormData) => Promise<EstadoForm>;

export type ConfirmacaoMenu = {
  /** Texto do item do menu. */
  rotulo: string;
  titulo: string;
  descricao: string;
  acao: AcaoEstado;
  campos: Record<string, string>;
  /** Texto do botão que confirma. */
  confirmar: string;
};

export type EdicaoMenu = {
  rotulo: string;
  titulo: string;
  descricao?: string;
  acao: AcaoEstado;
  campos?: Record<string, string>;
  rotuloSubmit?: string;
  dialogClassName?: string;
  conteudo: React.ReactNode;
};

export type MoverMenu = {
  acao: AcaoEstado;
  tipo: "categoria" | "pergunta";
  id: string;
  podeSubir: boolean;
  podeDescer: boolean;
};

/** Ação de um clique, sem diálogo (ocultar ou mostrar uma pergunta). */
export type SimplesMenu = {
  rotulo: string;
  acao: AcaoEstado;
  campos: Record<string, string>;
};

type PropsExcluir = Omit<
  React.ComponentProps<typeof ConfirmarExclusao>,
  "aberto" | "onAbertoChange" | "semGatilho" | "somenteIcone" | "className"
>;

type PropsPrevia = React.ComponentProps<typeof PreviaEnquete>;

const inicial: EstadoForm = {};
const semAcao: AcaoEstado = async (estado) => estado;

export function MenuGestao({
  nome,
  editar,
  previa,
  mover,
  confirmacoes = [],
  simples = [],
  excluir,
}: {
  /** Nome do item da linha: "Ações de Ana Souza". */
  nome: string;
  editar?: EdicaoMenu;
  previa?: Omit<PropsPrevia, "aberto" | "onAbertoChange">;
  mover?: MoverMenu;
  confirmacoes?: ConfirmacaoMenu[];
  simples?: SimplesMenu[];
  /** Destrutivo: vai por último, depois do separador. */
  excluir?: PropsExcluir;
}) {
  const [ativo, setAtivo] = useState<string | null>(null);
  const prefixo = React.useId().replace(/[^\w-]/g, "");
  const gatilho = useRef<HTMLButtonElement>(null);
  const [anuncio, setAnuncio] = useState("");
  const [estadoMover, moverAcao, movendo] = useActionState(mover?.acao ?? semAcao, inicial);

  useEffect(() => {
    if (estadoMover.ok) {
      setAnuncio(estadoMover.ok);
      // A lista foi redesenhada na nova ordem; o "⋯" desta linha continua o
      // mesmo nó (a chave é o id), então o foco volta para ele.
      gatilho.current?.focus();
    }
    if (estadoMover.erro) toast.error(estadoMover.erro);
  }, [estadoMover]);

  function moverPara(direcao: "cima" | "baixo") {
    if (!mover) return;
    const dados = new FormData();
    dados.set(mover.tipo === "categoria" ? "categoriaId" : "enqueteId", mover.id);
    dados.set("direcao", direcao);
    startTransition(() => moverAcao(dados));
  }

  const fechar = () => setAtivo(null);
  const temItens =
    !!editar || !!previa || (mover && (mover.podeSubir || mover.podeDescer)) || confirmacoes.length > 0 || simples.length > 0;

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            ref={gatilho}
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Ações de ${nome}`}
            title={`Ações de ${nome}`}
            className="shrink-0"
            data-menu-acoes={nome}
            disabled={movendo}
          >
            {movendo ? <Spinner /> : <Ellipsis aria-hidden />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-48">
          {editar && <DropdownMenuItem onSelect={() => setAtivo("editar")}>{editar.rotulo}</DropdownMenuItem>}
          {previa && <DropdownMenuItem onSelect={() => setAtivo("previa")}>Ver como o formando vê</DropdownMenuItem>}
          {mover?.podeSubir && (
            <DropdownMenuItem onSelect={() => moverPara("cima")}>
              <ArrowUp aria-hidden /> Subir
            </DropdownMenuItem>
          )}
          {mover?.podeDescer && (
            <DropdownMenuItem onSelect={() => moverPara("baixo")}>
              <ArrowDown aria-hidden /> Descer
            </DropdownMenuItem>
          )}
          {confirmacoes.map((c) => (
            <DropdownMenuItem key={c.rotulo} onSelect={() => setAtivo(`c-${c.rotulo}`)}>
              {c.rotulo}
            </DropdownMenuItem>
          ))}
          {simples.map((f, i) => (
            <DropdownMenuItem
              key={f.rotulo}
              onSelect={() => (document.getElementById(`${prefixo}-s${i}`) as HTMLFormElement | null)?.requestSubmit()}
            >
              {f.rotulo}
            </DropdownMenuItem>
          ))}
          {excluir && (
            <>
              {temItens && <DropdownMenuSeparator />}
              <DropdownMenuItem variant="destructive" onSelect={() => setAtivo("excluir")}>
                {excluir.icone}
                {excluir.rotulo}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Existe desde o começo (vazia): o leitor de tela anuncia quando muda. */}
      <span role="status" aria-live="polite" className="sr-only">
        {anuncio}
      </span>

      {editar && (
        <FormDialog
          rotulo={editar.rotulo}
          titulo={editar.titulo}
          descricao={editar.descricao}
          acao={editar.acao}
          campos={editar.campos}
          rotuloSubmit={editar.rotuloSubmit}
          dialogClassName={editar.dialogClassName}
          semGatilho
          aberto={ativo === "editar"}
          onAbertoChange={(a) => (a ? setAtivo("editar") : fechar())}
        >
          {editar.conteudo}
        </FormDialog>
      )}
      {previa && (
        <PreviaEnquete
          {...previa}
          aberto={ativo === "previa"}
          onAbertoChange={(a) => (a ? setAtivo("previa") : fechar())}
        />
      )}
      {confirmacoes.map((c) => (
        <DialogoConfirmar
          key={c.rotulo}
          {...c}
          aberto={ativo === `c-${c.rotulo}`}
          onAbertoChange={(a) => (a ? setAtivo(`c-${c.rotulo}`) : fechar())}
        />
      ))}
      {simples.map((f, i) => (
        <FormSimples key={f.rotulo} id={`${prefixo}-s${i}`} {...f} />
      ))}
      {excluir && (
        <ConfirmarExclusao
          {...excluir}
          semGatilho
          aberto={ativo === "excluir"}
          onAbertoChange={(a) => (a ? setAtivo("excluir") : fechar())}
        />
      )}
    </>
  );
}

// Confirmação de uma mudança sem volta que não apaga nada (trocar papel,
// tesouraria). AlertDialog: foco inicial em "Cancelar", Esc fecha. O erro do
// servidor ("tem pagamentos lançados") fica no próprio diálogo.
function DialogoConfirmar({
  titulo,
  descricao,
  acao,
  campos,
  confirmar,
  aberto,
  onAbertoChange,
}: ConfirmacaoMenu & { aberto: boolean; onAbertoChange: (aberto: boolean) => void }) {
  const [estado, formAcao, pendente] = useActionState(acao, inicial);
  const fechar = useRef(onAbertoChange);
  fechar.current = onAbertoChange;

  useEffect(() => {
    if (!estado.ok) return;
    toast.success(estado.ok);
    fechar.current(false);
  }, [estado]);

  return (
    <AlertDialog open={aberto} onOpenChange={onAbertoChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{titulo}</AlertDialogTitle>
          <AlertDialogDescription className="text-pretty">{descricao}</AlertDialogDescription>
        </AlertDialogHeader>
        <form action={formAcao} className="flex flex-col gap-3">
          {Object.entries(campos).map(([nome, valor]) => (
            <input key={nome} type="hidden" name={nome} value={valor} />
          ))}
          {estado.erro && (
            <p role="alert" className="text-sm text-destructive">
              {estado.erro}
            </p>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" disabled={pendente} onClick={() => onAbertoChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pendente}>
              {pendente && <Spinner />}
              {pendente ? "Salvando…" : confirmar}
            </Button>
          </div>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// O form oculto da ação de um clique fica fora do menu (que desmonta ao
// fechar); o item só o envia. Sem campo onde mostrar, sucesso e erro vão em toast.
function FormSimples({ id, acao, campos }: SimplesMenu & { id: string }) {
  const [estado, formAcao, pendente] = useActionState(acao, inicial);
  useEffect(() => {
    if (estado.ok) toast.success(estado.ok);
    if (estado.erro) toast.error(estado.erro);
  }, [estado]);
  return (
    <form id={id} action={formAcao} hidden aria-busy={pendente}>
      {Object.entries(campos).map(([nome, valor]) => (
        <input key={nome} type="hidden" name={nome} value={valor} />
      ))}
    </form>
  );
}
