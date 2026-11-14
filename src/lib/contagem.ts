// Frase da contagem regressiva para o leitor de tela (ADR-0015). Na tela a
// contagem são três caixas (dias, horas, min); lidas uma a uma, viram seis
// pedaços soltos, com o número longe da unidade. Aqui sai uma frase só.

function parte(valor: number, singular: string, plural: string) {
  return `${valor} ${valor === 1 ? singular : plural}`;
}

export function partesDaContagem(faltaMs: number) {
  const segundos = Math.max(0, Math.floor(faltaMs / 1000));
  return {
    dias: Math.floor(segundos / 86400),
    horas: Math.floor((segundos % 86400) / 3600),
    minutos: Math.floor((segundos % 3600) / 60),
  };
}

export function fraseDaContagem(faltaMs: number) {
  const { dias, horas, minutos } = partesDaContagem(faltaMs);
  const partes = [
    dias > 0 ? parte(dias, "dia", "dias") : null,
    dias > 0 || horas > 0 ? parte(horas, "hora", "horas") : null,
    parte(minutos, "minuto", "minutos"),
  ].filter((p): p is string => p !== null);
  const lista =
    partes.length === 1 ? partes[0] : `${partes.slice(0, -1).join(", ")} e ${partes.at(-1)}`;
  const verbo = partes[0].startsWith("1 ") ? "Falta" : "Faltam";
  return `${verbo} ${lista} para o evento.`;
}
