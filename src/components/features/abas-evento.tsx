import { AbasRota } from "@/components/features/abas-rota";

// Abas de "Evento e presença" da comissão (D-08 do plano de UX). Cada aba é uma
// rota: /admin/evento (dados e programação) e /admin/presenca (respostas e regras).
export function AbasEvento({ atual }: { atual: "evento" | "presenca" }) {
  return (
    <AbasRota
      rotulo="Seções do evento"
      abas={[
        { rotulo: "Dados e programação", href: "/admin/evento", ativa: atual === "evento" },
        { rotulo: "Presença", href: "/admin/presenca", ativa: atual === "presenca" },
      ]}
    />
  );
}
