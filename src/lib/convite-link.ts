// Partes do convite que rodam em qualquer lugar (navegador, proxy, servidor):
// sem node:crypto, ao contrário de convite.ts.

export function normalizarCodigo(texto: string) {
  return texto.replace(/[\s-]/g, "").toUpperCase();
}

// Link de convite com o código embutido (ADR-0002).
export function linkConvite(origem: string, codigo: string) {
  return `${origem}/convite?codigo=${encodeURIComponent(codigo)}`;
}

// Cookie de reserva: guarda o código do link enquanto a pessoa faz login,
// para o caso de o `?voltar=` se perder (aba fechada, volta pela página
// inicial). Só preenche o campo em /convite; quem valida é entrarPorConvite.
export const COOKIE_CONVITE = "convite_pendente";
export const COOKIE_CONVITE_DIAS = 7;

// Código vindo da URL ou do cookie, já normalizado. Devolve null se não tiver
// cara de código (evita guardar ou mostrar lixo na tela).
export function codigoDoLink(texto?: string | null): string | null {
  if (!texto) return null;
  const codigo = normalizarCodigo(texto);
  return /^[A-Z0-9]{6,20}$/.test(codigo) ? codigo : null;
}
