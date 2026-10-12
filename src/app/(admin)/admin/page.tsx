import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Administração" };

// O resumo da turma ficou no dashboard, que já mostra os indicadores de
// gestão para quem é administrador. Esta rota antiga só redireciona quem
// ainda guardou o endereço.
export default function AdminPage() {
  redirect("/dashboard");
}