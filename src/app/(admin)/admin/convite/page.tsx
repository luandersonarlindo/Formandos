import type { Metadata } from "next";
import { regenerarConvite } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { exigirAdmin } from "@/lib/dal";
import { pool } from "@/lib/db";

export const metadata: Metadata = { title: "Código de convite" };

export default async function ConviteAdminPage() {
  const admin = await exigirAdmin();
  const { rows } = await pool.query(
    "select codigo_convite from turmas where id = $1",
    [admin.turmaId],
  );
  const codigo: string = rows[0].codigo_convite;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">
        Código de convite
      </h1>
      <p className="mt-2 text-muted-foreground">
        Quem tiver este código entra na turma como participante. Compartilhe
        apenas com a turma.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Código atual</CardTitle>
          <CardDescription>
            Ao gerar um novo código, o anterior deixa de funcionar. Quem já
            entrou continua na turma.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <code className="rounded-lg bg-muted px-4 py-2 font-mono text-2xl tracking-widest">
            {codigo}
          </code>
          <form action={regenerarConvite}>
            <Button type="submit" variant="outline">
              Gerar novo código
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
