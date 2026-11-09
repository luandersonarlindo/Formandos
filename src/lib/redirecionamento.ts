// Destino depois do login (ADR-0002). O valor vem da URL (`?voltar=`), então
// qualquer pessoa pode montá-lo: só caminhos internos passam, para o login
// não virar um redirecionamento para site de terceiros.
export const DESTINO_PADRAO = "/dashboard";

export function destinoSeguro(voltar?: string | null): string {
  if (!voltar || voltar.length > 512) return DESTINO_PADRAO;
  // Precisa começar com uma barra só. "//site" e "/\site" são lidos pelo
  // navegador como outro domínio.
  if (!voltar.startsWith("/") || voltar.startsWith("//") || voltar.startsWith("/\\")) {
    return DESTINO_PADRAO;
  }
  // Caracteres de controle (tab, quebra de linha) podem ser removidos pelo
  // navegador e transformar "/\t/site" em "//site".
  if (/[\u0000-\u001f\u007f]/.test(voltar)) return DESTINO_PADRAO;
  // Confere com o parser de URL: a origem tem que continuar a mesma.
  const base = "http://formandos.local";
  let url: URL;
  try {
    url = new URL(voltar, base);
  } catch {
    return DESTINO_PADRAO;
  }
  if (url.origin !== base) return DESTINO_PADRAO;
  // Voltar para o próprio login criaria um laço.
  if (url.pathname === "/entrar") return DESTINO_PADRAO;
  return url.pathname + url.search + url.hash;
}
