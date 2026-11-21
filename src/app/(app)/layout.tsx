import { AppShell } from "@/components/features/app-shell";
import { exigirMembro, exigirSessao, getSeletorTurmas } from "@/lib/dal";
import { ehMaster } from "@/lib/master";
import { menuDaTurma } from "@/lib/menu";

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
