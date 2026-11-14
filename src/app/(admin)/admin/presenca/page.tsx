import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, FileDown, ListChecks, Settings2, SlidersHorizontal, UsersRound } from "lucide-react";
import { salvarLimiteAcompanhantes, salvarPrazoPresenca } from "@/actions/presenca";
import { AvatarUsuario } from "@/components/features/avatar-usuario";
import { EstadoVazio } from "@/components/features/estado-vazio";
import { FormDialog } from "@/components/features/form-dialog";
import { Paginacao } from "@/components/features/paginacao";
import { EquipeAmico } from "@/components/ilustracoes/equipe-amico";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { exigirAdmin } from "@/lib/dal";
import { lerPagina } from "@/lib/paginacao";
import { getResumoPresenca, listarPresencas, type FiltroPresenca } from "@/lib/presenca";
import { formatarDataHora, paraDatetimeLocal } from "@/lib/datas";
import { presencaFechada, ROTULO_PRESENCA, TETO_ACOMPANHANTES } from "@/lib/presenca-regras";

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
          {/* Para o buffet (ADR-0013): o preço de criança costuma ser outro. */}
          <p className="text-sm">
            {resumo.adultos} {resumo.adultos === 1 ? "adulto" : "adultos"} e {resumo.criancas}{" "}
            {resumo.criancas === 1 ? "criança" : "crianças"}.
            {resumo.semNome > 0 &&
              ` ${resumo.semNome} ${resumo.semNome === 1 ? "acompanhante ainda sem nome informado (conta" : "acompanhantes ainda sem nome informado (contam"} como adulto).`}
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href="/admin/presenca/lista">
              <ListChecks aria-hidden /> Lista da portaria
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <a href="/admin/turma/exportar?tipo=portaria">
              <FileDown aria-hidden /> Baixar planilha
            </a>
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5 text-lg">
            <SlidersHorizontal className="size-5 text-[var(--vitrine-a)]" aria-hidden />
            Limite de acompanhantes
          </CardTitle>
          <CardDescription className="text-pretty">
            Quantos acompanhantes cada membro pode levar. Vale para toda a turma:{" "}
            {admin.maxAcompanhantes === 0
              ? "hoje ninguém pode levar acompanhante."
              : `hoje cada membro pode levar até ${admin.maxAcompanhantes}.`}{" "}
            Baixar o limite não corta ninguém: quem já estava acima mantém a lista e aparece marcado abaixo.
            {resumo.acimaDoLimite > 0 && (
              <strong className="mt-1 block font-medium text-amber-700 dark:text-amber-400">
                {resumo.acimaDoLimite}{" "}
                {resumo.acimaDoLimite === 1 ? "resposta acima do limite." : "respostas acima do limite."} Converse
                com {resumo.acimaDoLimite === 1 ? "a pessoa" : "as pessoas"}.
              </strong>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormDialog
            rotulo="Editar limite de acompanhantes"
            icone={<Settings2 aria-hidden />}
            titulo="Acompanhantes por pessoa"
            descricao="Baixar o limite não corta ninguém. Quem já tinha mais acompanhantes mantém a lista e só pode remover nomes."
            acao={salvarLimiteAcompanhantes}
            rotuloSubmit="Salvar limite"
            rotuloPendente="Salvando…"
            dialogClassName="sm:max-w-md"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="maxAcompanhantes">Acompanhantes por pessoa</Label>
              <Input
                id="maxAcompanhantes"
                name="maxAcompanhantes"
                type="number"
                inputMode="numeric"
                min={0}
                max={TETO_ACOMPANHANTES}
                defaultValue={admin.maxAcompanhantes}
                className="h-10 sm:w-32"
              />
              <p className="text-xs text-muted-foreground">
                De 0 (sem acompanhantes) a {TETO_ACOMPANHANTES}.
              </p>
            </div>
          </FormDialog>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5 text-lg">
            <CalendarClock className="size-5 text-[var(--vitrine-a)]" aria-hidden />
            Prazo para confirmar presença
          </CardTitle>
          <CardDescription className="text-pretty">
            {admin.presencaAte
              ? fechada
                ? `A lista fechou em ${formatarDataHora.format(admin.presencaAte)}. Ninguém consegue mais responder nem mudar a resposta. Para reabrir, mude ou apague a data.`
                : `A turma responde até ${formatarDataHora.format(admin.presencaAte)}. Depois disso a resposta trava. Quem não respondeu recebe um email 2 dias antes.`
              : "Sem prazo: cada pessoa responde e muda a resposta quando quiser. Marque uma data para fechar o número com o buffet."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormDialog
            rotulo={admin.presencaAte ? "Mudar o prazo" : "Marcar prazo"}
            icone={<CalendarClock aria-hidden />}
            titulo="Prazo para confirmar presença"
            descricao="Depois do prazo, ninguém responde nem muda a resposta. A turma vê a data no dashboard e a mudança aparece no histórico."
            acao={salvarPrazoPresenca}
            rotuloSubmit="Salvar prazo"
            rotuloPendente="Salvando…"
            dialogClassName="sm:max-w-md"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="prazo-presenca">Responder até</Label>
              <Input
                id="prazo-presenca"
                name="prazo"
                type="datetime-local"
                defaultValue={admin.presencaAte ? paraDatetimeLocal(admin.presencaAte) : ""}
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">Deixe em branco para não ter prazo.</p>
            </div>
          </FormDialog>
        </CardContent>
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
        <EstadoVazio
          className="mt-4"
          descricao="Escolha outro filtro para ver os demais."
          ilustracao={<EquipeAmico />}
          titulo="Ninguém neste filtro"
        />
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
                    {m.status === "vou" && m.acompanhantes > admin.maxAcompanhantes && (
                      <Badge variant="outline" className="text-amber-700 dark:text-amber-400">
                        acima do limite
                      </Badge>
                    )}
                  </div>
                  {m.status === "vou" && m.acompanhantes > 0 && (
                    <p className="basis-full text-sm">
                      {[
                        ...m.lista.map((a) => (a.tipo === "crianca" ? `${a.nome} (criança)` : a.nome)),
                        ...(m.acompanhantes > m.lista.length
                          ? [`${m.acompanhantes - m.lista.length} sem nome`]
                          : []),
                      ].join(", ")}
                    </p>
                  )}
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
