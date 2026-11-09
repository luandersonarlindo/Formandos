"use client";

import { useEffect, useRef, useState } from "react";

// Copia um texto para a área de transferência e guarda o estado por 2,5 s
// ("copiado" ou "erro"), para o botão mostrar "Copiado!" e o leitor de tela
// anunciar. Usado por BotaoCopiar e MandarParaGrupo.
export function useCopiar() {
  const [estado, setEstado] = useState<"parado" | "copiado" | "erro">("parado");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  async function copiar(texto: string) {
    try {
      await navigator.clipboard.writeText(texto);
      setEstado("copiado");
    } catch {
      setEstado("erro");
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setEstado("parado"), 2500);
  }

  return { estado, copiar };
}
