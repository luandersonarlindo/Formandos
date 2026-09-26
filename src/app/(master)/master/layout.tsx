import { LayoutDashboard, School, Users } from "lucide-react";
import { AppShell, type ItemMenu } from "@/components/features/app-shell";
import { exigirMaster } from "@/lib/dal";

const itens: ItemMenu[] = [
  { href: "/master", rotulo: "Resumo", icone: LayoutDashboard, exato: true },
  { href: "/master/turmas", rotulo: "Turmas", icone: School },
  { href: "/master/usuarios", rotulo: "Usuários", icone: Users },
];

// Exige login e ser administrador master. Layouts não são reexecutados a cada
// navegação: páginas e Server Actions também chamam exigirMaster().
export default async function MasterLayout({ children }: LayoutProps<"/master">) {
  const user = await exigirMaster();

  return (
    <AppShell
      titulo="Gestão da plataforma"
      itens={itens}
      usuario={{ nome: user.name, email: user.email, imagem: user.image }}
      rodape={{ href: "/dashboard", rotulo: "Voltar para a turma" }}
    >
      {children}
    </AppShell>
  );
}
