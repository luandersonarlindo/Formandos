import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { exigirMaster } from "@/lib/dal";
import { listarTurmas } from "@/lib/plataforma";

export const metadata: Metadata = { title: "Turmas" };

const data = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "America/Sao_Paulo" });

export default async function TurmasMasterPage() {
  await exigirMaster();
  const turmas = await listarTurmas();

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Turmas</h1>
      <p className="mt-2 text-muted-foreground">
        {turmas.length} {turmas.length === 1 ? "turma" : "turmas"} na plataforma.
      </p>

      {turmas.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">Nenhuma turma criada ainda.</p>
      ) : (
        <ul className="mt-6 divide-y rounded-lg border">
          {turmas.map((t) => (
            <li key={t.id}>
              <Link
                href={`/master/turmas/${t.id}`}
                className="flex flex-wrap items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.nome}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    Criada em {data.format(t.criadaEm)}
                    {t.criador ? ` por ${t.criador}` : ""}
                  </p>
                </div>
                <Badge variant="secondary">
                  {t.membros} {t.membros === 1 ? "membro" : "membros"}
                </Badge>
                <Badge variant={t.admins === 0 ? "destructive" : "outline"}>
                  {t.admins} {t.admins === 1 ? "admin" : "admins"}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
