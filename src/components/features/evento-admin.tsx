import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  adicionarItemProgramacao,
  atualizarItemProgramacao,
  desligarPaginaPublica,
  removerItemProgramacao,
  salvarEvento,
  trocarLinkPublico,
} from "@/actions/evento";
import type { EstadoForm } from "@/actions/tipos";
import { FormDialog } from "@/components/features/form-dialog";
import { LinkPublicoEvento } from "@/components/features/link-publico-evento";
import { MandarParaGrupo } from "@/components/features/mandar-para-grupo";
import { AcaoDialogo, AcaoExcluir, AcaoSeparador, MenuAcoes } from "@/components/features/menu-acoes";
import { PainelRecolhivel } from "@/components/features/painel-recolhivel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { ACESSIBILIDADE_OBS_MAX, ITENS_ACESSIBILIDADE, valorDoSelect } from "@/lib/acessibilidade";
import type { EventoAdmin as DadosEvento } from "@/lib/admin";
import type { ItemProgramacao } from "@/lib/dashboard";
import type { MudancaRecente } from "@/lib/evento-publico";
import { formatarDiaCurto, formatarHora, paraDatetimeLocal } from "@/lib/datas";

// Trocar e desligar o link público não devolvem estado; o "⋯" precisa de um
// texto para o toast.
async function trocarLink(): Promise<EstadoForm> {
  "use server";
  await trocarLinkPublico();
  return { ok: "Link trocado. O anterior parou de funcionar." };
}
async function desligarLink(): Promise<EstadoForm> {
  "use server";
  await desligarPaginaPublica();
  return { ok: "Link público desligado." };
}

// "Mais detalhes" dentro do diálogo: <details> que já abre quando há algo
// preenchido, para ninguém editar sem ver o que existe.
function MaisDetalhes({ rotulo, aberto, children }: { rotulo: string; aberto: boolean; children: React.ReactNode }) {
  return (
    <PainelRecolhivel abertoInicial={aberto} className="group rounded-lg border px-3 py-2">
      <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium pointer-coarse:min-h-11">
        <Plus className="size-4 transition-transform group-open:rotate-45" aria-hidden /> {rotulo}
      </summary>
      <div className="mt-3 flex flex-col gap-4 pb-1">{children}</div>
    </PainelRecolhivel>
  );
}

