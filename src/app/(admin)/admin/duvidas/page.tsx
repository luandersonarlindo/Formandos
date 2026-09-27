import type { Metadata } from "next";
import Link from "next/link";
import {
  CircleCheck,
  CircleDot,
  MessagesSquare,
  RotateCcw,
  Star,
  StarOff,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import {
  alternarDestaque,
  alternarRespondida,
  apagarDuvida,
} from "@/actions/admin";
import { AvatarUsuario } from "@/components/features/avatar-usuario";
import { FormResposta } from "@/components/features/form-resposta";
import { Paginacao } from "@/components/features/paginacao";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { exigirAdmin } from "@/lib/dal";
import { listarDuvidas } from "@/lib/duvidas";
import { lerPagina } from "@/lib/paginacao";

export const metadata: Metadata = { title: "Moderação de dúvidas" };

const formatarData = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

function AcaoSimples({
  acao,
  duvidaId,
  variante = "outline",
  children,
}: {
  acao: (formData: FormData) => Promise<void>;
  duvidaId: string;
  variante?: "outline" | "destructive";
  children: React.ReactNode;
}) {
  return (
    <form action={acao}>
      <input type="hidden" name="duvidaId" value={duvidaId} />
      <Button type="submit" variant={variante} size="sm">
        {children}
      </Button>
    </form>
  );
}

const FILTROS = [
  { valor: "todas", rotulo: "Todas" },
  { valor: "abertas", rotulo: "Sem resposta" },
  { valor: "respondidas", rotulo: "Respondidas" },
] as const;

export default async function ModeracaoDuvidasPage({
  searchParams,
}: PageProps<"/admin/duvidas">) {
  const admin = await exigirAdmin();
  const { filtro: parametro, pagina: paginaParametro } = await searchParams;
  const filtro = FILTROS.find((f) => f.valor === parametro)?.valor ?? "todas";
  const { itens: visiveis, pagina, totalPaginas, contagens } = await listarDuvidas(admin, {
    moderacao: true,
    filtro,
    pagina: lerPagina(paginaParametro),
  });
  const contagem = (v: keyof typeof contagens) => contagens[v];

  return (
    <div className="mx-auto w-full max-w-4xl 2xl:max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
        Moderação de dúvidas
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground text-pretty">
        {contagens.todas === 0
          ? "Nenhuma dúvida enviada ainda."
          : `${contagem("abertas")} sem resposta de ${contagens.todas} no total. As não respondidas aparecem primeiro.`}
      </p>

      <nav
        aria-label="Filtrar dúvidas"
        className="mt-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {FILTROS.map((f) => {
          const ativo = f.valor === filtro;
          return (
            <Link
              key={f.valor}
              href={f.valor === "todas" ? "/admin/duvidas" : `/admin/duvidas?filtro=${f.valor}`}
              aria-current={ativo ? "true" : undefined}
              className={
                ativo
                  ? "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--vitrine-a)]/40 bg-[color-mix(in_oklch,var(--vitrine-a)_10%,transparent)] px-3 py-1 text-sm font-medium"
                  : "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              }
            >
              {f.rotulo}
              <span className="text-xs tabular-nums text-muted-foreground">{contagem(f.valor)}</span>
            </Link>
          );
        })}
      </nav>

      {visiveis.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-2 rounded-xl border border-dashed p-10 text-center">
          <MessagesSquare className="size-8 text-muted-foreground" aria-hidden />
          <p className="font-medium">
            {contagens.todas === 0 ? "Nenhuma dúvida ainda" : "Nenhuma dúvida neste filtro"}
          </p>
          <p className="text-sm text-muted-foreground">
            {contagens.todas === 0
              ? "Quando alguém da turma perguntar, ela aparece aqui."
              : "Escolha outro filtro para ver as demais."}
          </p>
        </div>
      ) : (
        <ul data-grupo className="mt-4 grid gap-4">
          {visiveis.map((d) => (
            <li key={d.id}>
              <Card
                className={
                  d.respondida
                    ? undefined
                    : "border border-[var(--vitrine-a)]/30 bg-[color-mix(in_oklch,var(--vitrine-a)_4%,var(--card))]"
                }
              >
                <CardContent className="flex flex-col gap-4">
                  <div className="flex gap-4">
                    <div
                      className="flex w-12 shrink-0 flex-col items-center gap-0.5 self-start rounded-xl border py-2 text-muted-foreground"
                      title={`${d.votos} ${d.votos === 1 ? "voto" : "votos"}`}
                    >
                      <ThumbsUp className="size-4" aria-hidden />
                      <span className="text-sm font-semibold tabular-nums text-foreground">{d.votos}</span>
                      <span className="sr-only">{d.votos === 1 ? "voto" : "votos"}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        {d.destaque && (
                          <Badge>
                            <Star aria-hidden /> Em destaque
                          </Badge>
                        )}
                        {d.respondida ? (
                          <Badge variant="secondary" className="text-emerald-700 dark:text-emerald-400">
                            <CircleCheck aria-hidden /> Respondida
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <CircleDot aria-hidden /> Aberta
                          </Badge>
                        )}
                      </div>
                      <p className="wrap-break-word whitespace-pre-wrap">{d.conteudo}</p>
                      <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <AvatarUsuario nome={d.autor} className="size-5 text-[10px]" />
                        {d.autor} · {formatarData.format(d.criadaEm)}
                      </p>
                    </div>
                  </div>

                  <FormResposta duvidaId={d.id} resposta={d.resposta} />

                  <div className="flex flex-wrap gap-2 border-t pt-4">
                    <AcaoSimples acao={alternarDestaque} duvidaId={d.id}>
                      {d.destaque ? <StarOff aria-hidden /> : <Star aria-hidden />}
                      {d.destaque ? "Tirar destaque" : "Destacar"}
                    </AcaoSimples>
                    <AcaoSimples acao={alternarRespondida} duvidaId={d.id}>
                      {d.respondida ? <RotateCcw aria-hidden /> : <CircleCheck aria-hidden />}
                      {d.respondida ? "Reabrir" : "Marcar como respondida"}
                    </AcaoSimples>
                    <AcaoSimples
                      acao={apagarDuvida}
                      duvidaId={d.id}
                      variante="destructive"
                    >
                      <Trash2 aria-hidden /> Apagar
                    </AcaoSimples>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
      <Paginacao
        pagina={pagina}
        totalPaginas={totalPaginas}
        caminho="/admin/duvidas"
        parametros={{ filtro: filtro === "todas" ? undefined : filtro }}
      />
    </div>
  );
}
