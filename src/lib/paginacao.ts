// Paginação por URL (`?pagina=2`): funções puras, sem acesso ao banco.

// Aceita só inteiro positivo. Lixo na URL (`abc`, `-3`, `2.5`, `1e9`) vira 1.
export function lerPagina(parametro: string | string[] | undefined): number {
  const texto = Array.isArray(parametro) ? parametro[0] : parametro;
  if (!texto || !/^\d{1,9}$/.test(texto)) return 1;
  return Math.max(1, Number(texto));
}

export function calcularPaginas(total: number, porPagina: number): number {
  return Math.max(1, Math.ceil(total / porPagina));
}

// Mantém a página dentro do intervalo: apagar o último item da última página
// não deve deixar uma tela vazia.
export function limitarPagina(pagina: number, totalPaginas: number): number {
  return Math.min(Math.max(1, pagina), totalPaginas);
}

// Valor do `offset` no SQL. Já recebe a página limitada.
export function deslocamento(pagina: number, porPagina: number): number {
  return (pagina - 1) * porPagina;
}
