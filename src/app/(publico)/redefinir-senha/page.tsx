import type { Metadata } from "next";
import Link from "next/link";
import { FormNovaSenha } from "@/components/features/form-senha";

export const metadata: Metadata = { title: "Nova senha" };

export default async function RedefinirSenhaPage({
  searchParams,
}: PageProps<"/redefinir-senha">) {
  const { token } = await searchParams;

  return (
    <main id="conteudo" className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Nova senha</h1>
      {typeof token === "string" ? (
        <FormNovaSenha token={token} />
      ) : (
        <>
          <p role="alert">Link inválido ou expirado.</p>
          <Link href="/esqueci-senha" className="underline underline-offset-4">
            Pedir um novo link
          </Link>
        </>
      )}
    </main>
  );
}
