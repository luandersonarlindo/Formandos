import { AbasRota } from "@/components/features/abas-rota";

// Abas da tesouraria (D-12 do plano de UX). Cada aba é uma rota: a lista de
// membros, que é a rotina, fica na raiz; plano, regras e importação (tarefas de
// uma vez só) e as saídas do caixa ganham a sua.
export function AbasTesouraria({ atual }: { atual: "membros" | "plano" | "saidas" }) {
  return (
    <AbasRota
      rotulo="Seções da tesouraria"
      abas={[
        { rotulo: "Membros", href: "/admin/tesouraria", ativa: atual === "membros" },
        { rotulo: "Plano e regras", href: "/admin/tesouraria/plano", ativa: atual === "plano" },
        { rotulo: "Saídas", href: "/admin/tesouraria/saidas", ativa: atual === "saidas" },
      ]}
    />
  );
}
