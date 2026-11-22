import Link from "next/link";
import { AnimarPagina } from "@/components/animacao/animar-pagina";
import { AlternadorTema } from "@/components/features/alternador-tema";
import { AppShell } from "@/components/features/app-shell";
import { BotaoSair } from "@/components/features/botao-sair";
import { exigirSessao, getMembro, getSeletorTurmas } from "@/lib/dal";
import { ehMaster } from "@/lib/master";
import { menuDaTurma } from "@/lib/menu";

// Só exige login: quem ainda não tem turma também precisa poder ver e excluir a
// própria conta. Com turma, a conta abre dentro do menu da turma (P-05 do
// plano de UX), sem trocar de "área". Layouts não são reexecutados a cada
// navegação: a página e as Server Actions também chamam exigirSessao().
export default async function ContaLayout({ children }: { children: React.ReactNode }) {
  const { user } = await exigirSessao();
  const membro = await getMembro();

  if (membro) {
    return (
      <AppShell
        titulo={membro.turmaNome}
        turmas={await getSeletorTurmas(membro.turmaId)}
        grupos={menuDaTurma(membro)}
        usuario={{ nome: user.name, email: user.email, imagem: user.image }}
        master={ehMaster(user)}
      >
        {children}
      </AppShell>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl 2xl:max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/convite" className="inline-flex items-center text-lg font-semibold tracking-tight pointer-coarse:min-h-11">
            Formandos <span aria-hidden>🎓</span>
          </Link>
          <div className="flex items-center gap-1">
            <p className="hidden max-w-48 truncate text-sm text-muted-foreground sm:block">{user.email}</p>
            <AlternadorTema />
            <BotaoSair />
          </div>
        </div>
      </header>
      <main id="conteudo" tabIndex={-1} className="mx-auto flex w-full max-w-4xl 2xl:max-w-6xl flex-1 flex-col p-4 outline-none md:p-8">
        <AnimarPagina>{children}</AnimarPagina>
      </main>
    </div>
  );
}
