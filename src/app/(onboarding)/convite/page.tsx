import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getVinculos } from "@/lib/dal";
import { codigoDoLink, COOKIE_CONVITE } from "@/lib/convite-link";
import { AVISO_INSTITUCIONAL } from "@/lib/empresa";
import {
  FormCriarTurma,
  FormEntrarConvite,
} from "@/components/features/convite-forms";

export const metadata: Metadata = { title: "Entrar em uma turma" };

export default async function ConvitePage(props: PageProps<"/convite">) {
  const jaTemTurma = (await getVinculos()).length > 0;
  // Código do link de convite (`?codigo=`) ou, se ele se perdeu no login, do
  // cookie de reserva gravado pelo proxy. Só preenche o campo: a pessoa ainda
  // toca em "Entrar na turma" (ADR-0002).
  const { codigo } = await props.searchParams;
  const codigoInicial =
    codigoDoLink(typeof codigo === "string" ? codigo : null) ??
    codigoDoLink((await cookies()).get(COOKIE_CONVITE)?.value);
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
        <p className="mx-auto mt-4 max-w-xl text-xs text-muted-foreground text-pretty">
          {AVISO_INSTITUCIONAL}
        </p>
      </div>
      <div data-grupo className="mt-10 grid gap-4 md:grid-cols-2">
        <FormEntrarConvite valorInicial={codigoInicial ?? undefined} />
        <FormCriarTurma />
      </div>
    </main>
  );
}
