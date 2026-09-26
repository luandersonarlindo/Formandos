import type { Metadata } from "next";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { FormNovaSenha } from "@/components/features/form-senha";
import { LayoutAuth } from "@/components/features/layout-auth";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Nova senha" };

export default async function RedefinirSenhaPage({
  searchParams,
}: PageProps<"/redefinir-senha">) {
  const { token } = await searchParams;

  return (
    <LayoutAuth voltar={{ href: "/entrar", rotulo: "Voltar ao login" }}>
      {typeof token === "string" ? (
        <FormNovaSenha token={token} />
      ) : (
        <div data-grupo className="flex flex-col gap-5">
          <span className="flex size-12 items-center justify-center rounded-full border bg-destructive/10">
            <TriangleAlert className="size-5 text-destructive" aria-hidden />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Link inválido ou expirado</h1>
            <p role="alert" className="mt-1 text-sm text-muted-foreground">
              O link de redefinição vale por 1 hora e só pode ser usado uma vez. Peça um novo.
            </p>
          </div>
          <Button asChild className="h-10 w-full text-sm">
            <Link href="/esqueci-senha">Pedir um novo link</Link>
          </Button>
        </div>
      )}
    </LayoutAuth>
  );
}
