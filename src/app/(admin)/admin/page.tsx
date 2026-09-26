import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getResumoAdmin } from "@/lib/admin";
import { exigirAdmin } from "@/lib/dal";

export default async function AdminPage() {
  const admin = await exigirAdmin();
  const r = await getResumoAdmin(admin.turmaId);

  const cartoes = [
    { href: "/admin/membros", titulo: "Membros", valor: r.membros, texto: "gerenciar papéis e acessos" },
    {
      href: "/admin/votacoes",
      titulo: "Participação nas votações",
      valor: `${r.votantes} de ${r.membros}`,
      texto: "membros já votaram em alguma enquete",
    },
    { href: "/admin/duvidas", titulo: "Dúvidas sem resposta", valor: r.duvidasAbertas, texto: "aguardando a comissão" },
    { href: "/tarefas", titulo: "Tarefas em aberto", valor: r.tarefasAbertas, texto: "pendentes ou em andamento" },
    { href: "/admin/votacoes", titulo: "Catálogos personalizados", valor: r.personalizados, texto: "criados pela turma" },
    { href: "/admin/evento", titulo: "Evento e programação", valor: "Editar", texto: "data, local e horários da festa" },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">
        Painel do administrador
      </h1>
      <p className="mt-2 text-muted-foreground">
        Resumo de {admin.turmaNome} e atalhos para a gestão da turma.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {cartoes.map((c) => (
          <Link key={c.titulo} href={c.href} className="block">
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardDescription>{c.titulo}</CardDescription>
                <CardTitle className="text-2xl">{c.valor}</CardTitle>
                <p className="text-sm text-muted-foreground">{c.texto}</p>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
