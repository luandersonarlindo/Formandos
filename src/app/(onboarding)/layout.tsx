import Link from "next/link";
import { redirect } from "next/navigation";
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
    <div className="flex flex-1 flex-col p-4 md:p-8">
      <div className="mb-4 flex flex-wrap gap-4 text-sm">
        {vinculos.length > 0 && (
          <Link href="/dashboard" className="underline underline-offset-4">
            ← Voltar para a turma
          </Link>
        )}
        {/* O master gerencia a plataforma sem precisar de turma. */}
        {ehMaster(user) && (
          <Link href="/master" className="underline underline-offset-4">
            Ir para a gestão da plataforma
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}
