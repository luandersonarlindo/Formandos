import type { Metadata } from "next";
import { RegistroTurma } from "@/components/features/registro-turma";
import { exigirMembro } from "@/lib/dal";
import { getRegistroTurma } from "@/lib/registro";

export const metadata: Metadata = { title: "Registro da turma" };

// Registro da turma para todo membro (ADR-0020): a prova do que a turma
// decidiu não depende de pedir à comissão. O conteúdo é o mesmo da comissão e
// não tem dado pessoal (quem votou em quê, quem vai, quanto cada um pagou).
export default async function RegistroPage() {
  const membro = await exigirMembro();
  const r = await getRegistroTurma(membro);
  return <RegistroTurma r={r} voltar={{ href: "/dashboard", rotulo: "Início" }} />;
}
