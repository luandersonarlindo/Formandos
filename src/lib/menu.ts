import {
  CalendarCheck,
  CircleHelp,
  ClipboardList,
  FileText,
  House,
  ListChecks,
  Landmark,
  Megaphone,
  Settings,
  Store,
  Users,
  Vote,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { Papel } from "@/lib/papeis";

export type ItemMenu = {
  href: string;
  rotulo: string;
  icone: LucideIcon;
  /** Só fica ativo com a URL exata (rotas "raiz", como /master). */
  exato?: boolean;
  /** Outras rotas que também acendem este item (abas que moram em outra URL). */
  tambem?: string[];
};

export type GrupoMenu = {
  /** Título do grupo na sidebar ("Comissão"). Sem título, é o grupo principal. */
  rotulo?: string;
  /** Grupo recolhível ("Mais"): começa fechado, a não ser que a página atual esteja nele. */
  recolhivel?: boolean;
  itens: ItemMenu[];
};

// Menu único da turma (ADR-0025, decisões D-01 e D-09 do plano de UX): o
// participante vê 5 itens e "Mais"; o admin vê o mesmo, mais o grupo
// "Comissão". Antes o admin tinha um segundo menu, em outra "área", e ia e
// voltava por "Administrar a turma" / "Voltar para a turma". As rotas e os
// guards (exigirAdmin, exigirTesouraria) não mudaram: o menu só mostra o
// caminho a quem já tem acesso.
export function menuDaTurma({ papel, tesouraria }: { papel: Papel; tesouraria: boolean }): GrupoMenu[] {
  const principal: ItemMenu[] = [
    { href: "/dashboard", rotulo: "Início", icone: House },
    // Votar e Resultados (/votacoes/relatorio) são abas desta tela.
    { href: "/votacoes", rotulo: "Votações", icone: Vote },
    { href: "/avisos", rotulo: "Avisos", icone: Megaphone },
    { href: "/duvidas", rotulo: "Dúvidas", icone: CircleHelp },
    // Observador não tem parcelas (ADR-0012).
    ...(papel === "observador" ? [] : [{ href: "/minha-situacao", rotulo: "Minha situação", icone: Wallet }]),
  ];
  const mais: ItemMenu[] = [
    { href: "/tarefas", rotulo: "Tarefas", icone: ClipboardList },
    { href: "/terceiros", rotulo: "Fornecedores", icone: Store },
    // ADR-0020: todo membro guarda o registro da turma, não só a comissão.
    { href: "/registro", rotulo: "Registro da turma", icone: FileText },
  ];
  const grupos: GrupoMenu[] = [{ itens: principal }, { rotulo: "Mais", recolhivel: true, itens: mais }];

  if (papel === "admin") {
    grupos.push({
      rotulo: "Comissão",
      itens: [
        { href: "/admin/membros", rotulo: "Membros", icone: Users },
        { href: "/admin/evento", rotulo: "Evento e presença", icone: CalendarCheck, tambem: ["/admin/presenca"] },
        { href: "/admin/votacoes", rotulo: "Catálogos", icone: ListChecks },
        // Tesouraria só aparece para quem é (ADR-0005).
        ...(tesouraria ? [{ href: "/admin/tesouraria", rotulo: "Tesouraria", icone: Landmark }] : []),
        { href: "/admin/turma", rotulo: "Turma", icone: Settings },
      ],
    });
  }
  return grupos;
}
