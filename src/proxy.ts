import { NextResponse, type NextRequest } from "next/server";
import { puedeAcceder } from "@/lib/roles";
import { decrypt, SESSION_COOKIE } from "@/lib/session-token";

// Chequeo optimista (solo cookie, sin base de datos). La verificación
// definitiva se hace en src/lib/auth.ts dentro de cada página y acción.
export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await decrypt(req.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/login") {
    return session ? NextResponse.redirect(new URL("/inicio", req.nextUrl)) : NextResponse.next();
  }

  if (!session) {
    const url = new URL("/login", req.nextUrl);
    if (pathname !== "/") url.searchParams.set("desde", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname === "/") return NextResponse.redirect(new URL("/inicio", req.nextUrl));

  if (!puedeAcceder(session.rol, pathname)) {
    return NextResponse.redirect(new URL("/inicio?denegado=1", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|jpg|jpeg|ico|webp)$).*)"],
};
