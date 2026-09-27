// Busca por texto sem diferenciar maiúsculas de minúsculas nem acentos, feita
// no SQL sem extensão do Postgres: o termo e a coluna passam pelo mesmo mapa.

const COM_ACENTO = "áàâãäéèêëíìîïóòôõöúùûüç";
const SEM_ACENTO = "aaaaaeeeeiiiiooooouuuuc";

export const MAX_BUSCA = 100;

// Lê o parâmetro `busca` da URL: só texto, sem espaços nas pontas e com limite.
export function lerBusca(parametro: string | string[] | undefined): string {
  const texto = Array.isArray(parametro) ? parametro[0] : parametro;
  return (texto ?? "").trim().slice(0, MAX_BUSCA);
}

export function normalizar(texto: string): string {
  let saida = "";
  for (const letra of texto.toLowerCase()) {
    const i = COM_ACENTO.indexOf(letra);
    saida += i === -1 ? letra : SEM_ACENTO[i];
  }
  return saida;
}

// Termo pronto para `like` com `escape '\'`: normalizado e com %, _ e \ literais.
export function padraoBusca(termo: string): string {
  return `%${normalizar(termo).replace(/[\\%_]/g, "\\$&")}%`;
}

// Expressão SQL que normaliza uma coluna do mesmo jeito que `normalizar`.
export function sqlNormalizado(coluna: string): string {
  return `translate(lower(${coluna}), '${COM_ACENTO}', '${SEM_ACENTO}')`;
}
