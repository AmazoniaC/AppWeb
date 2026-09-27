import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Rol } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { decrypt, SESSION_COOKIE } from "@/lib/session-token";

// Capa de acceso a datos: la verificación real de sesión y rol.
// proxy.ts solo hace un chequeo optimista; cada página y acción llama aquí.

export const getCurrentUser = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await decrypt(token);
  if (!session) return null;

  const usuario = await prisma.usuario.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, nombre: true, rol: true, activo: true },
  });
  // Un usuario desactivado pierde el acceso aunque su cookie siga vigente.
  if (!usuario || !usuario.activo) return null;
  return usuario;
});

export async function requireUser() {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/api/auth/salir");
  return usuario;
}

export async function requireRole(...roles: Rol[]) {
  const usuario = await requireUser();
  if (!roles.includes(usuario.rol)) redirect("/inicio?denegado=1");
  return usuario;
}
