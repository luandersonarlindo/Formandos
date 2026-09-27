import type { Metadata } from "next";
import Link from "next/link";
import { UserCheck, UsersRound } from "lucide-react";
import { AvatarUsuario } from "@/components/features/avatar-usuario";
import { Paginacao } from "@/components/features/paginacao";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { exigirAdmin } from "@/lib/dal";
import { lerPagina } from "@/lib/paginacao";
import { getResumoPresenca, listarPresencas, type FiltroPresenca } from "@/lib/presenca";
import { ROTULO_PRESENCA } from "@/lib/presenca-regras";

export const metadata: Metadata = { title: "Presença" };

const FILTROS: { valor: FiltroPresenca; rotulo: string }[] = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "vou", rotulo: "Vão" },
  { valor: "talvez", rotulo: "Talvez" },
  { valor: "nao", rotulo: "Não vão" },
  { valor: "pendente", rotulo: "Sem resposta" },
];

export default async function PresencaAdminPage({ searchParams }: PageProps<"/admin/presenca">) {
  const admin = await exigirAdmin();
  const { filtro: filtroParametro, pagina: paginaParametro } = await searchParams;
  const filtro = FILTROS.find((f) => f.valor === filtroParametro)?.valor ?? "todos";

  const resumo = await getResumoPresenca(admin.turmaId);
  const contagem: Record<FiltroPresenca, number> = {
    todos: resumo.membros,
    vou: resumo.vou,
    talvez: resumo.talvez,
    nao: resumo.nao,
    pendente: resumo.pendente,
  };
  const { itens, pagina, totalPaginas } = await listarPresencas(admin.turmaId, {
    filtro,
    pagina: lerPagina(paginaParametro),
    total: contagem[filtro],
  });

  return (
    <div className="mx-auto w-full max-w-4xl 2xl:max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Presença</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground text-pretty">
        Quem confirmou que vai ao evento e quantos acompanhantes leva. Use o total de pessoas para fechar o
        espaço e a comida.
      </p>

      <Card className="vitrine-fundo-hero mt-6">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <UsersRound className="size-4" aria-hidden /> Pessoas esperadas
          </CardDescription>
          <CardTitle className="text-4xl tabular-nums">
            <span data-contar={resumo.pessoas}>{resumo.pessoas}</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {resumo.vou} {resumo.vou === 1 ? "membro confirmado" : "membros confirmados"} +{" "}
            {resumo.acompanhantes} {resumo.acompanhantes === 1 ? "acompanhante" : "acompanhantes"}.{" "}
            {resumo.talvez > 0 && `${resumo.talvez} ainda em dúvida. `}
            {resumo.pendente > 0 && `${resumo.pendente} sem resposta.`}
          </p>
        </CardHeader>
      </Card>

      <nav
        aria-label="Filtrar por resposta"
        className="mt-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {FILTROS.map((f) => {
          const ativo = f.valor === filtro;
          return (
            <Link
              key={f.valor}
              href={f.valor === "todos" ? "/admin/presenca" : `/admin/presenca?filtro=${f.valor}`}
              aria-current={ativo ? "true" : undefined}
              className={
                ativo
                  ? "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--vitrine-a)]/40 bg-[color-mix(in_oklch,var(--vitrine-a)_10%,transparent)] px-3 py-1 text-sm font-medium"
                  : "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              }
            >
              {f.rotulo}
              <span className="text-xs tabular-nums text-muted-foreground">{contagem[f.valor]}</span>
            </Link>
          );
        })}
      </nav>

      {itens.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-2 rounded-xl border border-dashed p-10 text-center">
          <UserCheck className="size-8 text-muted-foreground" aria-hidden />
          <p className="font-medium">Ninguém neste filtro</p>
          <p className="text-sm text-muted-foreground">Escolha outro filtro para ver os demais.</p>
        </div>
      ) : (
        <ul data-grupo className="mt-4 grid gap-3">
          {itens.map((m) => (
            <li key={m.id}>
              <Card>
                <CardContent className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <div className="flex min-w-0 flex-1 basis-56 items-center gap-3">
                    <AvatarUsuario nome={m.name} imagem={m.image} className="size-10" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{m.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                    {m.status ? (
                      <Badge variant={m.status === "vou" ? "default" : "secondary"}>{ROTULO_PRESENCA[m.status]}</Badge>
                    ) : (
                      <Badge variant="outline">Sem resposta</Badge>
                    )}
                    {m.status === "vou" && m.acompanhantes > 0 && (
                      <Badge variant="outline">
                        + {m.acompanhantes} {m.acompanhantes === 1 ? "acompanhante" : "acompanhantes"}
                      </Badge>
                    )}
                  </div>
                  {m.observacao && (
                    <p className="basis-full text-sm text-muted-foreground wrap-break-word">{m.observacao}</p>
                  )}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
      <Paginacao
        pagina={pagina}
        totalPaginas={totalPaginas}
        caminho="/admin/presenca"
        parametros={{ filtro: filtro === "todos" ? undefined : filtro }}
      />
    </div>
  );
}
