"use client";

import { useActionState } from "react";
import { criarTurma, entrarPorConvite } from "@/actions/turmas";
import type { EstadoForm } from "@/actions/tipos";
import { CirclePlus, KeyRound, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const inicial: EstadoForm = {};

function Erro({ texto }: { texto?: string }) {
  if (!texto) return null;
  return (
    <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
      {texto}
    </p>
  );
}

function Icone({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1 flex size-10 items-center justify-center rounded-lg border bg-muted/50 text-[var(--vitrine-a)]">
      {children}
    </span>
  );
}

export function FormEntrarConvite() {
  const [estado, acao, pendente] = useActionState(entrarPorConvite, inicial);
  return (
    <Card className="vitrine-cartao py-5 [--card-spacing:--spacing(5)]">
      <form action={acao} className="flex flex-1 flex-col">
        <CardHeader>
          <Icone>
            <KeyRound className="size-5" aria-hidden />
          </Icone>
          <CardTitle className="text-lg">Tenho um código de convite</CardTitle>
          <CardDescription>
            Peça o código ao administrador da sua turma.
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-4 flex flex-col gap-2">
          <Label htmlFor="codigo">Código</Label>
          <Input
            id="codigo"
            name="codigo"
            autoComplete="off"
            autoCapitalize="characters"
            placeholder="K7QM4R2X"
            className="h-11 text-center font-mono text-lg tracking-[0.25em] uppercase placeholder:normal-case md:text-lg"
            required
          />
          <Erro texto={estado.erro} />
        </CardContent>
        <CardFooter className="mt-auto border-t-0 bg-transparent px-(--card-spacing) pt-4 pb-(--card-spacing)">
          <Button type="submit" disabled={pendente} className="h-10 w-full text-sm">
            {pendente && <LoaderCircle className="animate-spin" aria-hidden />}
            {pendente ? "Entrando…" : "Entrar na turma"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export function FormCriarTurma() {
  const [estado, acao, pendente] = useActionState(criarTurma, inicial);
  return (
    <Card className="vitrine-cartao py-5 [--card-spacing:--spacing(5)]">
      <form action={acao} className="flex flex-1 flex-col">
        <CardHeader>
          <Icone>
            <CirclePlus className="size-5" aria-hidden />
          </Icone>
          <CardTitle className="text-lg">Quero criar uma turma</CardTitle>
          <CardDescription>
            Você será o administrador e receberá um código para convidar os
            colegas.
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-4 flex flex-col gap-2">
          <Label htmlFor="nome">Nome da turma</Label>
          <Input
            id="nome"
            name="nome"
            maxLength={100}
            placeholder="Ex.: Engenharia 2026"
            className="h-11"
            required
          />
          <Erro texto={estado.erro} />
        </CardContent>
        <CardFooter className="mt-auto border-t-0 bg-transparent px-(--card-spacing) pt-4 pb-(--card-spacing)">
          <Button type="submit" disabled={pendente} className="h-10 w-full text-sm">
            {pendente && <LoaderCircle className="animate-spin" aria-hidden />}
            {pendente ? "Criando…" : "Criar turma"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
