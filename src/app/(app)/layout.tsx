import {
  BarChart3,
  CircleHelp,
  ClipboardList,
  LayoutDashboard,
  Store,
  Vote,
} from "lucide-react";
import { AppShell, type ItemMenu } from "@/components/features/app-shell";
import { exigirMembro, exigirSessao, getSeletorTurmas } from "@/lib/dal";
import { ehMaster } from "@/lib/master";

const itens: ItemMenu[] = [
  { href: "/dashboard", rotulo: "Dashboard", icone: LayoutDashboard },
  { href: "/tarefas", rotulo: "Tarefas", icone: ClipboardList },
  { href: "/votacoes", rotulo: "Votações", icone: Vote, exato: true },
  { href: "/votacoes/relatorio", rotulo: "Relatório", icone: BarChart3 },
  { href: "/duvidas", rotulo: "Dúvidas", icone: CircleHelp },
  { href: "/terceiros", rotulo: "Terceiros", icone: Store },
];

// Exige login e turma (sem turma, vai para /convite).
// Layouts não são reexecutados a cada navegação: páginas e Server Actions
// também devem chamar exigirSessao().
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const { user } = await exigirSessao();
  const membro = await exigirMembro();

  return (
    <AppShell
      titulo={membro.turmaNome}
      turmas={await getSeletorTurmas(membro.turmaId)}
      itens={itens}
      arquivadaEm={membro.arquivadaEm?.toISOString() ?? null}
      usuario={{ nome: user.name, email: user.email, imagem: user.image }}
      rodape={[
        ...(membro.papel === "admin"
          ? [{ href: "/admin", rotulo: "Painel do administrador" }]
          : []),
        ...(ehMaster(user)
          ? [{ href: "/master", rotulo: "Gestão da plataforma" }]
          : []),
      ]}
    >
      {children}
    </AppShell>
  );
}
