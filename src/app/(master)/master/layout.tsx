import { LayoutDashboard, School, Users } from "lucide-react";
import { AppShell } from "@/components/features/app-shell";
import { exigirMaster, getVinculos } from "@/lib/dal";

// Exige login e ser administrador master. Layouts não são reexecutados a cada
// navegação: páginas e Server Actions também chamam exigirMaster().
export default async function MasterLayout({ children }: LayoutProps<"/master">) {
  const user = await exigirMaster();
  const temTurma = (await getVinculos()).length > 0;

  return (
    <AppShell
      titulo="Gestão da plataforma"
      grupos={[
        {
          rotulo: "Gestão da plataforma",
          itens: [
            { href: "/master", rotulo: "Resumo", icone: LayoutDashboard, exato: true },
            { href: "/master/turmas", rotulo: "Turmas", icone: School },
            { href: "/master/usuarios", rotulo: "Usuários", icone: Users },
          ],
        },
      ]}
      usuario={{ nome: user.name, email: user.email, imagem: user.image }}
      master
      extrasUsuario={temTurma ? [{ href: "/dashboard", rotulo: "Voltar para a turma" }] : []}
    >
      {children}
    </AppShell>
  );
}
