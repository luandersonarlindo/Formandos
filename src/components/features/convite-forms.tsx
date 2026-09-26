"use client";

import { useActionState } from "react";
import { criarTurma, entrarPorConvite } from "@/actions/turmas";
import type { EstadoForm } from "@/actions/tipos";
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
    <p role="alert" className="text-sm text-destructive">
      {texto}
    </p>
  );
}

export function FormEntrarConvite() {
  const [estado, acao, pendente] = useActionState(entrarPorConvite, inicial);
  return (
    <Card>
      <form action={acao}>
        <CardHeader>
          <CardTitle>Tenho um código de convite</CardTitle>
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
            placeholder="Ex.: K7QM4R2X"
            required
          />
          <Erro texto={estado.erro} />
        </CardContent>
        <CardFooter className="mt-4">
          <Button type="submit" disabled={pendente}>
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
    <Card>
      <form action={acao}>
        <CardHeader>
          <CardTitle>Quero criar uma turma</CardTitle>
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
            required
          />
          <Erro texto={estado.erro} />
        </CardContent>
        <CardFooter className="mt-4">
          <Button type="submit" disabled={pendente}>
            {pendente ? "Criando…" : "Criar turma"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
