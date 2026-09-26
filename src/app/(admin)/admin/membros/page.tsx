import type { Metadata } from "next";
import { alterarPapel, removerMembro } from "@/actions/admin";
import { Crown, ShieldCheck, ShieldOff, UserMinus, Users } from "lucide-react";
import { AvatarUsuario } from "@/components/features/avatar-usuario";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

  const participantes = rows.length - totalAdmins;

  return (
    <div className="mx-auto w-full max-w-4xl 2xl:max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Membros</h1>
      <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
        <span>
          {rows.length} {rows.length === 1 ? "membro" : "membros"} na turma
        </span>
        <span className="inline-flex items-center gap-1.5 text-sm">
          <Crown className="size-4 text-[var(--vitrine-a)]" aria-hidden />
          {totalAdmins} {totalAdmins === 1 ? "administrador" : "administradores"}
        </span>
        <span className="inline-flex items-center gap-1.5 text-sm">
          <Users className="size-4 text-[var(--vitrine-a)]" aria-hidden />
          {participantes} {participantes === 1 ? "participante" : "participantes"}
        </span>
      </p>

      <ul data-grupo className="mt-6 grid gap-3">
        {rows.map((m) => {
          const ehVoce = m.id === admin.usuarioId;
          const ultimoAdmin = m.papel === "admin" && totalAdmins === 1;
          return (
            <li key={m.id}>
              <Card>
                <CardContent className="flex flex-wrap items-center gap-x-4 gap-y-3">
                  <div className="flex min-w-0 flex-1 basis-56 items-center gap-3">
                    <AvatarUsuario nome={m.name} imagem={m.image} className="size-10" />
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-x-2 text-sm font-medium">
                        <span className="truncate">{m.name}</span>
                        {ehVoce && <span className="font-normal text-muted-foreground">(você)</span>}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
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
                          {m.papel === "admin" ? <ShieldOff aria-hidden /> : <ShieldCheck aria-hidden />}
                          {m.papel === "admin" ? "Tornar participante" : "Promover"}
                        </Button>
                      </form>
                    )}
                    {!ehVoce && (
                      <form action={removerMembro}>
                        <input type="hidden" name="usuarioId" value={m.id} />
                        <Button type="submit" variant="destructive" size="sm">
                          <UserMinus aria-hidden /> Remover
                        </Button>
                      </form>
                    )}
                  </div>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
