import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Checagem rápida: sem cookie de sessão, vai para o login.
// NÃO é a barreira de segurança. A validação real da sessão fica em
// src/lib/dal.ts, chamada nas páginas, layouts e Server Actions.
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/entrar", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tarefas/:path*",
    "/votacoes/:path*",
    "/duvidas/:path*",
    "/terceiros/:path*",
    "/admin/:path*",
    "/master/:path*",
    "/convite/:path*",
    "/conta/:path*",
  ],
};
