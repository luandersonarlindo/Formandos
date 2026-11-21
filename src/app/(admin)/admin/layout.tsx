import { AppShell } from "@/components/features/app-shell";
import { exigirAdmin, exigirSessao, getSeletorTurmas } from "@/lib/dal";
import { ehMaster } from "@/lib/master";
import { menuDaTurma } from "@/lib/menu";

// Exige login, turma e papel de administrador. O menu é o mesmo da turma
// (ADR-0025): a comissão vê o grupo "Comissão" em qualquer tela, sem trocar de
// "área". Layouts não são reexecutados a cada navegação: páginas e Server
// Actions também devem chamar exigirSessao().
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const { user } = await exigirSessao();
  const membro = await exigirAdmin();

  return (
    <AppShell
      titulo={membro.turmaNome}
      turmas={await getSeletorTurmas(membro.turmaId)}
      grupos={menuDaTurma(membro)}
      arquivadaEm={membro.arquivadaEm?.toISOString() ?? null}
      excluirEm={membro.excluirEm}
      usuario={{ nome: user.name, email: user.email, imagem: user.image }}
      master={ehMaster(user)}
    >
      {children}
    </AppShell>
  );
}
