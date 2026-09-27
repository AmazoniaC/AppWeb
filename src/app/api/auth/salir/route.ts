import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session-token";

// Borra una cookie de sesión que ya no es válida (usuario desactivado o
// eliminado) y manda al login. Las páginas no pueden borrar cookies al
// renderizar, y sin esto proxy.ts devolvería al usuario a /inicio en bucle.
export function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/login", req.nextUrl));
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
