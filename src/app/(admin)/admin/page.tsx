import type { Metadata } from "next";
import {
  CalendarDays,
  CircleHelp,
  ClipboardList,
  LayoutList,
  UserCheck,
  Users,
  Vote,
} from "lucide-react";
import { CartaoResumo } from "@/components/features/cartao-resumo";
import { Badge } from "@/components/ui/badge";
import { getResumoAdmin } from "@/lib/admin";
import { exigirAdmin } from "@/lib/dal";

export const metadata: Metadata = { title: "Painel do administrador" };

export default async function AdminPage() {
  const admin = await exigirAdmin();
  const r = await getResumoAdmin(admin.turmaId);

  const cartoes = [
    { href: "/admin/membros", titulo: "Membros", valor: r.membros, texto: "gerenciar papéis e acessos", icone: Users },
    // Sem href de propósito: a participação só existe espalhada enquete por
    // enquete, dentro de /admin/votacoes/[catalogoId]. Ligar este cartão para
    // /admin/votacoes mandava a pessoa para uma tela que não mostra o número.
    {
      titulo: "Participação nas votações",
      valor: r.votantes,
      sufixo: `de ${r.membros}`,
      texto: "membros já votaram em alguma enquete",
      icone: Vote,
    },
    { href: "/admin/duvidas", titulo: "Dúvidas sem resposta", valor: r.duvidasAbertas, texto: "aguardando a comissão", icone: CircleHelp },
    { href: "/tarefas", titulo: "Tarefas em aberto", valor: r.tarefasAbertas, texto: "pendentes ou em andamento", icone: ClipboardList },
    {
      href: "/admin/presenca",
      titulo: "Presença confirmada",
      valor: r.confirmados,
      sufixo: `de ${r.membros}`,
      texto: "membros disseram que vão",
      icone: UserCheck,
    },
    { href: "/admin/votacoes", titulo: "Catálogos personalizados", valor: r.personalizados, texto: "criados pela turma", icone: LayoutList },
    { href: "/admin/evento", titulo: "Evento e programação", valor: "Editar", texto: "data, local e horários da festa", icone: CalendarDays },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl 2xl:max-w-6xl">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Painel do administrador
        </h1>
        <Badge>Administrador</Badge>
      </div>
      <p className="mt-2 text-muted-foreground">
        Resumo de <span className="font-medium text-foreground">{admin.turmaNome}</span> e
        atalhos para a gestão da turma.
      </p>
      <div data-grupo className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cartoes.map((c) => (
          <CartaoResumo key={c.titulo} {...c} />
        ))}
      </div>
    </div>
  );
}
