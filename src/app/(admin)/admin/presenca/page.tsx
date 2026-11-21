import type { Metadata } from "next";
import Link from "next/link";
import { FileDown, ListChecks, TriangleAlert } from "lucide-react";
import { AbasEvento } from "@/components/features/abas-evento";
import { AvatarUsuario } from "@/components/features/avatar-usuario";
import { CabecalhoPagina } from "@/components/features/cabecalho-pagina";
import { EstadoVazio } from "@/components/features/estado-vazio";
import { FiltrosPilula } from "@/components/features/filtros-pilula";
import { Paginacao } from "@/components/features/paginacao";
import { RegrasPresenca } from "@/components/features/regras-presenca";
import { EquipeAmico } from "@/components/ilustracoes/equipe-amico";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { exigirAdmin } from "@/lib/dal";
import { lerPagina } from "@/lib/paginacao";
import { getResumoPresenca, listarPresencas, type FiltroPresenca } from "@/lib/presenca";
import { formatarDataHora, paraDatetimeLocal } from "@/lib/datas";
import { presencaFechada, ROTULO_PRESENCA } from "@/lib/presenca-regras";

export const metadata: Metadata = { title: "Presença" };

const FILTROS: { valor: FiltroPresenca; rotulo: string }[] = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "vou", rotulo: "Vão" },
  { valor: "talvez", rotulo: "Talvez" },
  { valor: "nao", rotulo: "Não vão" },
  { valor: "pendente", rotulo: "Sem resposta" },
];

// Aba Presença de "Evento e presença" (D-08). O número para o buffet primeiro,
// as regras numa linha com um botão (P-15) e logo depois a lista: quem abre a
// tela quer saber quem vai, e as regras mudam pouco.
export default async function PresencaAdminPage({ searchParams }: PageProps<"/admin/presenca">) {
  const admin = await exigirAdmin();
  const { filtro: filtroParametro, pagina: paginaParametro } = await searchParams;
  const filtro = FILTROS.find((f) => f.valor === filtroParametro)?.valor ?? "todos";

  const resumo = await getResumoPresenca(admin.turmaId);
  const fechada = presencaFechada(admin.presencaAte, new Date());
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

  const regraAcompanhantes =
    admin.maxAcompanhantes === 0
      ? "Sem acompanhantes"
      : `Até ${admin.maxAcompanhantes} ${admin.maxAcompanhantes === 1 ? "acompanhante" : "acompanhantes"} por pessoa`;
  const regraPrazo = admin.presencaAte
    ? fechada
      ? `A lista fechou em ${formatarDataHora.format(admin.presencaAte)}`
      : `Respostas até ${formatarDataHora.format(admin.presencaAte)}`
    : "Sem prazo para responder";

  return (
    <div className="mx-auto w-full max-w-4xl 2xl:max-w-6xl">
      <CabecalhoPagina
        titulo="Evento e presença"
        descricao="Quem confirmou que vai e quantos acompanhantes leva."
        acao={
          <Button asChild>
            <Link href="/admin/presenca/lista">
              <ListChecks aria-hidden /> Lista da portaria
            </Link>
          </Button>
        }
      />
      <AbasEvento atual="presenca" />

      <section aria-labelledby="pessoas-esperadas" className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p id="pessoas-esperadas" className="text-sm text-muted-foreground">
            Pessoas esperadas
          </p>
          <p className="text-4xl font-semibold tabular-nums">
            <span data-contar={resumo.pessoas}>{resumo.pessoas}</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {resumo.vou} {resumo.vou === 1 ? "membro confirmado" : "membros confirmados"} +{" "}
            {resumo.acompanhantes} {resumo.acompanhantes === 1 ? "acompanhante" : "acompanhantes"}.{" "}
            {/* Para o buffet (ADR-0013): o preço de criança costuma ser outro. */}
            {resumo.adultos} {resumo.adultos === 1 ? "adulto" : "adultos"} e {resumo.criancas}{" "}
            {resumo.criancas === 1 ? "criança" : "crianças"}.
            {resumo.semNome > 0 &&
              ` ${resumo.semNome} ${resumo.semNome === 1 ? "acompanhante ainda sem nome informado (conta" : "acompanhantes ainda sem nome informado (contam"} como adulto).`}
          </p>
        </div>
        <Button asChild variant="ghost" size="sm">
          <a href="/admin/turma/exportar?tipo=portaria" download>
            <FileDown aria-hidden /> Baixar planilha
          </a>
        </Button>
      </section>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3">
        <p className="text-sm text-pretty">
          {regraAcompanhantes} · {regraPrazo}.
        </p>
        <RegrasPresenca
          maxAcompanhantes={admin.maxAcompanhantes}
          prazoLocal={admin.presencaAte ? paraDatetimeLocal(admin.presencaAte) : ""}
        />
      </div>

      {resumo.acimaDoLimite > 0 && (
        <Alert role="status" className="mt-4">
          <TriangleAlert aria-hidden className="text-warning" />
          <AlertDescription>
            {resumo.acimaDoLimite}{" "}
            {resumo.acimaDoLimite === 1 ? "resposta acima do limite." : "respostas acima do limite."} Converse com{" "}
            {resumo.acimaDoLimite === 1 ? "a pessoa" : "as pessoas"}: baixar o limite não corta ninguém.
          </AlertDescription>
        </Alert>
      )}

      <FiltrosPilula
        rotulo="Filtrar por resposta"
        className="mt-6"
        filtros={FILTROS.map((f) => ({
          rotulo: f.rotulo,
          href: f.valor === "todos" ? "/admin/presenca" : `/admin/presenca?filtro=${f.valor}`,
          ativo: f.valor === filtro,
          contagem: contagem[f.valor],
        }))}
      />

      {itens.length === 0 ? (
        <EstadoVazio
          className="mt-4"
          descricao="Escolha outro filtro para ver os demais."
          ilustracao={<EquipeAmico />}
          titulo="Ninguém neste filtro"
        />
      ) : (
        <ul data-grupo className="mt-4 divide-y rounded-xl border">
          {itens.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
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
                {m.status === "vou" && m.acompanhantes > admin.maxAcompanhantes && (
                  <Badge variant="warning">acima do limite</Badge>
                )}
              </div>
              {m.status === "vou" && m.acompanhantes > 0 && (
                <p className="basis-full text-sm">
                  {[
                    ...m.lista.map((a) => (a.tipo === "crianca" ? `${a.nome} (criança)` : a.nome)),
                    ...(m.acompanhantes > m.lista.length ? [`${m.acompanhantes - m.lista.length} sem nome`] : []),
                  ].join(", ")}
                </p>
              )}
              {m.observacao && <p className="basis-full text-sm text-muted-foreground wrap-break-word">{m.observacao}</p>}
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
