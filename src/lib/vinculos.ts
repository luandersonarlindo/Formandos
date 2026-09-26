// Regras de quem pode ter várias turmas e de qual turma está ativa.
// São funções puras (sem banco nem cookies) para poderem ser testadas.

export type Papel = "admin" | "participante";

// Só quem é administrador em alguma turma pode entrar ou criar outra.
// Quem ainda não tem turma pode entrar na primeira.
export function podeEntrarEmOutraTurma(papeis: Papel[]): boolean {
  return papeis.length === 0 || papeis.includes("admin");
}

// A turma ativa é a preferida (vinda do cookie), mas só se o usuário for mesmo
// membro dela. Caso contrário, vale a primeira. Assim o cookie nunca dá acesso
// a uma turma da qual a pessoa não faz parte.
export function escolherTurmaAtiva<T extends { turmaId: string }>(
  vinculos: T[],
  preferida?: string | null,
): T | null {
  if (vinculos.length === 0) return null;
  return vinculos.find((v) => v.turmaId === preferida) ?? vinculos[0];
}
