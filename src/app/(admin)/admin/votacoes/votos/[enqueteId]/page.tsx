import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { CalendarClock, CircleCheck, FileText, Gavel, Pencil, Pin, RotateCcw } from "lucide-react";
import { avisarVotacao, salvarRegraEnquete } from "@/actions/catalogos";
import { fixarDecisao, reabrirVotacao } from "@/actions/decisoes";
import { AvatarUsuario } from "@/components/features/avatar-usuario";
import { CabecalhoPagina } from "@/components/features/cabecalho-pagina";
import { CamposFixarDecisao } from "@/components/features/campos-fixar-decisao";
import { FormAcao } from "@/components/features/form-acao";
import { FormDialog } from "@/components/features/form-dialog";
import { HistoricoDecisoes } from "@/components/features/historico-decisoes";
import { LinkVoltar } from "@/components/features/link-voltar";
import { MandarParaGrupo } from "@/components/features/mandar-para-grupo";
import { PainelRecolhivel } from "@/components/features/painel-recolhivel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { getCatalogoAdmin, getTituloEnquete, getVotosEnquete, type Votante } from "@/lib/admin";
import { listarHistoricoDecisoes } from "@/lib/auditoria";
import { formatarDataHora } from "@/lib/datas";
import { exigirAdmin } from "@/lib/dal";

function Pessoa({ v }: { v: Votante }) {
  return (
    <li className="flex items-center gap-2 rounded-full border bg-muted/30 py-1 pr-3 pl-1">
      <AvatarUsuario nome={v.nome} imagem={v.imagem} className="size-6 text-[11px]" />
      <span className="truncate text-sm">{v.nome}</span>
    </li>
  );
}

export async function generateMetadata(
  props: PageProps<"/admin/votacoes/votos/[enqueteId]">,
): Promise<Metadata> {
  const admin = await exigirAdmin();
  const { enqueteId } = await props.params;
  if (!z.uuid().safeParse(enqueteId).success) return {};
  const dados = await getTituloEnquete(enqueteId, admin.turmaId);
  if (!dados) return {};
  return { title: `Resultado e decisão: ${dados}` };
}

