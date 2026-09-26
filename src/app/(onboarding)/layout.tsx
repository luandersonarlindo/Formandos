import Link from "next/link";
import { redirect } from "next/navigation";
import { AnimarPagina } from "@/components/animacao/animar-pagina";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { BotaoSair } from "@/components/features/botao-sair";
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
    <div className="vitrine-fundo-hero flex flex-1 flex-col">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl 2xl:max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href={vinculos.length > 0 ? "/dashboard" : "/"} className="text-lg font-semibold tracking-tight">
            Formandos <span aria-hidden>🎓</span>
          </Link>
          <div className="flex items-center gap-1">
            <p className="hidden max-w-48 truncate text-sm text-muted-foreground sm:block">{user.email}</p>
            <BotaoSair />
          </div>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-4xl 2xl:max-w-6xl flex-1 flex-col p-4 md:p-8">
        {(vinculos.length > 0 || ehMaster(user)) && (
          <div className="mb-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {vinculos.length > 0 && (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-4" aria-hidden /> Voltar para a turma
              </Link>
            )}
            {/* O master gerencia a plataforma sem precisar de turma. */}
            {ehMaster(user) && (
              <Link
                href="/master"
                className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
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
