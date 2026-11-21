import { AbasRota } from "@/components/features/abas-rota";

// Abas da área "Turma" (P-12): esta e o histórico. O registro em PDF é um
// link para /registro, igual para todo membro (ADR-0020).
export function AbasTurma({ atual }: { atual: "turma" | "historico" }) {
  return (
    <AbasRota
      rotulo="Seções da turma"
      className="mt-4"
      abas={[
        { rotulo: "Turma", href: "/admin/turma", ativa: atual === "turma" },
        { rotulo: "Histórico", href: "/admin/turma/historico", ativa: atual === "historico" },
      ]}
    />
  );
}
