import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, LayoutList, Library, Lock, Plus, SlidersHorizontal } from "lucide-react";
import { alternarCatalogoPadrao } from "@/actions/catalogos";
import { FormDialog } from "@/components/features/form-dialog";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { contarCatalogosPadrao, listarCatalogosAdmin } from "@/lib/admin";
import { exigirAdmin } from "@/lib/dal";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Catálogos de enquetes" };

export default async function VotacoesAdminPage() {
  const admin = await exigirAdmin();
  const [catalogos, padroes] = await Promise.all([
    listarCatalogosAdmin(admin.turmaId),
    contarCatalogosPadrao(),
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl 2xl:max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Catálogos de enquetes</h1>
        <Link href="/admin/votacoes/nova" className={cn(buttonVariants())}>
          <Plus aria-hidden /> Novo catálogo
        </Link>
      </div>
      <p className="mt-2 max-w-2xl text-muted-foreground text-pretty">
        O catálogo padrão vale para todas as turmas e não pode ser editado. Nos
        catálogos personalizados você cria categorias e perguntas próprias. Em
        qualquer um, dá para ver quem votou em cada opção.
      </p>

      {padroes > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <span className="mb-1 flex size-10 items-center justify-center rounded-lg border bg-muted/50 text-[var(--vitrine-a)]">
              <Library className="size-5" aria-hidden />
            </span>
            <CardTitle className="text-lg">Catálogo padrão</CardTitle>
            <CardDescription className="text-pretty">
              As {padroes}{" "}
              {padroes === 1 ? "catálogo padrão da plataforma" : "catálogos padrão da plataforma"}{" "}
              {padroes === 1 ? "serve" : "servem"} de pergunta para toda turma que não desliga.
              Desligar não apaga nada: os votos já dados ficam guardados e voltam a
              aparecer se você ligar de novo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormDialog
              rotulo="Editar uso do catálogo padrão"
              icone={<SlidersHorizontal aria-hidden />}
              titulo="Uso na minha turma"
              descricao="Mudar não apaga nada: os votos já dados ficam guardados e voltam a aparecer se você ligar de novo."
              acao={alternarCatalogoPadrao}
              rotuloSubmit="Salvar"
              rotuloPendente="Salvando…"
              dialogClassName="sm:max-w-md"
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="usar">Uso na minha turma</Label>
                <NativeSelect
                  id="usar"
                  name="usar"
                  defaultValue={admin.usarCatalogoPadrao ? "sim" : "nao"}
                  className="h-10"
                >
                  <option value="sim">Oferecer o catálogo padrão aos membros</option>
                  <option value="nao">Usar só os catálogos da turma</option>
                </NativeSelect>
                <p className="text-xs text-muted-foreground">
                  {admin.usarCatalogoPadrao
                    ? "Agora os membros veem o catálogo padrão junto com os da turma."
                    : "Agora os membros veem só os catálogos personalizados da turma."}
                </p>
              </div>
            </FormDialog>
          </CardContent>
        </Card>
      )}

      <div data-grupo className="mt-6 grid gap-4 md:grid-cols-2">
        {catalogos.map((c) => (
          <Link key={c.id} href={`/admin/votacoes/${c.id}`} className="block">
            <Card className="vitrine-cartao h-full">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-10 items-center justify-center rounded-lg border bg-muted/50 text-[var(--vitrine-a)]">
                    {c.padrao ? (
                      <Lock className="size-5" aria-hidden />
                    ) : (
                      <LayoutList className="size-5" aria-hidden />
                    )}
                  </span>
                  <Badge variant={c.padrao ? "secondary" : "default"}>
                    {c.padrao ? "Padrão" : "Personalizado"}
                  </Badge>
                </div>
                <CardTitle className="mt-2 text-lg">{c.nome}</CardTitle>
                <CardDescription>
                  {c.enquetes} {c.enquetes === 1 ? "pergunta" : "perguntas"}
                </CardDescription>
                <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-[var(--vitrine-a)]">
                  {c.padrao ? "Ver votos" : "Editar e ver votos"} <ArrowRight className="size-4" aria-hidden />
                </p>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}