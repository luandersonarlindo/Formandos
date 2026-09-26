import type { Metadata } from "next";
import { criarCatalogo } from "@/actions/catalogos";
import { FormAcao } from "@/components/features/form-acao";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = { title: "Novo catálogo" };

export default function NovoCatalogoPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Novo catálogo</h1>
      <p className="mt-2 text-muted-foreground">
        Dê um nome ao catálogo. Em seguida você adiciona as categorias e as
        perguntas.
      </p>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Nome do catálogo</CardTitle>
          <CardDescription>Ex.: Escolhas do baile de gala</CardDescription>
        </CardHeader>
        <CardContent>
          <FormAcao acao={criarCatalogo} rotulo="Criar catálogo" rotuloPendente="Criando…">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" name="nome" maxLength={255} required />
            </div>
          </FormAcao>
        </CardContent>
      </Card>
    </div>
  );
}
