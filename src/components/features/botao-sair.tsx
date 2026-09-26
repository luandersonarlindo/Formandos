"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function BotaoSair() {
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    setSaindo(true);
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={sair} disabled={saindo}>
      {saindo ? "Saindo…" : "Sair"}
    </Button>
  );
}
