import type { Metadata } from "next";
import Link from "next/link";
import { Crown, RefreshCw, Search, ShieldCheck, ShieldOff, TriangleAlert, UserMinus, Users } from "lucide-react";
import { alterarPapel, regenerarConvite, removerMembro } from "@/actions/admin";
import { BotaoConvite } from "@/components/features/botao-convite";
import { BotaoCopiar } from "@/components/features/botao-copiar";
import { ConfirmarExclusao } from "@/components/features/confirmar-exclusao";
import { AvatarUsuario } from "@/components/features/avatar-usuario";
import { EstadoVazio } from "@/components/features/estado-vazio";
import { FormDialog } from "@/components/features/form-dialog";
import { Paginacao } from "@/components/features/paginacao";
import { EquipeAmico } from "@/components/ilustracoes/equipe-amico";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listarMembrosAdmin } from "@/lib/admin";
import { lerBusca } from "@/lib/busca";
import { exigirAdmin } from "@/lib/dal";
import { pool } from "@/lib/db";
import { lerPagina } from "@/lib/paginacao";

export const metadata: Metadata = { title: "Membros" };

export default async function MembrosPage({ searchParams }: PageProps<"/admin/membros">) {
  const admin = await exigirAdmin();
  const { busca: buscaParametro, pagina: paginaParametro } = await searchParams;
  const busca = lerBusca(buscaParametro);
  const [{ rows: membros }, { itens: rows, pagina, totalPaginas, totais, encontrados }] =
    await Promise.all([
      pool.query("select codigo_convite from turmas where id = $1", [admin.turmaId]),
      listarMembrosAdmin(admin.turmaId, {
        busca,
        pagina: lerPagina(paginaParametro),
      }),
    ]);
  const codigo: string = membros[0].codigo_convite;
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

      <Card className="vitrine-fundo-hero mt-6">
        <CardHeader>
          <CardDescription>
            Código de convite de {admin.turmaNome}: quem tiver este código entra
            como participante.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <p
            aria-label={`Código de convite: ${codigo}`}
            className="flex flex-wrap gap-2"
          >
            {[...codigo].map((letra, i) => (
              <span
                key={i}
                aria-hidden
                className="vitrine-texto-gradiente flex h-14 w-11 items-center justify-center rounded-xl border bg-background/80 font-mono text-3xl font-semibold sm:h-16 sm:w-13 sm:text-4xl"
              >
                {letra}
              </span>
            ))}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <BotaoCopiar texto={codigo} rotulo="Copiar código" />
            <BotaoConvite nomeTurma={admin.turmaNome} codigo={codigo} />
            <FormDialog
              rotulo="Gerar novo código"
              icone={<RefreshCw aria-hidden />}
              titulo="Gerar um novo código"
              descricao="O código anterior deixa de funcionar. Quem já entrou continua na turma."
              acao={regenerarConvite}
              rotuloSubmit="Gerar novo código"
              rotuloPendente="Gerando…"
            />
          </div>
        </CardContent>
      </Card>

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
                        <FormDialog
                          rotulo={
                            m.papel === "admin" ? "Tornar participante" : "Promover"
                          }
                          icone={
                            m.papel === "admin" ? (
                              <ShieldOff aria-hidden />
                            ) : (
                              <ShieldCheck aria-hidden />
                            )
                          }
                          titulo="Trocar papel"
                          descricao={
                            m.papel === "admin"
                              ? `${m.name} deixa de ser administrador e vira participante.`
                              : `Promover ${m.name} a administrador.`
                          }
                          acao={alterarPapel}
                          campos={{
                            usuarioId: m.id,
                            papel: m.papel === "admin" ? "participante" : "admin",
                          }}
                          rotuloSubmit="Trocar papel"
                          rotuloPendente="Salvando…"
                        />
                      )}
                      {!ehVoce && (
                        <ConfirmarExclusao
                          acao={removerMembro}
                          campos={{ usuarioId: m.id }}
                          alvo="o membro"
                          nome={`${m.name} (${m.email})`}
                          aviso="Some da turma junto com o que ele deixou nela."
                          rotulo="Remover"
                          descricao={`Remover ${m.name}`}
                          icone={<UserMinus aria-hidden />}
                        />
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
