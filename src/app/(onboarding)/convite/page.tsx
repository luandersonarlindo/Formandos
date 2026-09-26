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
    <main id="conteudo" className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">
        {jaTemTurma ? "Entre em outra turma" : "Entre em uma turma"}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {jaTemTurma
          ? "Como administrador, você pode participar de mais de uma turma. Use um código de convite ou crie uma nova turma."
          : "Você precisa de uma turma para usar o Formandos. Use o código de convite do seu administrador ou crie uma nova turma."}
      </p>
      <div data-grupo className="mt-6 grid gap-4 md:grid-cols-2">
        <FormEntrarConvite />
        <FormCriarTurma />
      </div>
    </main>
  );
}
