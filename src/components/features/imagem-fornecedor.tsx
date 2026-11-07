"use client";

import { useState } from "react";

// A imagem é um link externo (sem upload no app): se o link morrer ou não
// carregar, esconde a imagem em vez de mostrar o ícone de link quebrado.
export function ImagemFornecedor({ src, alt }: { src: string; alt: string }) {
  const [erro, setErro] = useState(false);
  if (erro) return null;

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setErro(true)}
      loading="lazy"
      className="h-36 w-full rounded-lg border object-cover"
    />
  );
}
