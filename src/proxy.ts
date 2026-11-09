import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { codigoDoLink, COOKIE_CONVITE, COOKIE_CONVITE_DIAS } from "@/lib/convite-link";

// Checagem rápida: sem cookie de sessão, vai para o login.
// NÃO é a barreira de segurança. A validação real da sessão fica em
// src/lib/dal.ts, chamada nas páginas, layouts e Server Actions.
export function proxy(request: NextRequest) {
  const { pathname, search, searchParams } = request.nextUrl;

  let resposta: NextResponse;
  if (!getSessionCookie(request)) {
    // Guarda o endereço pedido para voltar a ele depois do login (ADR-0002).
    // /entrar confere o valor com destinoSeguro antes de usar.
    const login = new URL("/entrar", request.url);
    login.searchParams.set("voltar", pathname + search);
    resposta = NextResponse.redirect(login);
  } else {
    resposta = NextResponse.next();
  }

  // Link de convite: guarda o código como reserva, caso o `voltar` se perca.
  if (pathname === "/convite") {
    const codigo = codigoDoLink(searchParams.get("codigo"));
    if (codigo) {
      resposta.cookies.set(COOKIE_CONVITE, codigo, {
        httpOnly: true,
        sameSite: "lax",
        // Atrás do túnel o pedido chega em http; quem diz se o site é https é a URL pública.
        secure: process.env.BETTER_AUTH_URL?.startsWith("https://") ?? false,
        path: "/",
        maxAge: COOKIE_CONVITE_DIAS * 24 * 60 * 60,
      });
    }
  }
  return resposta;
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
