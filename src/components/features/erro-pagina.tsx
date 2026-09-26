"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Tela de erro inesperado. `retry` tenta renderizar a página de novo.
export function ErroPagina({
  error,
  retry,
  voltarPara = "/dashboard",
}: {
  error: Error & { digest?: string };
  retry: () => void;
  voltarPara?: string;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="mx-auto flex w-full max-w-md flex-col items-center gap-4 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Algo deu errado</h1>
      <p className="text-muted-foreground">
        Não foi possível carregar esta página. Tente novamente. Se o problema
        continuar, avise a comissão organizadora.
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground">Código do erro: {error.digest}</p>
      )}
      <div className="flex flex-wrap justify-center gap-2">
        <Button onClick={() => retry()}>Tentar de novo</Button>
        <Link href={voltarPara} className={cn(buttonVariants({ variant: "outline" }))}>
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
