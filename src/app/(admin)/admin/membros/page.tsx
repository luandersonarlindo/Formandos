import type { Metadata } from "next";
import Link from "next/link";
import { Crown, Search, ShieldCheck, ShieldOff, TriangleAlert, UserMinus, Users } from "lucide-react";
import { alterarPapel, removerMembro } from "@/actions/admin";
import { AvatarUsuario } from "@/components/features/avatar-usuario";
import { EstadoVazio } from "@/components/features/estado-vazio";
import { Paginacao } from "@/components/features/paginacao";
import { EquipeAmico } from "@/components/ilustracoes/equipe-amico";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listarMembrosAdmin } from "@/lib/admin";
import { lerBusca } from "@/lib/busca";
import { exigirAdmin } from "@/lib/dal";
import { lerPagina } from "@/lib/paginacao";

export const metadata: Metadata = { title: "Membros" };

export default async function MembrosPage({ searchParams }: PageProps<"/admin/membros">) {
  const admin = await exigirAdmin();
  const { busca: buscaParametro, pagina: paginaParametro } = await searchParams;
  const busca = lerBusca(buscaParametro);
  const { itens: rows, pagina, totalPaginas, totais, encontrados } = await listarMembrosAdmin(
    admin.turmaId,
    { busca, pagina: lerPagina(paginaParametro) },
  );
  const totalAdmins = totais.admins;
  const participantes = totais.membros - totalAdmins;

  return (
    <div className="mx-auto w-full max-w-4xl 2xl:max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Membros</h1>
      <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
        <span>
          {totais.membros} {totais.membros === 1 ? "membro" : "membros"} na turma
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

      <form action="/admin/membros" role="search" className="mt-6 flex gap-2">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            name="busca"
            defaultValue={busca}
            maxLength={100}
            placeholder="Buscar por nome ou email"
            aria-label="Buscar membro por nome ou email"
            autoComplete="off"
            className="h-10 pl-9"
          />
        </div>
        <Button type="submit" size="lg">
          Buscar
        </Button>
        {busca && (
          <Link href="/admin/membros" className={buttonVariants({ variant: "outline", size: "lg" })}>
            Limpar
          </Link>
        )}
      </form>
      {busca && (
        <p role="status" className="mt-3 text-sm text-muted-foreground">
          {encontrados} {encontrados === 1 ? "membro encontrado" : "membros encontrados"} para “{busca}”.
        </p>
      )}

      {rows.length === 0 ? (
        <EstadoVazio
          className="mt-4"
          descricao="Confira o nome ou o email e tente de novo."
          ilustracao={<EquipeAmico />}
          titulo="Nenhum membro encontrado"
        />
      ) : (
        <>
          <p className="mt-4 flex items-start gap-1.5 text-sm text-muted-foreground">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            Remover alguém tira a pessoa da turma e apaga o que ela deixou nela: votos,
            dúvidas, confirmações de presença e votos nas dúvidas dos outros.
          </p>
          <ul data-grupo className="mt-4 grid gap-3">
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
        </>
      )}
      <Paginacao
        pagina={pagina}
        totalPaginas={totalPaginas}
        caminho="/admin/membros"
        parametros={{ busca: busca || undefined }}
      />
    </div>
  );
}
