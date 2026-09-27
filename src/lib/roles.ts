// Sin imports de servidor: se usa desde proxy.ts, componentes y acciones.
import type { Rol } from "@/generated/prisma/enums";

export const ROLES = ["ADMIN", "VENTAS", "PLANTA", "CONDUCTOR"] as const satisfies readonly Rol[];

export const ROL_ETIQUETA: Record<Rol, string> = {
  ADMIN: "Administrador",
  VENTAS: "Ventas",
  PLANTA: "Planta",
  CONDUCTOR: "Conductor",
};

// Secciones de la app y qué roles pueden entrar. El orden define el menú.
export const SECCIONES = [
  { href: "/inicio", titulo: "Inicio", roles: ["ADMIN", "VENTAS", "PLANTA", "CONDUCTOR"] },
  { href: "/ventas", titulo: "Ventas", roles: ["ADMIN", "VENTAS"] },
  { href: "/planta", titulo: "Planta", roles: ["ADMIN", "PLANTA"] },
  { href: "/conductor", titulo: "Mis despachos", roles: ["ADMIN", "CONDUCTOR"] },
  { href: "/admin/usuarios", titulo: "Usuarios", roles: ["ADMIN"] },
] as const satisfies readonly { href: string; titulo: string; roles: readonly Rol[] }[];

export function seccionDeRuta(pathname: string) {
  return SECCIONES.find((s) => pathname === s.href || pathname.startsWith(`${s.href}/`));
}

export function puedeAcceder(rol: Rol, pathname: string) {
  const seccion = seccionDeRuta(pathname);
  return !seccion || (seccion.roles as readonly Rol[]).includes(rol);
}

export function seccionesPara(rol: Rol) {
  return SECCIONES.filter((s) => (s.roles as readonly Rol[]).includes(rol));
}
