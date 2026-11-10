"use client";

import { SCRIPT_TEMA } from "@/lib/tema";

// Script do modo de cor, no topo do <body> (ver app/layout.tsx).
//
// No HTML do servidor ele é um <script> comum e roda antes da primeira pintura.
// No navegador, o React às vezes recria o <body> (ex.: página 404 de um
// segmento, no dev) e, ao criar um <script>, avisa no console que ele nunca
// roda no cliente. Ali ele não precisa rodar: o tema já foi aplicado na carga.
// Por isso, no cliente o script leva type="text/plain" (um bloco de dados, que
// o React não reclama de criar), e o suppressHydrationWarning cobre a
// diferença de atributo entre o servidor e o cliente.
export function ScriptTema() {
  return (
    <script
      suppressHydrationWarning
      type={typeof window === "undefined" ? undefined : "text/plain"}
      dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }}
    />
  );
}
