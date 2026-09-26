import type { Metadata } from "next";
import { getVinculos } from "@/lib/dal";
import {
  FormCriarTurma,
  FormEntrarConvite,
} from "@/components/features/convite-forms";

export const metadata: Metadata = { title: "Entrar em uma turma" };

export default async function ConvitePage() {
  const jaTemTurma = (await getVinculos()).length > 0;
  return (
    <main id="conteudo" tabIndex={-1} className="w-full outline-none">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium tracking-wide text-[var(--vitrine-a)] uppercase">
          {jaTemTurma ? "Mais uma turma" : "Vamos começar"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance md:text-4xl">
          {jaTemTurma ? "Entre em outra turma" : "Entre em uma turma"}
        </h1>
        <p className="mt-3 text-muted-foreground text-pretty">
          {jaTemTurma
            ? "Como administrador, você pode participar de mais de uma turma. Use um código de convite ou crie uma nova turma."
            : "Você precisa de uma turma para usar o Formandos. Use o código de convite do seu administrador ou crie uma nova turma."}
        </p>
      </div>
      <div data-grupo className="mt-10 grid gap-4 md:grid-cols-2">
        <FormEntrarConvite />
        <FormCriarTurma />
      </div>
    </main>
  );
}
