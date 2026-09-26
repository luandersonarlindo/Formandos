import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { exigirMaster } from "@/lib/dal";
import { getResumoPlataforma } from "@/lib/plataforma";

export const metadata: Metadata = { title: "Gestão da plataforma" };

export default async function MasterPage() {
  await exigirMaster();
  const r = await getResumoPlataforma();

  const cartoes = [
    { href: "/master/turmas", titulo: "Turmas", valor: r.turmas, texto: "ver, gerir membros e excluir" },
    { href: "/master/usuarios", titulo: "Usuários", valor: r.usuarios, texto: "contas cadastradas na plataforma" },
    { href: "/master/usuarios", titulo: "Usuários sem turma", valor: r.semTurma, texto: "ainda não entraram em uma turma" },
    { href: "/master/turmas", titulo: "Dúvidas sem resposta", valor: r.duvidasAbertas, texto: "somando todas as turmas" },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">
        Gestão da plataforma
      </h1>
      <p className="mt-2 text-muted-foreground">
        Visão de todas as turmas e usuários do Formandos.
      </p>
      <div data-grupo className="mt-6 grid gap-4 md:grid-cols-2">
        {cartoes.map((c) => (
          <Link key={c.titulo} href={c.href} className="block">
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardDescription>{c.titulo}</CardDescription>
                <CardTitle className="text-2xl">
                  {typeof c.valor === "number" ? (
                    <span data-contar={c.valor}>{c.valor}</span>
                  ) : (
                    c.valor
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{c.texto}</p>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
