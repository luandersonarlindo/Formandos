"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function BotaoGoogle() {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function entrar() {
    setCarregando(true);
    setErro(null);
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
    // Em caso de sucesso o navegador é redirecionado para o Google.
    if (error) {
      setErro("Não foi possível entrar com o Google. Tente novamente.");
      setCarregando(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button size="lg" onClick={entrar} disabled={carregando}>
        {carregando ? "Redirecionando…" : "Entrar com Google"}
      </Button>
      {erro && (
        <p role="alert" className="text-sm text-destructive">
          {erro}
        </p>
      )}
    </div>
  );
}
