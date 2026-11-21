import Link from "next/link";
import { redirect } from "next/navigation";
import { AnimarPagina } from "@/components/animacao/animar-pagina";
import { ShieldCheck } from "lucide-react";
import { AlternadorTema } from "@/components/features/alternador-tema";
import { BotaoSair } from "@/components/features/botao-sair";
import { LinkVoltar } from "@/components/features/link-voltar";
import { exigirSessao, getVinculos } from "@/lib/dal";
import { ehMaster } from "@/lib/master";
import { podeEntrarEmOutraTurma } from "@/lib/vinculos";

// Quem está logado e ainda não tem turma fica aqui. Quem já é administrador em
// alguma turma também pode vir, para entrar ou criar outra. Participantes com
// turma voltam para o dashboard.
export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await exigirSessao();
  const vinculos = await getVinculos();
  if (!podeEntrarEmOutraTurma(vinculos.map((v) => v.papel))) redirect("/dashboard");

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl 2xl:max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href={vinculos.length > 0 ? "/dashboard" : "/"} className="text-lg font-semibold tracking-tight">
            Formandos <span aria-hidden>🎓</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/conta"
              className="inline-flex items-center px-2 text-sm text-muted-foreground transition-colors hover:text-foreground pointer-coarse:min-h-11"
            >
              Minha conta
            </Link>
            <p className="hidden max-w-48 truncate text-sm text-muted-foreground sm:block">{user.email}</p>
            {/* Sem o menu da turma, o tema mora aqui (nas telas com turma ele
                fica no menu da pessoa). */}
            <AlternadorTema rotulo="Tema da página" />
            <BotaoSair />
          </div>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-4xl 2xl:max-w-6xl flex-1 flex-col p-4 md:p-8">
        {(vinculos.length > 0 || ehMaster(user)) && (
          <div className="mx-auto mb-6 flex w-full max-w-md flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            {vinculos.length > 0 && (
              <LinkVoltar href="/dashboard">Voltar para a turma</LinkVoltar>
            )}
            {/* O master gerencia a plataforma sem precisar de turma. */}
            {ehMaster(user) && (
              <Link
                href="/master"
                className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground pointer-coarse:min-h-11"
              >
                <ShieldCheck className="size-4" aria-hidden /> Ir para a gestão da plataforma
              </Link>
            )}
          </div>
        )}
        <AnimarPagina>{children}</AnimarPagina>
      </div>
    </div>
  );
}
