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
    <main id="conteudo" className="flex flex-1 items-center justify-center p-8">
      <ErroPagina error={error} retry={retry} voltarPara="/" />
    </main>
  );
}
