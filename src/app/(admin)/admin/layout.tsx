import {
  CalendarDays,
  CircleHelp,
  Settings,
  KeyRound,
  LayoutDashboard,
  Users,
  Vote,
} from "lucide-react";
import { AppShell, type ItemMenu } from "@/components/features/app-shell";
import { exigirAdmin, exigirSessao, getSeletorTurmas } from "@/lib/dal";
import { ehMaster } from "@/lib/master";

const itens: ItemMenu[] = [
  { href: "/admin", rotulo: "Resumo", icone: LayoutDashboard, exato: true },
  { href: "/admin/membros", rotulo: "Membros", icone: Users },
  { href: "/admin/convite", rotulo: "Convite", icone: KeyRound },
  { href: "/admin/evento", rotulo: "Evento", icone: CalendarDays },
  { href: "/admin/duvidas", rotulo: "Dúvidas", icone: CircleHelp },
  { href: "/admin/votacoes", rotulo: "Votações", icone: Vote },
  { href: "/admin/turma", rotulo: "Turma", icone: Settings },
];

// Exige login, turma e papel de administrador.
// Layouts não são reexecutados a cada navegação: páginas e Server Actions
// também devem chamar exigirSessao().
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const { user } = await exigirSessao();
  const membro = await exigirAdmin();

  return (
    <AppShell
      titulo={`Administração · ${membro.turmaNome}`}
      turmas={await getSeletorTurmas(membro.turmaId)}
      itens={itens}
      arquivadaEm={membro.arquivadaEm?.toISOString() ?? null}
      usuario={{ nome: user.name, email: user.email, imagem: user.image }}
      rodape={[
        { href: "/dashboard", rotulo: "Voltar para a turma" },
        ...(ehMaster(user)
          ? [{ href: "/master", rotulo: "Gestão da plataforma" }]
          : []),
        { href: "/conta", rotulo: "Minha conta" },
      ]}
    >
      {children}
    </AppShell>
  );
}
