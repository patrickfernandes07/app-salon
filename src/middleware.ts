// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ["/login", "/"];

  // Verificar se é uma rota pública
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Para rotas protegidas, verificar se tem token no cabeçalho
  // O middleware não pode acessar sessionStorage, então a verificação
  // real será feita no client-side pelos componentes AuthGuard

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
