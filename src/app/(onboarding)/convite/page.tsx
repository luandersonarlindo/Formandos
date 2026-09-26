import {
  FormCriarTurma,
  FormEntrarConvite,
} from "@/components/features/convite-forms";

export default function ConvitePage() {
  return (
    <main className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">
        Entre em uma turma
      </h1>
      <p className="mt-2 text-muted-foreground">
        Você precisa de uma turma para usar o Formandos. Use o código de convite
        do seu administrador ou crie uma nova turma.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <FormEntrarConvite />
        <FormCriarTurma />
      </div>
    </main>
  );
}
