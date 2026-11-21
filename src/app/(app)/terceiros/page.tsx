import type { Metadata } from "next";
import {
  Aperture,
  Award,
  Building2,
  Bus,
  Camera,
  ExternalLink,
  Flower2,
  Gift,
  Globe,
  Lightbulb,
  Mail,
  Music,
  Pencil,
  Phone,
  ShieldCheck,
  Sparkles,
  Store,
  Trash2,
  UserRound,
  Users,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { atualizarFornecedor, excluirFornecedor } from "@/actions/terceiros";
import { CabecalhoPagina } from "@/components/features/cabecalho-pagina";
import { EstadoVazio } from "@/components/features/estado-vazio";
import { FiltrosPilula } from "@/components/features/filtros-pilula";
import { AcaoDialogo, AcaoExcluir, AcaoSeparador, MenuAcoes } from "@/components/features/menu-acoes";
import { FormNovoFornecedor } from "@/components/features/form-novo-fornecedor";
import { CamposOrcamento } from "@/components/features/form-orcamento";
import { AVISO_LINK_DOCUMENTO, LINK_DOCUMENTO_MAX } from "@/lib/link-documento";
import { ImagemFornecedor } from "@/components/features/imagem-fornecedor";
import { PainelRecolhivel } from "@/components/features/painel-recolhivel";
import { ColaboracaoAmico } from "@/components/ilustracoes/colaboracao-amico";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { exigirMembro } from "@/lib/dal";
import { formatarReal, ROTULO_ORCAMENTO } from "@/lib/orcamento";
import { lerPagina } from "@/lib/paginacao";
import { Paginacao } from "@/components/features/paginacao";
import {
  CATEGORIAS_FORNECEDOR,
  getResumoOrcamento,
  listarFornecedores,
  listarFornecedoresAdmin,
  type Fornecedor,
} from "@/lib/terceiros";

export const metadata: Metadata = { title: "Fornecedores" };

const ICONE_CATEGORIA: Record<string, LucideIcon> = {
  Buffet: UtensilsCrossed,
  "Música e DJ": Music,
  "Fotografia e vídeo": Camera,
  "Cabine de fotos": Aperture,
  Decoração: Flower2,
  "Cerimônia e honras": Award,
  "Equipe de apoio": Users,
  "Segurança e portaria": ShieldCheck,
  "Iluminação e som": Lightbulb,
  Espaço: Building2,
  "Transporte e hospedagem": Bus,
  "Higiene e limpeza": Sparkles,
  "Brindes e lembrancinhas": Gift,
  Outros: Store,
};

// Só vira link o que é claramente um site, e-mail ou telefone; qualquer outro
// texto aparece como texto puro.
function Contato({ valor }: { valor: string }) {
  const classe = "inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-primary pointer-coarse:py-2";
  if (/^https?:\/\//i.test(valor)) {
    return (
      <a href={valor} target="_blank" rel="noopener noreferrer" className={classe}>
        <Globe className="size-4 shrink-0" aria-hidden />
        <span className="wrap-anywhere">{valor}</span>
        <ExternalLink className="size-3.5 shrink-0" aria-hidden />
      </a>
    );
  }
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
    return (
      <a href={`mailto:${valor}`} className={classe}>
        <Mail className="size-4 shrink-0" aria-hidden />
        <span className="wrap-anywhere">{valor}</span>
      </a>
    );
  }
  if (/^\+?[\d\s()-]{8,}$/.test(valor)) {
    return (
      <a href={`tel:${valor.replace(/[^\d+]/g, "")}`} className={classe}>
        <Phone className="size-4 shrink-0" aria-hidden />
        {valor}
      </a>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      <UserRound className="size-4 shrink-0" aria-hidden />
      <span className="wrap-anywhere">{valor}</span>
    </span>
  );
}

// Fornecedores (a URL /terceiros continua, D-10). A lista vem primeiro para
// todo mundo. O admin ganha "Novo fornecedor" no cabeçalho, uma linha com o
// orçamento (só ele vê valores) e o "⋯" com Editar e Remover em cada linha
// (P-09, D-05). Só aparecem chips de categorias que têm fornecedor; o link
// ?categoria= de uma categoria vazia continua funcionando.
export default async function TerceirosPage(props: PageProps<"/terceiros">) {
  const membro = await exigirMembro();
  const { categoria: parametro, pagina: paginaParametro } = await props.searchParams;
  const ehAdmin = membro.papel === "admin";
  const categoriaAtiva = CATEGORIAS_FORNECEDOR.find((c) => c === parametro);
  const [{ itens: visiveis, pagina, totalPaginas, totais }, resumo] = await Promise.all([
    ehAdmin
      ? listarFornecedoresAdmin(membro.turmaId, {
          categoria: categoriaAtiva,
          pagina: lerPagina(paginaParametro),
        })
      : listarFornecedores(membro, {
          categoria: categoriaAtiva,
          pagina: lerPagina(paginaParametro),
        }),
    ehAdmin ? getResumoOrcamento(membro.turmaId) : Promise.resolve(null),
  ]);
  const geral = Object.values(totais).reduce((n, c) => n + c, 0);
  const categoriasComItens = CATEGORIAS_FORNECEDOR.filter((c) => (totais[c] ?? 0) > 0 || c === categoriaAtiva);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <CabecalhoPagina
        titulo="Fornecedores"
        descricao="Fornecedores e prestadores de serviço indicados pela comissão."
        acao={ehAdmin ? <FormNovoFornecedor categorias={CATEGORIAS_FORNECEDOR} /> : undefined}
      />

      {ehAdmin && resumo && (
        <p className="mt-4 text-sm text-muted-foreground tabular-nums text-pretty">
          <span className="font-medium text-foreground">
            Orçamento com fornecedores: {formatarReal.format(resumo.orcado)}
          </span>{" "}
          · {formatarReal.format(resumo.contratado)} contratado · {formatarReal.format(resumo.cotando)} em cotação. Só
          administradores veem valores.
        </p>
      )}

      {geral > 0 && categoriasComItens.length > 1 && (
        <FiltrosPilula
          className="mt-6"
          rotulo="Categorias"
          filtros={[
            { rotulo: "Todas", href: "/terceiros", ativo: !categoriaAtiva, contagem: geral },
            ...categoriasComItens.map((c) => ({
              rotulo: c,
              href: `/terceiros?categoria=${encodeURIComponent(c)}`,
              ativo: c === categoriaAtiva,
              contagem: totais[c] ?? 0,
            })),
          ]}
        />
      )}

      {visiveis.length === 0 ? (
        <EstadoVazio
          className="mt-4"
          descricao={
            geral === 0
              ? ehAdmin
                ? "Adicione o primeiro em “Novo fornecedor”."
                : "A comissão ainda não indicou fornecedores."
              : "Escolha outra categoria para ver os demais."
          }
          ilustracao={<ColaboracaoAmico />}
          titulo="Nenhum fornecedor por aqui"
        />
      ) : (
        <ul data-grupo className="mt-4 divide-y rounded-xl border">
          {visiveis.map((f) => {
            const Icone = ICONE_CATEGORIA[f.categoria] ?? Store;
            const admin = ehAdmin ? (f as Fornecedor) : null;
            return (
              <li key={f.id} className="flex gap-3 p-4">
                {f.imagemUrl ? (
                  <ImagemFornecedor src={f.imagemUrl} alt={f.nome} className="h-14 w-14 shrink-0 sm:h-20 sm:w-20" />
                ) : (
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/50 text-muted-foreground">
                    <Icone className="size-5" aria-hidden />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium wrap-break-word">{f.nome}</p>
                      {/* Com a categoria filtrada, o badge só repetiria o filtro. */}
                      {(!categoriaAtiva || admin) && (
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          {!categoriaAtiva && <Badge variant="secondary">{f.categoria}</Badge>}
                          {admin && <Badge variant="outline">{ROTULO_ORCAMENTO[admin.status]}</Badge>}
                        </div>
                      )}
                    </div>
                    {admin && (
                      <MenuAcoes nome={f.nome} className="-mt-1 -mr-1">
                        <AcaoDialogo
                          rotulo="Editar dados"
                          icone={<Pencil aria-hidden />}
                          titulo="Editar fornecedor"
                          descricao="Dados do fornecedor e orçamento."
                          acao={atualizarFornecedor}
                          campos={{ id: f.id }}
                        >
                          <div className="grid gap-3 sm:grid-cols-2 [&>*]:min-w-0">
                            <div className="flex flex-col gap-1.5">
                              <Label htmlFor={`nome-${f.id}`}>Nome</Label>
                              <Input id={`nome-${f.id}`} name="nome" defaultValue={f.nome} maxLength={255} required />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <Label htmlFor={`categoria-${f.id}`}>Categoria</Label>
                              <NativeSelect id={`categoria-${f.id}`} name="categoria" defaultValue={f.categoria} required>
                                {CATEGORIAS_FORNECEDOR.map((c) => (
                                  <option key={c} value={c}>
                                    {c}
                                  </option>
                                ))}
                              </NativeSelect>
                            </div>
                            <div className="flex flex-col gap-1.5 sm:col-span-2">
                              <Label htmlFor={`contato-${f.id}`}>Contato</Label>
                              <Input id={`contato-${f.id}`} name="contato" defaultValue={f.contato ?? ""} maxLength={255} />
                            </div>
                            <CamposOrcamento fornecedorId={f.id} status={admin.status} valorOrcado={admin.valorOrcado} />
                          </div>
                          <PainelRecolhivel className="group">
                            <summary className="cursor-pointer text-sm font-medium pointer-coarse:py-2.5">
                              Mais detalhes
                            </summary>
                            <div className="mt-3 flex flex-col gap-3">
                              <div className="flex flex-col gap-1.5">
                                <Label htmlFor={`descricao-${f.id}`}>Descrição</Label>
                                <Textarea
                                  id={`descricao-${f.id}`}
                                  name="descricao"
                                  defaultValue={f.descricao ?? ""}
                                  maxLength={1000}
                                  rows={2}
                                />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <Label htmlFor={`imagemUrl-${f.id}`}>Imagem (link)</Label>
                                <Input
                                  id={`imagemUrl-${f.id}`}
                                  name="imagemUrl"
                                  type="url"
                                  defaultValue={f.imagemUrl ?? ""}
                                  maxLength={500}
                                />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <Label htmlFor={`linkDocumento-${f.id}`}>Link do documento</Label>
                                <Input
                                  id={`linkDocumento-${f.id}`}
                                  name="linkDocumento"
                                  type="url"
                                  defaultValue={admin.linkDocumento ?? ""}
                                  maxLength={LINK_DOCUMENTO_MAX}
                                  placeholder="https://drive.google.com/…"
                                  aria-describedby={`linkDocumento-ajuda-${f.id}`}
                                />
                                <p id={`linkDocumento-ajuda-${f.id}`} className="text-xs text-muted-foreground text-pretty">
                                  Contrato ou orçamento. Só a comissão vê. {AVISO_LINK_DOCUMENTO}
                                </p>
                              </div>
                            </div>
                          </PainelRecolhivel>
                        </AcaoDialogo>
                        <AcaoSeparador />
                        <AcaoExcluir
                          acao={excluirFornecedor}
                          campos={{ id: f.id }}
                          alvo="o fornecedor"
                          nome={f.nome}
                          rotulo="Remover"
                          descricao={`Remover o fornecedor ${f.nome}`}
                          icone={<Trash2 aria-hidden />}
                          sucesso="Fornecedor removido."
                        />
                      </MenuAcoes>
                    )}
                  </div>
                  {f.descricao && (
                    <p className="mt-1.5 wrap-break-word whitespace-pre-wrap text-sm text-muted-foreground">{f.descricao}</p>
                  )}
                  {(f.contato || admin?.linkDocumento) && (
                    <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm wrap-break-word">
                      {f.contato && <Contato valor={f.contato} />}
                      {admin?.linkDocumento && (
                        <a
                          href={admin.linkDocumento}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-4 pointer-coarse:py-2"
                        >
                          Ver documento
                          <span className="sr-only"> de {f.nome} (abre em nova aba)</span>
                        </a>
                      )}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <Paginacao
        pagina={pagina}
        totalPaginas={totalPaginas}
        caminho="/terceiros"
        parametros={{ categoria: categoriaAtiva }}
      />
    </div>
  );
}
