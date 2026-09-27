// Regras dos detalhes do evento, sem acesso ao banco.

// O link do mapa vem do administrador e vira um botão para todos: só aceita
// https:// com um domínio de verdade (nada de javascript:, data: ou http).
export function ehLinkHttps(texto: string): boolean {
  try {
    const url = new URL(texto);
    return url.protocol === "https:" && url.hostname.includes(".");
  } catch {
    return false;
  }
}

// Botão "Como chegar": usa o link do mapa, se houver; senão monta uma busca do
// Google Maps com o endereço (ou, na falta dele, o nome do local).
export function linkComoChegar({
  linkMapa,
  endereco,
  local,
}: {
  linkMapa: string | null;
  endereco: string | null;
  local: string | null;
}): string | null {
  if (linkMapa) return linkMapa;
  const busca = endereco || local;
  if (!busca) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(busca)}`;
}
