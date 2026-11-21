import type { Metadata } from "next";
import { FormNovaSenha, ResultadoSenha } from "@/components/features/form-senha";
import { LayoutAuth } from "@/components/features/layout-auth";

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
        <ResultadoSenha
          tipo="erro"
          titulo="Link inválido ou expirado"
          texto="O link de redefinição vale por 1 hora e só pode ser usado uma vez. Peça um novo."
          acao={{ href: "/esqueci-senha", rotulo: "Pedir um novo link" }}
        />
      )}
    </LayoutAuth>
  );
}
