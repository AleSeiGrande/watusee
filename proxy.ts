import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * Dominio oficial del producto.
 * Cualquier otro host de la marca (www, .com, dominio viejo) redirige acá con
 * 301 para no partir SEO ni sesiones. No toca localhost ni hosts internos.
 */
const CANONICAL_HOST = "watdusee.fun";
const ALIAS_HOSTS = new Set([
  "www.watdusee.fun",
  "watdusee.com",
  "www.watdusee.com",
  "watusee.fun",
  "www.watusee.fun",
]);

export default auth((req) => {
  const host = (req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "")
    .split(",")[0]
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, "");

  if (ALIAS_HOSTS.has(host)) {
    const target = new URL(
      req.nextUrl.pathname + req.nextUrl.search,
      `https://${CANONICAL_HOST}`
    );
    return NextResponse.redirect(target, 301);
  }

  const isLoggedIn = !!req.auth;
  const isProtected = req.nextUrl.pathname.startsWith('/create');

  if (!isLoggedIn && isProtected) {
    return Response.redirect(new URL("/login", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
