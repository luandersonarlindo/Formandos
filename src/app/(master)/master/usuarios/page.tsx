import type { Metadata } from "next";
import Link from "next/link";
import { excluirUsuario } from "@/actions/master";
import { FormAcao } from "@/components/features/form-acao";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { exigirMaster } from "@/lib/dal";
import { emailsMaster } from "@/lib/master";
import { listarUsuarios } from "@/lib/plataforma";

export const metadata: Metadata = { title: "Usuários" };

export default async function UsuariosMasterPage() {
  const master = await exigirMaster();
  const usuarios = await listarUsuarios();
  const masters = emailsMaster();

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Usuários</h1>
      <p className="mt-2 text-muted-foreground">
        {usuarios.length} {usuarios.length === 1 ? "usuário" : "usuários"} cadastrados. Para mudar o papel de alguém em uma turma, abra a turma.
      </p>

      <ul data-grupo className="mt-6 divide-y rounded-lg border">
        {usuarios.map((u) => {
          const ehMasterAlvo = masters.includes(u.email.toLowerCase());
          const podeExcluir = u.id !== master.id && !ehMasterAlvo;
          return (
            <li key={u.id} className="px-4 py-3">
              <div className="flex flex-wrap items-center gap-3">
                {u.image && (
                  <img src={u.image} alt="" referrerPolicy="no-referrer" className="size-9 rounded-full" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {u.name}
                    {u.id === master.id && <span className="text-muted-foreground"> (você)</span>}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                </div>
                {ehMasterAlvo && <Badge>Master</Badge>}
                {!u.emailVerificado && <Badge variant="outline">Email não confirmado</Badge>}
                {u.turmas.length > 0 ? (
                  <div className="flex flex-col items-end gap-0.5">
                    {u.turmas.map((t) => (
                      <Link key={t.id} href={`/master/turmas/${t.id}`} className="text-sm underline underline-offset-4">
                        {t.nome} · {t.papel === "admin" ? "admin" : "participante"}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Sem turma</span>
                )}
              </div>
              {podeExcluir && (
                <details className="mt-2">
                  <summary className="w-fit cursor-pointer text-sm text-destructive">
                    Excluir usuário
                  </summary>
                  <FormAcao
                    acao={excluirUsuario}
                    rotulo="Excluir usuário"
                    rotuloPendente="Excluindo…"
                    variante="destructive"
                    className="mt-2"
                  >
                    <input type="hidden" name="usuarioId" value={u.id} />
                    <p className="text-xs text-muted-foreground">
                      Apaga a conta, a participação e os votos e dúvidas dessa pessoa. Não dá para desfazer.
                    </p>
                    <Label htmlFor={`conf-${u.id}`}>Digite o email <strong>{u.email}</strong> para confirmar</Label>
                    <Input id={`conf-${u.id}`} name="confirmacao" autoComplete="off" required />
                  </FormAcao>
                </details>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
