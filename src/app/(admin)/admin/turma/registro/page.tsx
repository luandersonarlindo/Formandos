import type { Metadata } from "next";
import { RegistroTurma } from "@/components/features/registro-turma";
import { exigirAdmin } from "@/lib/dal";
import { getRegistroTurma } from "@/lib/registro";

export const metadata: Metadata = { title: "Registro da turma" };

// Registro da turma da comissão (ADR-0007). O mesmo conteúdo, sem mudança,
// fica para todo membro em /registro (ADR-0020).
export default async function RegistroTurmaPage() {
  const admin = await exigirAdmin();
  const r = await getRegistroTurma(admin);
  return <RegistroTurma r={r} voltar={{ href: "/admin/turma", rotulo: "Turma" }} />;
}
