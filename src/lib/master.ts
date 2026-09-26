// Administrador master: gestor da plataforma inteira (todas as turmas).
// Quem é master vem da variável ADMIN_MASTER_EMAILS (emails separados por
// vírgula). Não há tela nem tabela para virar master: só quem controla o
// servidor define. Como o login exige email confirmado (Google já vem
// confirmado), o email da sessão é confiável.

export function emailsMaster(
  lista: string | undefined = process.env.ADMIN_MASTER_EMAILS,
): string[] {
  return (lista ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function ehMaster(
  usuario: { email: string; emailVerified: boolean },
  lista?: string,
): boolean {
  return (
    usuario.emailVerified &&
    emailsMaster(lista).includes(usuario.email.toLowerCase())
  );
}
