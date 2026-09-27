import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  Camera,
  ExternalLink,
  Flower2,
  Globe,
  Handshake,
  Mail,
  Wallet,
  Music,
  Phone,
  Plus,
  Store,
  Trash2,
  UserRound,
  Users,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { excluirFornecedor } from "@/actions/terceiros";
import { FormOrcamento } from "@/components/features/form-orcamento";
import { FormNovoFornecedor } from "@/components/features/form-novo-fornecedor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { exigirMembro } from "@/lib/dal";
import { cn } from "@/lib/utils";
import { formatarReal, ROTULO_ORCAMENTO } from "@/lib/orcamento";
import {
  CATEGORIAS_FORNECEDOR,
  getResumoOrcamento,
  listarFornecedores,
  listarFornecedoresAdmin,
  type Fornecedor,
} from "@/lib/terceiros";

export const metadata: Metadata = { title: "Terceiros" };

const ICONE_CATEGORIA: Record<string, LucideIcon> = {
  Buffet: UtensilsCrossed,
  "Música e DJ": Music,
  "Fotografia e vídeo": Camera,
  Decoração: Flower2,
  "Equipe de apoio": Users,
  Espaço: Building2,
  Outros: Store,
};

// Só vira link o que é claramente um site, e-mail ou telefone; qualquer outro
// texto aparece como texto puro.
function Contato({ valor }: { valor: string }) {
  const classe = "inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-[var(--vitrine-a)]";
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

export default async function TerceirosPage(props: PageProps<"/terceiros">) {
  const membro = await exigirMembro();
  const { categoria: parametro } = await props.searchParams;
  const ehAdmin = membro.papel === "admin";
  const [fornecedores, resumo] = await Promise.all([
    ehAdmin ? listarFornecedoresAdmin(membro.turmaId) : listarFornecedores(membro),
    ehAdmin ? getResumoOrcamento(membro.turmaId) : Promise.resolve(null),
  ]);

  const categoriaAtiva = CATEGORIAS_FORNECEDOR.find((c) => c === parametro);
  const visiveis = categoriaAtiva
    ? fornecedores.filter((f) => f.categoria === categoriaAtiva)
    : fornecedores;
  const contagem = (c?: string) =>
    c ? fornecedores.filter((f) => f.categoria === c).length : fornecedores.length;

  return (
    <div className="mx-auto w-full max-w-4xl 2xl:max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Terceiros</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground text-pretty">
        Fornecedores e prestadores de serviço indicados pela comissão
        organizadora.
      </p>

      {ehAdmin && resumo && (
        <Card className="vitrine-fundo-hero mt-6">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <Wallet className="size-4" aria-hidden /> Orçamento com fornecedores
            </CardDescription>
            <CardTitle className="text-3xl tabular-nums">{formatarReal.format(resumo.orcado)}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {formatarReal.format(resumo.contratado)} contratado · {formatarReal.format(resumo.cotando)} em
              cotação. Só administradores veem valores.
            </p>
          </CardHeader>
        </Card>
      )}

      {ehAdmin && (
        <Card className="mt-4">
          <CardContent>
            <details open={fornecedores.length === 0} className="group">
              <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium [&::-webkit-details-marker]:hidden">
                <span className="flex size-7 items-center justify-center rounded-md border bg-muted/50 text-[var(--vitrine-a)]">
                  <Plus className="size-4 transition-transform group-open:rotate-45" aria-hidden />
                </span>
                Adicionar fornecedor
              </summary>
              <div className="mt-4">
                <FormNovoFornecedor categorias={CATEGORIAS_FORNECEDOR} />
              </div>
            </details>
          </CardContent>
        </Card>
      )}

      <nav
        aria-label="Categorias"
        className="mt-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {[undefined, ...CATEGORIAS_FORNECEDOR].map((c) => {
          const ativo = c === categoriaAtiva;
          return (
            <Link
              key={c ?? "todas"}
              href={c ? `/terceiros?categoria=${encodeURIComponent(c)}` : "/terceiros"}
              aria-current={ativo ? "page" : undefined}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors",
                ativo
                  ? "border-[var(--vitrine-a)]/40 bg-[color-mix(in_oklch,var(--vitrine-a)_10%,transparent)] font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {c ?? "Todas"}
              <span className="text-xs tabular-nums text-muted-foreground">{contagem(c)}</span>
            </Link>
          );
        })}
      </nav>

      {visiveis.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-2 rounded-xl border border-dashed p-10 text-center">
          <Handshake className="size-8 text-muted-foreground" aria-hidden />
          <p className="font-medium">Nenhum fornecedor por aqui</p>
          <p className="text-sm text-muted-foreground">
            {fornecedores.length === 0
              ? ehAdmin
                ? "Adicione o primeiro fornecedor no formulário acima."
                : "A comissão ainda não indicou fornecedores."
              : "Escolha outra categoria para ver os demais."}
          </p>
        </div>
      ) : (
        <ul data-grupo className="mt-4 grid gap-4 md:grid-cols-2">
          {visiveis.map((f) => {
            const Icone = ICONE_CATEGORIA[f.categoria] ?? Store;
            return (
              <li key={f.id}>
                <Card className="vitrine-cartao h-full">
                  <CardContent className="flex h-full flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/50 text-[var(--vitrine-a)]">
                        <Icone className="size-5" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium wrap-break-word">{f.nome}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <Badge variant="secondary">{f.categoria}</Badge>
                          {ehAdmin && (
                            <Badge variant="outline">{ROTULO_ORCAMENTO[(f as Fornecedor).status]}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {f.descricao && (
                      <p className="wrap-break-word whitespace-pre-wrap text-sm text-muted-foreground">
                        {f.descricao}
                      </p>
                    )}
                    {f.contato && (
                      <p className="wrap-break-word text-sm">
                        <Contato valor={f.contato} />
                      </p>
                    )}
                    {ehAdmin && (
                      <div className="mt-auto flex flex-col gap-3 border-t pt-3">
                        <FormOrcamento
                          fornecedorId={f.id}
                          status={(f as Fornecedor).status}
                          valorOrcado={(f as Fornecedor).valorOrcado}
                        />
                        <form action={excluirFornecedor}>
                          <input type="hidden" name="id" value={f.id} />
                          <Button type="submit" variant="destructive" size="sm">
                            <Trash2 aria-hidden /> Remover
                          </Button>
                        </form>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