// "Resultado e decisão" (D-07 do plano de UX): a página da pergunta reúne o
// ciclo inteiro — regra, avisar a turma, acompanhar, fixar e mandar para o
// grupo. Antes isso se dividia entre o catálogo (nove botões por pergunta) e
// esta página, que se chamava "Quem votou" e não dizia o que foi decidido.
export default async function VotosEnquetePage(
  props: PageProps<"/admin/votacoes/votos/[enqueteId]">,
) {
  const admin = await exigirAdmin();
  const { enqueteId } = await props.params;
  if (!z.uuid().safeParse(enqueteId).success) notFound();
  const [dados, historico] = await Promise.all([
    getVotosEnquete(enqueteId, admin.turmaId),
    listarHistoricoDecisoes(admin.turmaId, enqueteId),
  ]);
  if (!dados) notFound();
  // Regra (com o prazo pronto para o campo), aviso por email, valor por pessoa
  // e visibilidade vêm da mesma leitura do catálogo, sem query nova.
  const catalogo = await getCatalogoAdmin(dados.catalogoId, admin.turmaId);
  const enquete = catalogo?.categorias.flatMap((c) => c.enquetes).find((e) => e.id === enqueteId);
  if (!catalogo || !enquete) notFound();

  // Em pergunta secreta (ADR-0010) não há nome por opção: os números vêm de
  // `votos` e de `votaram`, que servem para os dois casos.
  const secreto = dados.regra.secreto;
  const jaVotaram = dados.votaram.length;
  const totalMembros = jaVotaram + dados.naoVotaram.length;
  const maisVotos = Math.max(0, ...dados.opcoes.map((o) => o.votos));
  const decidida = dados.decisao.length > 0;
  const escolhas = dados.opcoes.filter((o) => dados.decisao.includes(o.id)).map((o) => o.texto);
  // Sem decisão, já marca a mais votada (ou as empatadas) como sugestão.
  const sugeridas = decidida
    ? dados.decisao
    : dados.opcoes.filter((o) => maisVotos > 0 && o.votos === maisVotos).map((o) => o.id);
  const regraTexto = [
    dados.regra.prazo && `votação até ${formatarDataHora.format(dados.regra.prazo)}`,
    dados.regra.quorumPct && `quórum de ${dados.regra.quorumPct}% da turma`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="mx-auto w-full max-w-4xl 2xl:max-w-6xl">
      <CabecalhoPagina
        antes={<LinkVoltar href={`/admin/votacoes/${dados.catalogoId}`}>Voltar ao catálogo</LinkVoltar>}
        titulo={dados.titulo}
        descricao={
          <>
            {dados.tipo === "unica" ? "Escolha única" : "Escolha múltipla"}.{" "}
            {secreto
              ? "Voto secreto: ninguém vê a escolha de cada pessoa, nem a comissão."
              : "Só os administradores da turma veem quem votou em cada opção."}
          </>
        }
        acao={
          // P-14: fixar continua em diálogo, porque é um ato explícito e assinado.
          <FormDialog
            rotulo={decidida ? "Trocar decisão" : "Fixar decisão"}
            icone={decidida ? <Pencil aria-hidden /> : <Pin aria-hidden />}
            variante={decidida ? "outline" : "default"}
            tamanho="default"
            titulo={decidida ? "Trocar a decisão" : "Fixar decisão"}
            descricao="A opção escolhida vai para o dashboard de todos e a votação desta pergunta é encerrada. A turma vê os números e o motivo."
            acao={fixarDecisao}
            campos={{ enqueteId }}
            rotuloSubmit={decidida ? "Trocar decisão" : "Fixar decisão"}
            rotuloPendente="Salvando…"
          >
            <CamposFixarDecisao
              tipo={dados.tipo}
              opcoes={dados.opcoes.map((o) => ({ id: o.id, texto: o.texto, votos: o.votos }))}
              sugeridas={sugeridas}
              votantes={jaVotaram}
              membros={totalMembros}
              prazo={dados.regra.prazo ? dados.regra.prazo.toISOString() : null}
              quorumPct={dados.regra.quorumPct}
              justificativaAtual={dados.justificativa}
              linkAtual={dados.linkDocumento}
            />
          </FormDialog>
        }
      />

      {/* O estado da pergunta em primeiro lugar (princípio 3, "Decisão
          explícita"): o que foi escolhido, ou que ainda falta decidir. */}
      <Alert role="status" className="mt-6 px-4 py-3">
        <Gavel aria-hidden />
        <AlertTitle className="text-base">
          {decidida ? (
            <>
              Decisão da turma: <span className="font-semibold">{escolhas.join(", ")}</span>
            </>
          ) : (
            "Decisão da turma: ainda sem decisão"
          )}
        </AlertTitle>
        <AlertDescription className="text-pretty">
          {decidida ? (
            <>
              <p>Votação encerrada. A escolha aparece no dashboard de todos; para votar de novo, reabra a votação.</p>
              {dados.justificativa && <p>Motivo da comissão: “{dados.justificativa}”</p>}
              {dados.linkDocumento && (
                <a
                  href={dados.linkDocumento}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1.5 font-medium text-foreground underline underline-offset-4 pointer-coarse:min-h-11"
                >
                  <FileText className="size-4" aria-hidden /> Ver documento
                  <span className="sr-only">(abre em outra aba)</span>
                </a>
              )}
            </>
          ) : (
            <p>
              Quando a turma tiver votado, fixe a opção escolhida. Ela vai para o dashboard de todos e a votação
              desta pergunta é encerrada.
            </p>
          )}
        </AlertDescription>
      </Alert>

      <Card className="mt-4">
        <CardHeader>
          <CardDescription>Participação nesta pergunta</CardDescription>
          <CardTitle className="text-2xl tabular-nums">
            <span data-contar={jaVotaram}>{jaVotaram}</span>{" "}
            <span className="text-base font-normal text-muted-foreground">
              de {totalMembros} {totalMembros === 1 ? "membro votou" : "membros votaram"}
            </span>
          </CardTitle>
          <Progress
            className="mt-2 h-2"
            value={totalMembros === 0 ? 0 : (jaVotaram / totalMembros) * 100}
            aria-label="Participação nesta pergunta"
          />
          <p className="mt-2 text-sm text-muted-foreground">
            {regraTexto ? `Regra combinada: ${regraTexto}.` : "Sem prazo nem quórum combinados."}
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <FormDialog
            rotulo="Regra da votação"
            icone={<CalendarClock aria-hidden />}
            titulo="Regra para fixar a decisão"
            descricao="Combine antes com a turma. Depois do prazo a pergunta não aceita mais voto. Se a comissão fixar fora da regra, precisa escrever o motivo."
            acao={salvarRegraEnquete}
            campos={{ enqueteId }}
            rotuloSubmit="Salvar regra"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`prazo-${enqueteId}`}>Prazo para votar (opcional)</Label>
              <Input
                id={`prazo-${enqueteId}`}
                name="prazo"
                type="datetime-local"
                defaultValue={enquete.regra.prazoLocal}
                className="h-10"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`quorum-${enqueteId}`}>Quórum: mínimo de votos, em % da turma (opcional)</Label>
              <Input
                id={`quorum-${enqueteId}`}
                name="quorum"
                inputMode="numeric"
                placeholder="50"
                maxLength={4}
                defaultValue={enquete.regra.quorumPct ?? ""}
                className="h-10 w-28 tabular-nums"
              />
            </div>
            <div className="flex items-start gap-3 rounded-lg border bg-muted/50 p-3">
              {/* Com voto, a caixa trava; o campo escondido mantém o valor atual no envio. */}
              {enquete.votantes > 0 && enquete.regra.secreto && <input type="hidden" name="secreto" value="on" />}
              <Checkbox
                id={`secreto-${enqueteId}`}
                name={enquete.votantes > 0 ? undefined : "secreto"}
                defaultChecked={enquete.regra.secreto}
                disabled={enquete.votantes > 0}
                className="mt-0.5"
                aria-describedby={`secreto-ajuda-${enqueteId}`}
              />
              <div className="flex flex-col gap-1">
                <Label htmlFor={`secreto-${enqueteId}`}>Voto secreto</Label>
                <p id={`secreto-ajuda-${enqueteId}`} className="text-xs text-muted-foreground">
                  Ninguém vê a escolha de cada pessoa, nem a comissão. Continua aparecendo quem já votou e quem
                  falta.{" "}
                  {enquete.votantes > 0
                    ? "Já existem votos. Esta opção não pode mais mudar."
                    : "Só dá para mudar enquanto ninguém votou."}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Deixe em branco para não ter prazo ou quórum. Toda mudança aparece no histórico da turma.
            </p>
          </FormDialog>
          {/* ADR-0018: email de votação aberta, uma vez por pergunta. */}
          {!decidida &&
            !enquete.oculta &&
            enquete.prazoAberto &&
            (enquete.avisadaEm ? (
              <span className="px-2 text-sm text-muted-foreground">
                Turma avisada por email em {formatarDataHora.format(enquete.avisadaEm)}
              </span>
            ) : (
              <FormAcao
                acao={avisarVotacao}
                rotulo="Avisar a turma por email"
                rotuloPendente="Avisando…"
                variante="outline"
                className="contents"
              >
                <input type="hidden" name="enqueteId" value={enqueteId} />
                <input type="hidden" name="catalogoId" value={dados.catalogoId} />
              </FormAcao>
            ))}
          {decidida ? (
            <MandarParaGrupo
              conteudo={{
                tipo: "decisao",
                dados: {
                  pergunta: dados.titulo,
                  escolhas,
                  votantes: dados.decisaoVotantes,
                  membros: dados.decisaoMembros,
                  justificativa: dados.justificativa,
                },
              }}
            />
          ) : (
            !enquete.oculta && (
              <MandarParaGrupo
                conteudo={{
                  tipo: "votacao",
                  dados: {
                    pergunta: dados.titulo,
                    catalogoId: dados.catalogoId,
                    enqueteId,
                    prazo: enquete.regra.prazo,
                    quorumPct: enquete.regra.quorumPct,
                    secreto: enquete.regra.secreto,
                    opcoes: enquete.opcoes.map((o) => ({ texto: o.texto, valorPessoa: o.valorPessoa })),
                    votantes: enquete.votantes,
                    membros: catalogo.membros,
                  },
                }}
              />
            )
          )}
          {decidida && (
            <FormDialog
              rotulo="Reabrir votação"
              icone={<RotateCcw aria-hidden />}
              variante="ghost"
              titulo="Reabrir votação"
              descricao="Todos voltam a poder votar e a decisão sai do dashboard. A decisão anterior continua no histórico da turma."
              acao={reabrirVotacao}
              campos={{ enqueteId }}
              rotuloSubmit="Reabrir votação"
              rotuloPendente="Salvando…"
            />
          )}
        </CardContent>
      </Card>

      {/* Uma lista só para o resultado: opção, contagem, barra e os nomes. Os
          nomes ficam à vista (sem recolher) para a comissão conferir quem votou. */}
      <h2 className="mt-8 text-lg font-semibold">Resultado</h2>
      <div data-grupo className="mt-3 divide-y rounded-xl border">
        {dados.opcoes.map((o) => {
          const lider = maisVotos > 0 && o.votos === maisVotos;
          const escolhida = dados.decisao.includes(o.id);
          return (
            <div key={o.id} className="flex flex-col gap-2 px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium wrap-break-word">{o.texto}</p>
                <Badge variant="secondary">
                  {o.votos} {o.votos === 1 ? "voto" : "votos"}
                </Badge>
                {escolhida && <Badge>Decisão</Badge>}
                {lider && <Badge variant="outline">Mais votada</Badge>}
              </div>
              <Progress
                value={jaVotaram === 0 ? 0 : (o.votos / jaVotaram) * 100}
                aria-label={`Votos em ${o.texto}`}
              />
              {o.votos === 0 ? (
                <p className="text-sm text-muted-foreground">Ninguém votou nesta opção.</p>
              ) : secreto ? (
                <p className="text-sm text-muted-foreground">Os nomes não aparecem: voto secreto.</p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {o.votantes.map((v) => (
                    <Pessoa key={v.id} v={v} />
                  ))}
                </ul>
              )}
            </div>
          );
        })}

        {secreto && (
          <div className="flex flex-col gap-2 px-4 py-3">
            <p className="flex items-center gap-2 font-medium">
              Já votaram <Badge variant="outline">{dados.votaram.length}</Badge>
            </p>
            <p className="text-sm text-muted-foreground">Em ordem alfabética, sem a escolha de cada pessoa.</p>
            {dados.votaram.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ninguém votou ainda.</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {dados.votaram.map((v) => (
                  <Pessoa key={v.id} v={v} />
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2 bg-muted/30 px-4 py-3">
          <p className="flex items-center gap-2 font-medium">
            Ainda não votaram <Badge variant="outline">{dados.naoVotaram.length}</Badge>
          </p>
          {dados.naoVotaram.length === 0 ? (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CircleCheck className="size-4" aria-hidden /> Todos os membros já votaram.
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {dados.naoVotaram.map((v) => (
                <Pessoa key={v.id} v={v} />
              ))}
            </ul>
          )}
        </div>
      </div>

      <PainelRecolhivel className="group mt-6 rounded-xl border px-4 py-3">
        <summary className="flex cursor-pointer items-center gap-2 font-medium pointer-coarse:min-h-11">
          Histórico desta pergunta ({historico.length})
        </summary>
        <p className="mt-2 text-sm text-muted-foreground">A turma também vê este histórico no dashboard.</p>
        <div className="mt-3">
          <HistoricoDecisoes itens={historico} />
        </div>
      </PainelRecolhivel>
    </div>
  );
}
