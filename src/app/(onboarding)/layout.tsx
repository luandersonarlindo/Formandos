import { redirect } from "next/navigation";
import { exigirSessao, getMembro } from "@/lib/dal";

// Só quem está logado e ainda não tem turma fica aqui.
export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await exigirSessao();
  if (await getMembro()) redirect("/dashboard");
  return <div className="flex flex-1 flex-col p-4 md:p-8">{children}</div>;
}
