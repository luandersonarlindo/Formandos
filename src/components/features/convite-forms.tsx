"use client";

import { useActionState } from "react";
import { ChevronDown } from "lucide-react";
import { criarTurma, entrarPorConvite } from "@/actions/turmas";
import type { EstadoForm } from "@/actions/tipos";
import { PainelRecolhivel } from "@/components/features/painel-recolhivel";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

const inicial: EstadoForm = {};

function Erro({ texto }: { texto?: string }) {
  if (!texto) return null;
  return (
    <Alert variant="destructive">
      <AlertDescription>{texto}</AlertDescription>
    </Alert>
  );
}

// O código é o caminho comum (P-21): é o único Card da tela e o único botão
// primário. Com o link de convite, o título já diz de qual turma é e o campo
// vem preenchido; a pessoa só confirma.
export function FormEntrarConvite({
  valorInicial,
  convite,
}: {
  valorInicial?: string;
  convite?: { turma: string; criador: string | null } | null;
}) {
  const [estado, acao, pendente] = useActionState(entrarPorConvite, inicial);
  return (
    <Card>
      <form action={acao} className="flex flex-col gap-4">
        <CardHeader>
          <CardTitle className="text-lg">{convite ? "Entrar na turma" : "Tenho um código de convite"}</CardTitle>
          <CardDescription className="text-pretty">
            {convite ? (
              <>
                Você foi convidado para a turma{" "}
                <strong className="font-semibold text-foreground">{convite.turma}</strong>
                {convite.criador && <>, criada por {convite.criador}</>}.
              </>
            ) : valorInicial ? (
              "Confira o código do seu link e toque em Entrar na turma."
            ) : (
              "Peça o código à comissão da sua turma."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="codigo">Código</FieldLabel>
            <Input
              id="codigo"
              name="codigo"
              autoComplete="off"
              autoCapitalize="characters"
              placeholder="K7QM4R2X"
              defaultValue={valorInicial}
              className="h-11 text-center font-mono text-lg tracking-[0.25em] uppercase placeholder:normal-case md:text-lg"
              required
            />
          </Field>
          <Erro texto={estado.erro} />
          <Button type="submit" disabled={pendente} className="h-10 w-full text-sm">
            {pendente && <Spinner />}
            {pendente ? "Entrando…" : "Entrar na turma"}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}

// Criar turma é o caso raro (só a comissão, uma vez): fica recolhido, para o
// participante convidado não criar uma turma por engano.
export function FormCriarTurma({ abertoInicial = false }: { abertoInicial?: boolean }) {
  const [estado, acao, pendente] = useActionState(criarTurma, inicial);
  return (
    <PainelRecolhivel abertoInicial={abertoInicial} className="group/criar rounded-xl border">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-xl px-4 py-3 text-sm font-medium pointer-coarse:min-h-11 [&::-webkit-details-marker]:hidden">
        Quer criar uma turma nova?
        <ChevronDown
          className="size-4 text-muted-foreground transition-transform group-open/criar:rotate-180"
          aria-hidden
        />
      </summary>
      <form action={acao} className="flex flex-col gap-4 border-t p-4">
        <Field>
          <FieldLabel htmlFor="nome">Nome da turma</FieldLabel>
          <Input
            id="nome"
            name="nome"
            minLength={3}
            maxLength={100}
            placeholder="Ex.: Engenharia 2026"
            className="h-10"
            required
          />
          <FieldDescription className="text-xs">
            Para a comissão: você vira administrador e recebe um código para convidar a turma.
          </FieldDescription>
        </Field>
        <Erro texto={estado.erro} />
        <Button type="submit" variant="outline" disabled={pendente} className="h-10 w-full text-sm">
          {pendente && <Spinner />}
          {pendente ? "Criando…" : "Criar turma"}
        </Button>
      </form>
    </PainelRecolhivel>
  );
}
