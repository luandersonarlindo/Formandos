"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
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
      <LogOut aria-hidden />
      {saindo ? "Saindo…" : "Sair"}
    </Button>
  );
}
