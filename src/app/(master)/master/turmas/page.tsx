import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, School, TriangleAlert, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { exigirMaster } from "@/lib/dal";
import { listarTurmas } from "@/lib/plataforma";

export const metadata: Metadata = { title: "Turmas" };

const data = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "America/Sao_Paulo" });

export default async function TurmasMasterPage() {
  await exigirMaster();
  const turmas = await listarTurmas();

  return (
    <div className="mx-auto w-full max-w-4xl 2xl:max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Turmas</h1>
      <p className="mt-2 text-muted-foreground">
        {turmas.length} {turmas.length === 1 ? "turma" : "turmas"} na plataforma.
      </p>

      {turmas.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-xl border border-dashed p-10 text-center">
          <School className="size-8 text-muted-foreground" aria-hidden />
          <p className="font-medium">Nenhuma turma criada ainda</p>
        </div>
      ) : (
        <ul data-grupo className="mt-6 grid gap-4 md:grid-cols-2">
          {turmas.map((t) => (
            <li key={t.id}>
              <Link href={`/master/turmas/${t.id}`} className="block">
                <Card className="vitrine-cartao h-full">
                  <CardContent className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/50 text-[var(--vitrine-a)]">
                        <School className="size-5" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium wrap-break-word">{t.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          Criada em {data.format(t.criadaEm)}
                          {t.criador ? ` por ${t.criador}` : ""}
                        </p>
                      </div>
                      <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        <Users aria-hidden /> {t.membros} {t.membros === 1 ? "membro" : "membros"}
                      </Badge>
                      <Badge variant={t.admins === 0 ? "destructive" : "outline"}>
                        {t.admins === 0 && <TriangleAlert aria-hidden />}
                        {t.admins} {t.admins === 1 ? "admin" : "admins"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
