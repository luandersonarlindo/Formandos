import type { Metadata } from "next";
import { FormPedirSenha } from "@/components/features/form-senha";
import { LayoutAuth } from "@/components/features/layout-auth";

export const metadata: Metadata = { title: "Definir senha" };

export default function EsqueciSenhaPage() {
  return (
    <LayoutAuth voltar={{ href: "/entrar", rotulo: "Voltar ao login" }}>
      <FormPedirSenha />
    </LayoutAuth>
  );
}
