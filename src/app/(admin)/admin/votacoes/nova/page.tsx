import type { Metadata } from "next";
import { criarCatalogo, criarCatalogoDeModelo } from "@/actions/catalogos";
import { CabecalhoPagina } from "@/components/features/cabecalho-pagina";
import { FormAcao } from "@/components/features/form-acao";
import { LinkVoltar } from "@/components/features/link-voltar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { listarModelos } from "@/lib/modelos";

export const metadata: Metadata = { title: "Novo catálogo" };

// Escolher um modelo ou começar do zero. "Do zero" é mais um cartão do mesmo
// grid, com o campo de nome dentro: um padrão só (escolher o cartão e clicar
// no botão dele). O fluxo e as actions não mudaram.
export default async function NovoCatalogoPage() {
  const modelos = await listarModelos();
  return (
    <div className="mx-auto w-full max-w-3xl 2xl:max-w-5xl">
      <CabecalhoPagina
        antes={<LinkVoltar href="/admin/votacoes">Catálogos de enquetes</LinkVoltar>}
        titulo="Novo catálogo"
        descricao="Comece de um modelo pronto ou do zero. Depois você edita categorias e perguntas."
      />
      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {modelos.map((m) => {
          const perguntas = m.categorias.reduce((n, c) => n + c.enquetes.length, 0);
          return (
            <li key={m.slug}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-base">{m.nome}</CardTitle>
                  <CardDescription>
                    {m.categorias.length} categorias · {perguntas} perguntas
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between gap-3">
                  <p className="text-sm text-muted-foreground text-pretty">{m.descricao}</p>
                  <FormAcao acao={criarCatalogoDeModelo} rotulo="Usar este modelo" rotuloPendente="Criando…">
                    <input type="hidden" name="modelo" value={m.slug} />
                  </FormAcao>
                </CardContent>
              </Card>
            </li>
          );
        })}
        <li>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Do zero</CardTitle>
              <CardDescription>Um catálogo vazio, só com o nome.</CardDescription>
            </CardHeader>
            <CardContent>
              <FormAcao acao={criarCatalogo} rotulo="Criar catálogo" rotuloPendente="Criando…">
                <Field>
                  <FieldLabel htmlFor="nome">Nome do catálogo</FieldLabel>
                  <Input id="nome" name="nome" maxLength={255} className="h-10" required />
                  <FieldDescription>Ex.: Escolhas do baile de gala</FieldDescription>
                </Field>
              </FormAcao>
            </CardContent>
          </Card>
        </li>
      </ul>
    </div>
  );
}
