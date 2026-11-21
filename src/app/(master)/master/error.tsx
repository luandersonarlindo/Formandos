"use client";

import { ErroPagina } from "@/components/features/erro-pagina";

export default function Erro({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <ErroPagina
      error={error}
      retry={retry}
      voltarPara="/master"
      ajuda="Se o problema continuar, confira os logs do servidor."
    />
  );
}
