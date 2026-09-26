import type { Metadata } from "next";
import { alterarPapel, removerMembro } from "@/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { exigirAdmin } from "@/lib/dal";
import { pool } from "@/lib/db";

export const metadata: Metadata = { title: "Membros" };

type Linha = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  papel: "admin" | "participante";
};

export default async function MembrosPage() {
  const admin = await exigirAdmin();
  const { rows } = await pool.query<Linha>(
    `select u.id, u.name, u.email, u.image, m.papel
       from membros m
       join usuarios u on u.id = m.usuario_id
      where m.turma_id = $1
      order by (m.papel = 'admin') desc, u.name`,
    [admin.turmaId],
  );
  const totalAdmins = rows.filter((r) => r.papel === "admin").length;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Membros</h1>
      <p className="mt-2 text-muted-foreground">
        {rows.length} {rows.length === 1 ? "membro" : "membros"} na turma.
      </p>

      <ul className="mt-6 divide-y rounded-lg border">
        {rows.map((m) => {
          const ehVoce = m.id === admin.usuarioId;
          const ultimoAdmin = m.papel === "admin" && totalAdmins === 1;
          return (
            <li
              key={m.id}
              className="flex flex-wrap items-center gap-3 px-4 py-3"
            >
              {m.image && (
                <img
                  src={m.image}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="size-9 rounded-full"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {m.name}
                  {ehVoce && (
                    <span className="text-muted-foreground"> (você)</span>
                  )}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {m.email}
                </p>
              </div>
              <Badge variant={m.papel === "admin" ? "default" : "secondary"}>
                {m.papel === "admin" ? "Administrador" : "Participante"}
              </Badge>

              {!ultimoAdmin && (
                <form action={alterarPapel}>
                  <input type="hidden" name="usuarioId" value={m.id} />
                  <input
                    type="hidden"
                    name="papel"
                    value={m.papel === "admin" ? "participante" : "admin"}
                  />
                  <Button type="submit" variant="outline" size="sm">
                    {m.papel === "admin" ? "Tornar participante" : "Promover"}
                  </Button>
                </form>
              )}
              {!ehVoce && (
                <form action={removerMembro}>
                  <input type="hidden" name="usuarioId" value={m.id} />
                  <Button type="submit" variant="destructive" size="sm">
                    Remover
                  </Button>
                </form>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
