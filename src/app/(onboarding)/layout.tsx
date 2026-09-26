import Link from "next/link";
import { redirect } from "next/navigation";
import { exigirSessao, getMembro } from "@/lib/dal";
import { ehMaster } from "@/lib/master";

// Só quem está logado e ainda não tem turma fica aqui.
export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await exigirSessao();
  if (await getMembro()) redirect("/dashboard");
  return (
    <div className="flex flex-1 flex-col p-4 md:p-8">
      {/* O master gerencia a plataforma sem precisar de turma. */}
      {ehMaster(user) && (
        <Link href="/master" className="mb-4 w-fit text-sm underline underline-offset-4">
          Ir para a gestão da plataforma
        </Link>
      )}
      {children}
    </div>
  );
}
