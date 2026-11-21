import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { getUsuarioAtual, getVinculos } from "@/lib/dal";
import { getTurmaDoConvite } from "@/lib/convite-turma";
import { codigoDoLink, COOKIE_CONVITE } from "@/lib/convite-link";
import { AVISO_INSTITUCIONAL } from "@/lib/empresa";
import {
  FormCriarTurma,
  FormEntrarConvite,
} from "@/components/features/convite-forms";

export const metadata: Metadata = { title: "Entrar em uma turma" };

export default async function ConvitePage(props: PageProps<"/convite">) {
  const jaTemTurma = (await getVinculos()).length > 0;
  const { codigo, criar } = await props.searchParams;
  // `?criar=1` vem do link "Quer criar uma turma nova?" abaixo do convite:
  // ignora o código (inclusive o do cookie, que dura dias) e abre o formulário.
  const querCriar = criar === "1";
  // Código do link de convite (`?codigo=`) ou, se ele se perdeu no login, do
  // cookie de reserva gravado pelo proxy. Só preenche o campo: a pessoa ainda
  // toca em "Entrar na turma" (ADR-0002).
  const codigoInicial = querCriar
    ? null
    : (codigoDoLink(typeof codigo === "string" ? codigo : null) ??
      codigoDoLink((await cookies()).get(COOKIE_CONVITE)?.value));
  // ADR-0020: com o código do link, diz de qual turma é o convite. Código
  // digitado no campo nunca passa por aqui.
  const convite = codigoInicial
    ? await getTurmaDoConvite(codigoInicial, (await getUsuarioAtual()).id)
    : null;

  return (
    <main id="conteudo" tabIndex={-1} className="mx-auto w-full max-w-md outline-none">
      <h1 className="text-2xl font-semibold tracking-tight text-balance md:text-3xl">
        {jaTemTurma ? "Entre em outra turma" : "Entre na sua turma"}
      </h1>
      <p className="mt-1 text-muted-foreground text-pretty">
        {jaTemTurma
          ? "Como administrador, você pode participar de mais de uma turma."
          : "Use o código de convite que a comissão mandou."}
      </p>

      <div data-grupo className="mt-6 flex flex-col gap-4">
        <FormEntrarConvite valorInicial={codigoInicial ?? undefined} convite={convite} />
        {/* Com o código do link, a tela tem uma ação só: entrar. Criar turma
            continua possível, mas como link discreto que tira o código. */}
        {codigoInicial ? (
          <p className="text-center text-sm text-muted-foreground">
            <Link
              href="/convite?criar=1"
              className="inline-flex items-center underline underline-offset-4 hover:text-foreground pointer-coarse:min-h-11"
            >
              Quer criar uma turma nova?
            </Link>
          </p>
        ) : (
          <FormCriarTurma abertoInicial={querCriar} />
        )}
      </div>

      <p className="mt-10 text-xs text-muted-foreground text-pretty">{AVISO_INSTITUCIONAL}</p>
    </main>
  );
}
