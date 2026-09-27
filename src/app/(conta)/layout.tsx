import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AnimarPagina } from "@/components/animacao/animar-pagina";
import { BotaoSair } from "@/components/features/botao-sair";
import { exigirSessao, getVinculos } from "@/lib/dal";

// Só exige login: quem ainda não tem turma também precisa poder ver e excluir a
// própria conta. Layouts não são reexecutados a cada navegação: a página e as
// Server Actions também chamam exigirSessao().
export default async function ContaLayout({ children }: { children: React.ReactNode }) {
  const { user } = await exigirSessao();
  const vinculos = await getVinculos();

  return (
    <div className="vitrine-fundo-hero flex flex-1 flex-col">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl 2xl:max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href={vinculos.length > 0 ? "/dashboard" : "/convite"} className="text-lg font-semibold tracking-tight">
            Formandos <span aria-hidden>🎓</span>
          </Link>
          <div className="flex items-center gap-1">
            <p className="hidden max-w-48 truncate text-sm text-muted-foreground sm:block">{user.email}</p>
            <BotaoSair />
          </div>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-4xl 2xl:max-w-6xl flex-1 flex-col p-4 md:p-8">
        <Link
          href={vinculos.length > 0 ? "/dashboard" : "/convite"}
          className="mb-6 inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden /> {vinculos.length > 0 ? "Voltar para a turma" : "Voltar"}
        </Link>
        <AnimarPagina>{children}</AnimarPagina>
      </div>
    </div>
  );
}