// Gestão do evento pela comissão, em /admin/evento (D-08): os dados, o link
// público e a programação. Recebe os dados por props (buscados uma vez na
// página): buscar de novo aqui duplicava `listarProgramacao`.
export function EventoAdmin({
  evento,
  programacao,
  mudanca,
}: {
  evento: DadosEvento;
  programacao: ItemProgramacao[];
  // Última mudança dos últimos 14 dias (ADR-0017): vai no texto do grupo.
  mudanca?: MudancaRecente["mudancas"];
}) {
  const acessPreenchida =
    ITENS_ACESSIBILIDADE.some((item) => evento.acessibilidade[item.campo] !== null) || !!evento.acessibilidade.obs;

  return (
    <>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle nivel={2} className="text-lg">
            Dados do evento
          </CardTitle>
          <CardDescription>
            {evento.nome ? `${evento.nome}. ` : "Nada preenchido ainda. "}A turma vê tudo isso no Início.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          {/* D-04: um diálogo, uma coluna no celular, em três partes
              (Quando · Onde · Acessibilidade e traje); o que é opcional fica
              recolhido em "Mais detalhes". */}
          <FormDialog
            rotulo="Editar dados do evento"
            icone={<Pencil aria-hidden />}
            variante="default"
            tamanho="default"
            titulo="Dados do evento"
            descricao="Aparecem no Início de todos os membros e na página da família."
            acao={salvarEvento}
            rotuloSubmit="Salvar"
            rotuloPendente="Salvando…"
            dialogClassName="max-h-[90dvh] overflow-y-auto sm:max-w-xl"
          >
            <Field>
              <FieldLabel htmlFor="nome">Nome da turma</FieldLabel>
              <Input id="nome" name="nome" defaultValue={evento.nome} maxLength={100} className="h-10" required />
            </Field>
            <MaisDetalhes rotulo="Descrição para a turma (opcional)" aberto={!!evento.descricao}>
              <Field>
                <FieldLabel htmlFor="descricao">Descrição</FieldLabel>
                <Textarea
                  id="descricao"
                  name="descricao"
                  defaultValue={evento.descricao}
                  maxLength={1000}
                  rows={3}
                  placeholder="Ex.: A formatura da turma de Sistemas de Informação. Venha comemorar com a gente!"
                />
                <FieldDescription>Aparece no topo do Início, para todos os membros.</FieldDescription>
              </Field>
            </MaisDetalhes>

            <FieldSet className="gap-3 border-t pt-4">
              <FieldLegend>Quando</FieldLegend>
              <div className="grid gap-3 sm:grid-cols-2 [&>*]:min-w-0">
                <Field>
                  <FieldLabel htmlFor="dataEvento">Início da festa</FieldLabel>
                  <Input
                    id="dataEvento"
                    name="dataEvento"
                    type="datetime-local"
                    defaultValue={evento.dataLocal}
                    className="h-10"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="dataFimEvento">Término (opcional)</FieldLabel>
                  <Input
                    id="dataFimEvento"
                    name="dataFimEvento"
                    type="datetime-local"
                    defaultValue={evento.dataFimLocal}
                    className="h-10"
                  />
                </Field>
              </div>
            </FieldSet>

            <FieldSet className="gap-3 border-t pt-4">
              <FieldLegend>Onde</FieldLegend>
              <Field>
                <FieldLabel htmlFor="localEvento">Nome do local</FieldLabel>
                <Input
                  id="localEvento"
                  name="localEvento"
                  defaultValue={evento.local}
                  maxLength={255}
                  placeholder="Ex.: Salão Cristal"
                  className="h-10"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="endereco">Endereço (opcional)</FieldLabel>
                <Input
                  id="endereco"
                  name="endereco"
                  defaultValue={evento.endereco}
                  maxLength={255}
                  placeholder="Rua, número, bairro e cidade"
                  className="h-10"
                />
              </Field>
              <MaisDetalhes
                rotulo="Entrada, mapa e observações"
                aberto={!!(evento.entrada || evento.linkMapa || evento.observacoesLocal)}
              >
                <Field>
                  <FieldLabel htmlFor="entrada">Entrada / portão</FieldLabel>
                  <Input
                    id="entrada"
                    name="entrada"
                    defaultValue={evento.entrada}
                    maxLength={120}
                    placeholder="Ex.: Portão 2, pela Rua das Flores"
                    className="h-10"
                  />
                  <FieldDescription>
                    Se mudar, a turma recebe o aviso “Mudou”, como acontece com o horário e o local.
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="linkMapa">Link do mapa</FieldLabel>
                  <Input
                    id="linkMapa"
                    name="linkMapa"
                    type="url"
                    defaultValue={evento.linkMapa}
                    maxLength={500}
                    placeholder="https://maps.app.goo.gl/…"
                    className="h-10"
                  />
                  <FieldDescription>
                    Vira o botão “Como chegar”. Sem link, o botão busca o endereço (ou o nome do local) no Google Maps.
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="observacoesLocal">Observações do local</FieldLabel>
                  <Textarea
                    id="observacoesLocal"
                    name="observacoesLocal"
                    defaultValue={evento.observacoesLocal}
                    maxLength={500}
                    rows={2}
                    placeholder="Estacionamento, portaria…"
                  />
                </Field>
              </MaisDetalhes>
            </FieldSet>

            <FieldSet className="gap-3 border-t pt-4">
              <FieldLegend>Acessibilidade e traje</FieldLegend>
              <Field>
                <FieldLabel htmlFor="traje">Traje (opcional)</FieldLabel>
                <Input
                  id="traje"
                  name="traje"
                  defaultValue={evento.traje}
                  maxLength={100}
                  placeholder="Ex.: Gala / Black tie"
                  className="h-10"
                />
              </Field>
              {/* ADR-0024: "Não informado" é o padrão; nunca vira "não". */}
              <MaisDetalhes rotulo="Acessibilidade do local" aberto={acessPreenchida}>
                <p className="text-xs text-muted-foreground text-pretty">
                  Só marque “Sim” ou “Não” se alguém conferiu. Sem resposta, a turma e a família leem “não
                  informada”.
                </p>
                {ITENS_ACESSIBILIDADE.map((item) => {
                  const nome = `acess${item.campo[0].toUpperCase()}${item.campo.slice(1)}`;
                  return (
                    <Field key={item.campo}>
                      <FieldLabel htmlFor={nome}>{item.rotulo}</FieldLabel>
                      <NativeSelect
                        id={nome}
                        name={nome}
                        defaultValue={valorDoSelect(evento.acessibilidade[item.campo])}
                      >
                        <option value="">Não informado</option>
                        <option value="sim">Sim</option>
                        <option value="nao">Não</option>
                      </NativeSelect>
                    </Field>
                  );
                })}
                <Field>
                  <FieldLabel htmlFor="acessObs">Observação (opcional)</FieldLabel>
                  <Input
                    id="acessObs"
                    name="acessObs"
                    defaultValue={evento.acessibilidade.obs ?? ""}
                    maxLength={ACESSIBILIDADE_OBS_MAX}
                    placeholder="Ex.: elevador pela entrada lateral"
                    className="h-10"
                  />
                </Field>
              </MaisDetalhes>
            </FieldSet>
          </FormDialog>
          {(evento.dataLocal || evento.local) && (
            <MandarParaGrupo
              conteudo={{
                tipo: "evento",
                dados: {
                  nome: evento.nome,
                  // dataLocal é horário de Brasília ("AAAA-MM-DDTHH:mm"); o Brasil
                  // não tem horário de verão desde 2019, então o fuso é -03:00.
                  data: evento.dataLocal ? new Date(`${evento.dataLocal}:00-03:00`) : null,
                  local: evento.local,
                  endereco: evento.endereco,
                  tokenPublico: evento.tokenPublico,
                  mudanca,
                },
              }}
            />
          )}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle nivel={2} className="text-lg">
            Link para a família e os convidados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LinkPublicoEvento token={evento.tokenPublico} trocar={trocarLink} desligar={desligarLink} />
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle nivel={2} className="text-lg">
              Programação da festa
            </CardTitle>
            <CardDescription>
              {programacao.length === 0
                ? "Nenhum item ainda. Horários no fuso de Brasília."
                : `${programacao.length} ${programacao.length === 1 ? "item" : "itens"}, em ordem de horário.`}
            </CardDescription>
          </div>
          <FormDialog
            rotulo="Adicionar item"
            icone={<Plus aria-hidden />}
            tamanho="default"
            titulo="Novo item da programação"
            descricao="Horário no fuso de Brasília. A lista fica em ordem de horário."
            acao={adicionarItemProgramacao}
            rotuloSubmit="Adicionar"
            rotuloPendente="Adicionando…"
          >
            <Field>
              <FieldLabel htmlFor="horario">Data e hora</FieldLabel>
              <Input id="horario" name="horario" type="datetime-local" className="h-10" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="titulo">Título</FieldLabel>
              <Input
                id="titulo"
                name="titulo"
                minLength={2}
                maxLength={255}
                placeholder="Ex.: Entrada da turma"
                className="h-10"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="descricao-item">Descrição (opcional)</FieldLabel>
              <Textarea id="descricao-item" name="descricao" rows={2} maxLength={500} />
            </Field>
          </FormDialog>
        </CardHeader>
        {programacao.length > 0 && (
          <CardContent>
            <ol data-grupo className="divide-y rounded-xl border">
              {programacao.map((item) => (
                <li key={item.id} className="flex items-start gap-3 px-4 py-3">
                  <p className="w-14 shrink-0 pt-0.5 text-sm font-semibold tabular-nums">
                    {formatarHora.format(item.horario)}
                  </p>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium wrap-break-word">{item.titulo}</p>
                    <p className="text-xs text-muted-foreground">{formatarDiaCurto.format(item.horario)}</p>
                    {item.descricao && (
                      <p className="mt-1 text-sm text-muted-foreground wrap-break-word">{item.descricao}</p>
                    )}
                  </div>
                  <MenuAcoes nome={item.titulo}>
                    <AcaoDialogo
                      rotulo="Editar item"
                      icone={<Pencil aria-hidden />}
                      titulo="Editar item da programação"
                      descricao="Horário, título e descrição do item."
                      acao={atualizarItemProgramacao}
                      campos={{ id: item.id }}
                      rotuloSubmit="Salvar"
                      rotuloPendente="Salvando…"
                    >
                      <Field>
                        <FieldLabel htmlFor={`horario-${item.id}`}>Data e hora</FieldLabel>
                        <Input
                          id={`horario-${item.id}`}
                          name="horario"
                          type="datetime-local"
                          defaultValue={paraDatetimeLocal(item.horario)}
                          className="h-10"
                          required
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor={`titulo-${item.id}`}>Título</FieldLabel>
                        <Input
                          id={`titulo-${item.id}`}
                          name="titulo"
                          defaultValue={item.titulo}
                          maxLength={255}
                          className="h-10"
                          required
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor={`descricao-${item.id}`}>Descrição (opcional)</FieldLabel>
                        <Textarea
                          id={`descricao-${item.id}`}
                          name="descricao"
                          defaultValue={item.descricao ?? ""}
                          maxLength={500}
                          rows={2}
                        />
                      </Field>
                    </AcaoDialogo>
                    <AcaoSeparador />
                    <AcaoExcluir
                      acao={removerItemProgramacao}
                      campos={{ id: item.id }}
                      alvo="o item"
                      nome={item.titulo}
                      rotulo="Remover"
                      icone={<Trash2 aria-hidden />}
                      sucesso="Item removido."
                    />
                  </MenuAcoes>
                </li>
              ))}
            </ol>
          </CardContent>
        )}
      </Card>
    </>
  );
}
