"use client";

import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";
import { ChevronDown, Ellipsis } from "lucide-react";
import { toast } from "sonner";
import type { EstadoForm } from "@/actions/tipos";
import { ConfirmarExclusao } from "@/components/features/confirmar-exclusao";
import { FormDialog } from "@/components/features/form-dialog";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Menu "⋯" das listas: uma ação visível na linha e o resto aqui (decisão D-05
// do plano de UX). Cada linha passa a ter uma parada de foco a mais, em vez de
// três ou quatro botões com texto.
//
// Como funciona: os filhos são declarados uma vez e renderizados em dois
// lugares. Dentro do DropdownMenuContent viram itens do menu; fora dele, viram
// os diálogos (e os forms de um clique) que esses itens abrem. Sem isso, o
// diálogo morreria junto com o menu, que desmonta ao fechar. Os filhos podem
// vir de um Server Component: só as props (texto, server action) atravessam.

type Modo = "menu" | "fora";
type Contexto = {
  modo: Modo;
  prefixo: string;
  ativo: string | null;
  abrir: (chave: string) => void;
  fechar: () => void;
};

const ContextoMenu = React.createContext<Contexto | null>(null);

function useMenu() {
  const ctx = React.useContext(ContextoMenu);
  if (!ctx) throw new Error("Ação fora de <MenuAcoes>");
  return ctx;
}

type MenuAcoesProps = {
  /** Nome do item da linha, para o leitor de tela: "Ações de Ana Souza". */
  nome: string;
  /** Texto visível ao lado do ícone (opcional). Sem ele, só "⋯". */
  rotulo?: string;
  icone?: React.ReactNode;
  className?: string;
  alinhar?: "start" | "end";
  children: React.ReactNode;
};

export function MenuAcoes({ nome, rotulo, icone, className, alinhar = "end", children }: MenuAcoesProps) {
  const prefixo = React.useId();
  const [ativo, setAtivo] = React.useState<string | null>(null);
  const base = { prefixo, ativo, abrir: setAtivo, fechar: () => setAtivo(null) };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant={rotulo ? "outline" : "ghost"}
            size={rotulo ? "sm" : "icon-sm"}
            aria-label={rotulo ? `${rotulo}: ${nome}` : `Ações de ${nome}`}
            title={rotulo ? undefined : `Ações de ${nome}`}
            className={cn("shrink-0", className)}
            data-menu-acoes={nome}
          >
            {icone ?? (rotulo ? null : <Ellipsis aria-hidden />)}
            {rotulo}
            {rotulo && <ChevronDown className="text-muted-foreground" aria-hidden />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={alinhar} className="min-w-44">
          <ContextoMenu.Provider value={{ ...base, modo: "menu" }}>{children}</ContextoMenu.Provider>
        </DropdownMenuContent>
      </DropdownMenu>
      <ContextoMenu.Provider value={{ ...base, modo: "fora" }}>{children}</ContextoMenu.Provider>
    </>
  );
}

/** Link (navegação ou download) dentro do menu. */
export function AcaoLink({
  href,
  icone,
  children,
  download,
  externo = false,
}: {
  href: string;
  icone?: React.ReactNode;
  children: React.ReactNode;
  /** Arquivo baixado por <a download>: não pode passar pelo <Link> do Next. */
  download?: boolean | string;
  externo?: boolean;
}) {
  const { modo } = useMenu();
  if (modo !== "menu") return null;
  return (
    <DropdownMenuItem asChild>
      {download !== undefined || externo ? (
        <a
          href={href}
          download={download === true ? "" : download || undefined}
          target={externo ? "_blank" : undefined}
          rel={externo ? "noreferrer" : undefined}
        >
          {icone}
          {children}
        </a>
      ) : (
        <Link href={href}>
          {icone}
          {children}
        </Link>
      )}
    </DropdownMenuItem>
  );
}

export function AcaoSeparador() {
  const { modo } = useMenu();
  return modo === "menu" ? <DropdownMenuSeparator /> : null;
}

type PropsFormDialog = React.ComponentProps<typeof FormDialog>;

/** Item que abre um FormDialog (editar, ajustar…). */
export function AcaoDialogo(
  props: Omit<PropsFormDialog, "aberto" | "onAbertoChange" | "semGatilho" | "variante" | "tamanho">,
) {
  const { modo, prefixo, ativo, abrir, fechar } = useMenu();
  const chave = `${prefixo}-d-${props.rotulo}`;
  if (modo === "menu") {
    return (
      <DropdownMenuItem onSelect={() => abrir(chave)}>
        {props.icone}
        {props.rotulo}
      </DropdownMenuItem>
    );
  }
  return (
    <FormDialog
      {...props}
      semGatilho
      aberto={ativo === chave}
      onAbertoChange={(aberto) => (aberto ? abrir(chave) : fechar())}
    />
  );
}

type PropsExcluir = React.ComponentProps<typeof ConfirmarExclusao>;

/** Item destrutivo com confirmação. Vai por último, depois de AcaoSeparador. */
export function AcaoExcluir(
  props: Omit<PropsExcluir, "aberto" | "onAbertoChange" | "semGatilho" | "somenteIcone" | "className">,
) {
  const { modo, prefixo, ativo, abrir, fechar } = useMenu();
  const chave = `${prefixo}-x-${props.rotulo}`;
  if (modo === "menu") {
    return (
      <DropdownMenuItem variant="destructive" onSelect={() => abrir(chave)}>
        {props.icone}
        {props.rotulo}
      </DropdownMenuItem>
    );
  }
  return (
    <ConfirmarExclusao
      {...props}
      semGatilho
      aberto={ativo === chave}
      onAbertoChange={(aberto) => (aberto ? abrir(chave) : fechar())}
    />
  );
}

const inicial: EstadoForm = {};

/**
 * Ação de um clique, sem formulário (pôr na tesouraria, reenviar convite…). O
 * form oculto fica fora do menu; o item só o envia. Sucesso e erro aparecem em
 * toast, porque não há campo onde mostrar o erro.
 */
export function AcaoForm({
  acao,
  campos,
  icone,
  children,
  destrutiva = false,
}: {
  acao: (estado: EstadoForm, formData: FormData) => Promise<EstadoForm | void>;
  campos: Record<string, string>;
  icone?: React.ReactNode;
  children: React.ReactNode;
  destrutiva?: boolean;
}) {
  const { modo, prefixo } = useMenu();
  const id = `${prefixo}-f-${Object.values(campos).join("-")}-${String(children)}`.replace(/[^\w-]/g, "");
  const [estado, formAcao, pendente] = useActionState(async (anterior: EstadoForm, dados: FormData) => {
    const r = await acao(anterior, dados);
    return r && typeof r === "object" ? r : { ok: "Feito." };
  }, inicial);

  React.useEffect(() => {
    if (modo !== "fora") return;
    if (estado.ok) toast.success(estado.ok);
    if (estado.erro) toast.error(estado.erro);
  }, [estado, modo]);

  if (modo === "menu") {
    return (
      <DropdownMenuItem
        variant={destrutiva ? "destructive" : "default"}
        onSelect={() => (document.getElementById(id) as HTMLFormElement | null)?.requestSubmit()}
      >
        {icone}
        {children}
      </DropdownMenuItem>
    );
  }
  return (
    <form id={id} action={formAcao} hidden aria-busy={pendente}>
      {Object.entries(campos).map(([nome, valor]) => (
        <input key={nome} type="hidden" name={nome} value={valor} />
      ))}
    </form>
  );
}

/**
 * Ação de um clique que pede confirmação, sem ser destrutiva (promover, tornar
 * participante, pôr na tesouraria). Abre um AlertDialog com "Cancelar" e o
 * botão de confirmar; sucesso e erro em toast.
 */
export function AcaoConfirmar({
  acao,
  campos,
  icone,
  rotulo,
  titulo,
  descricao,
  confirmar,
}: {
  acao: (estado: EstadoForm, formData: FormData) => Promise<EstadoForm | void>;
  campos: Record<string, string>;
  icone?: React.ReactNode;
  /** Texto do item no menu. */
  rotulo: string;
  titulo: string;
  descricao?: React.ReactNode;
  /** Texto do botão de confirmar: "Sim, promover". */
  confirmar: string;
}) {
  const { modo, prefixo, ativo, abrir, fechar } = useMenu();
  const chave = `${prefixo}-c-${rotulo}`;
  const [estado, formAcao, pendente] = useActionState(async (anterior: EstadoForm, dados: FormData) => {
    const r = await acao(anterior, dados);
    return r && typeof r === "object" ? r : { ok: "Feito." };
  }, inicial);

  React.useEffect(() => {
    if (modo !== "fora") return;
    if (estado.ok) {
      toast.success(estado.ok);
      fechar();
    }
    if (estado.erro) toast.error(estado.erro);
    // fechar muda a cada render; só o estado importa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado, modo]);

  if (modo === "menu") {
    return (
      <DropdownMenuItem onSelect={() => abrir(chave)}>
        {icone}
        {rotulo}
      </DropdownMenuItem>
    );
  }
  return (
    <AlertDialog open={ativo === chave} onOpenChange={(a) => (a ? abrir(chave) : fechar())}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{titulo}</AlertDialogTitle>
          {descricao ? <AlertDialogDescription>{descricao}</AlertDialogDescription> : null}
        </AlertDialogHeader>
        <form action={formAcao}>
          {Object.entries(campos).map(([nome, valor]) => (
            <input key={nome} type="hidden" name={nome} value={valor} />
          ))}
          <AlertDialogFooter>
            <Button type="button" variant="outline" disabled={pendente} onClick={fechar}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pendente}>
              {pendente && <Spinner />}
              {confirmar}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
