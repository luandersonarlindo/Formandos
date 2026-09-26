import type { Metadata } from "next";
import { CircleHelp, School, ShieldCheck, UserRoundX, Users } from "lucide-react";
import { CartaoResumo } from "@/components/features/cartao-resumo";
import { Badge } from "@/components/ui/badge";
import { exigirMaster } from "@/lib/dal";
import { getResumoPlataforma } from "@/lib/plataforma";

export const metadata: Metadata = { title: "Gestão da plataforma" };

export default async function MasterPage() {
  await exigirMaster();
  const r = await getResumoPlataforma();

  const cartoes = [
    { href: "/master/turmas", titulo: "Turmas", valor: r.turmas, texto: "ver, gerir membros e excluir", icone: School },
    { href: "/master/usuarios", titulo: "Usuários", valor: r.usuarios, texto: "contas cadastradas na plataforma", icone: Users },
    { href: "/master/usuarios", titulo: "Usuários sem turma", valor: r.semTurma, texto: "ainda não entraram em uma turma", icone: UserRoundX },
    { href: "/master/turmas", titulo: "Dúvidas sem resposta", valor: r.duvidasAbertas, texto: "somando todas as turmas", icone: CircleHelp },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Gestão da plataforma
        </h1>
        <Badge>
          <ShieldCheck aria-hidden /> Master
        </Badge>
      </div>
      <p className="mt-2 text-muted-foreground">
        Visão de todas as turmas e usuários do Formandos.
      </p>
      <div data-grupo className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cartoes.map((c) => (
          <CartaoResumo key={c.titulo} {...c} />
        ))}
      </div>
    </div>
  );
}
