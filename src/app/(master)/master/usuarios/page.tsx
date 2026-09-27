import type { Metadata } from "next";
import Link from "next/link";
import { MailWarning, ShieldCheck, Trash2 } from "lucide-react";
import { AvatarUsuario } from "@/components/features/avatar-usuario";
import { excluirUsuario } from "@/actions/master";
import { FormAcao } from "@/components/features/form-acao";
import { Paginacao } from "@/components/features/paginacao";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { exigirMaster } from "@/lib/dal";
import { emailsMaster } from "@/lib/master";
import { lerPagina } from "@/lib/paginacao";
import { listarUsuarios } from "@/lib/plataforma";

export const metadata: Metadata = { title: "Usuários" };

export default async function UsuariosMasterPage({ searchParams }: PageProps<"/master/usuarios">) {
  const master = await exigirMaster();
  const { pagina: paginaParametro } = await searchParams;
  const { itens: usuarios, total, pagina, totalPaginas } = await listarUsuarios(lerPagina(paginaParametro));
  const masters = emailsMaster();

  return (
    <div className="mx-auto w-full max-w-4xl 2xl:max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Usuários</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground text-pretty">
        {total} {total === 1 ? "usuário cadastrado" : "usuários cadastrados"}. Para mudar o papel de alguém em uma turma, abra a turma.
      </p>

      <ul data-grupo className="mt-6 grid gap-3">
        {usuarios.map((u) => {
          const ehMasterAlvo = masters.includes(u.email.toLowerCase());
          const podeExcluir = u.id !== master.id && !ehMasterAlvo;
          return (
            <li key={u.id}>
              <Card>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                    <div className="flex min-w-0 flex-1 basis-56 items-center gap-3">
                      <AvatarUsuario nome={u.name} imagem={u.image} className="size-10" />
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-x-2 text-sm font-medium">
                          <span className="truncate">{u.name}</span>
                          {u.id === master.id && <span className="font-normal text-muted-foreground">(você)</span>}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {ehMasterAlvo && (
                        <Badge>
                          <ShieldCheck aria-hidden /> Master
                        </Badge>
                      )}
                      {!u.emailVerificado && (
                        <Badge variant="outline">
                          <MailWarning aria-hidden /> Email não confirmado
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-xs text-muted-foreground">Turmas:</span>
                    {u.turmas.length > 0 ? (
                      u.turmas.map((t) => (
                        <Link
                          key={t.id}
                          href={`/master/turmas/${t.id}`}
                          className="rounded-full border px-2.5 py-0.5 text-xs transition-colors hover:bg-muted"
                        >
                          {t.nome} · {t.papel === "admin" ? "admin" : "participante"}
                        </Link>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">Sem turma</span>
                    )}
                  </div>

                  {podeExcluir && (
                    <details className="group border-t pt-3">
                      <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 text-sm text-destructive [&::-webkit-details-marker]:hidden">
                        <Trash2 className="size-4" aria-hidden /> Excluir usuário
                      </summary>
                      <FormAcao
                        acao={excluirUsuario}
                        rotulo="Excluir usuário"
                        rotuloPendente="Excluindo…"
                        variante="destructive"
                        className="mt-3"
                      >
                        <input type="hidden" name="usuarioId" value={u.id} />
                        <p className="text-xs text-muted-foreground">
                          Apaga a conta, a participação e os votos e dúvidas dessa pessoa. Não dá para desfazer.
                        </p>
                        <Label htmlFor={`conf-${u.id}`} className="block leading-normal">Digite o email <strong>{u.email}</strong> para confirmar</Label>
                        <Input id={`conf-${u.id}`} name="confirmacao" autoComplete="off" className="h-10" required />
                      </FormAcao>
                    </details>
                  )}
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
      <Paginacao pagina={pagina} totalPaginas={totalPaginas} caminho="/master/usuarios" />
    </div>
  );
}
