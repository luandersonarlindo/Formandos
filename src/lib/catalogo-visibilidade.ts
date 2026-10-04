import "server-only";

// Visibilidade dos catálogos de enquetes. Um catálogo é visível para a turma quando
// é dela (catalogos.turma_id = turma) ou quando é o catálogo padrão global
// (turma_id nulo) e a turma mantém `usar_catalogo_padrao` ligado.
//
// Devolve o pedaço de SQL com o alias `c` (catalogos) e o número do parâmetro que
// carrega o id da turma, porque nem toda consulta põe a turma em $1.
//
// Fica numa função (e não numa constante) para o placeholder ser explícito em cada
// consulta, onde a ordem dos parâmetros muda.
export function catalogoVisivelSql(turmaParam: string): string {
  return `(c.turma_id = ${turmaParam} or (c.turma_id is null and exists (
            select 1 from turmas t
             where t.id = ${turmaParam} and t.usar_catalogo_padrao)))`;
}