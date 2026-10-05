import type { Metadata } from "next";
import { Pencil, Trash2 } from "lucide-react";
import { atualizarAviso, excluirAviso } from "@/actions/avisos";
import { ConfirmarExclusao } from "@/components/features/confirmar-exclusao";
import { EstadoVazio } from "@/components/features/estado-vazio";
import { FormAcao } from "@/components/features/form-acao";
import { FormNovoAviso } from "@/components/features/form-novo-aviso";
import { Paginacao } from "@/components/features/paginacao";
import { ColaboracaoAmico } from "@/components/ilustracoes/colaboracao-amico";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { listarAvisos } from "@/lib/avisos";
import { exigirMembro } from "@/lib/dal";
import { lerPagina } from "@/lib/paginacao";

export const metadata: Metadata = { title: "Avisos" };

const formatarData = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

export default async function AvisosPage({ searchParams }: PageProps<"/avisos">) {
  const membro = await exigirMembro();
  const { pagina: paginaParametro } = await searchParams;
  const ehAdmin = membro.papel === "admin";
  const { itens, total, pagina, totalPaginas } = await listarAvisos(membro, {
    pagina: lerPagina(paginaParametro),
  });

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Avisos</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground text-pretty">
        Recados da comissão sobre a organização do evento.
      </p>

      {ehAdmin && (
        <Card className="mt-6">
          <CardContent>
            <FormNovoAviso />
          </CardContent>
        </Card>
      )}

      {total === 0 ? (
        <EstadoVazio
          className="mt-4"
          descricao={ehAdmin ? "Publique o primeiro recado no formulário acima." : "A comissão ainda não publicou nenhum recado."}
          ilustracao={<ColaboracaoAmico />}
          titulo="Nenhum aviso ainda"
        />
      ) : (
        <ul data-grupo className="mt-4 grid gap-3">
          {itens.map((a) => (
            <li key={a.id}>
              <Card>
                <CardContent className="flex flex-col gap-2">
                  <p className="font-medium wrap-break-word">{a.titulo}</p>
                  <p className="wrap-break-word whitespace-pre-wrap text-sm text-muted-foreground">{a.conteudo}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.autor} · {formatarData.format(a.criadoEm)}
                  </p>
                  {ehAdmin && (
                    <details className="mt-1 border-t pt-3">
                      <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
                        <Pencil className="size-3.5" aria-hidden /> Editar ou remover
                      </summary>
                      <div className="mt-3 flex flex-col gap-3">
                        <FormAcao acao={atualizarAviso} rotulo="Salvar">
                          <input type="hidden" name="id" value={a.id} />
                          <div className="flex flex-col gap-1.5">
                            <Label htmlFor={`titulo-${a.id}`} className="text-xs">Título</Label>
                            <Input id={`titulo-${a.id}`} name="titulo" defaultValue={a.titulo} maxLength={200} required />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label htmlFor={`conteudo-${a.id}`} className="text-xs">Recado</Label>
                            <Textarea id={`conteudo-${a.id}`} name="conteudo" defaultValue={a.conteudo} maxLength={2000} rows={3} required />
                          </div>
                        </FormAcao>
                        <ConfirmarExclusao
                          acao={excluirAviso}
                          campos={{ id: a.id }}
                          alvo="o aviso"
                          nome={a.titulo}
                          rotulo="Remover"
                          descricao={`Remover o aviso ${a.titulo}`}
                          icone={<Trash2 aria-hidden />}
                        />
                      </div>
                    </details>
                  )}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
      <Paginacao pagina={pagina} totalPaginas={totalPaginas} caminho="/avisos" />
    </div>
  );
}
