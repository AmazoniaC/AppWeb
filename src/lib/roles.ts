// Sin imports de servidor: se usa desde proxy.ts, componentes y acciones.
import type { NombreIcono } from "@/components/iconos";
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
  {
    href: "/inicio",
    titulo: "Inicio",
    icono: "inicio",
    descripcion: "Resumen del día",
    roles: ["ADMIN", "VENTAS", "PLANTA", "CONDUCTOR"],
  },
  {
    href: "/clientes",
    titulo: "Clientes",
    icono: "clientes",
    descripcion: "Fichas, obras y seguimiento comercial",
    roles: ["ADMIN", "VENTAS"],
  },
  {
    href: "/ventas",
    titulo: "Ventas",
    icono: "ventas",
    descripcion: "Pedidos de concreto",
    roles: ["ADMIN", "VENTAS"],
  },
  {
    href: "/planta",
    titulo: "Planta",
    icono: "planta",
    descripcion: "Producción pendiente y flota de mixers",
    roles: ["ADMIN", "PLANTA"],
  },
  {
    href: "/conductor",
    titulo: "Mis despachos",
    icono: "camion",
    descripcion: "Remisiones por entregar",
    roles: ["ADMIN", "CONDUCTOR"],
  },
  {
    href: "/admin/usuarios",
    titulo: "Usuarios",
    icono: "usuarios",
    descripcion: "Cuentas y roles del equipo",
    roles: ["ADMIN"],
  },
  {
    href: "/admin/configuracion",
    titulo: "Configuración",
    icono: "configuracion",
    descripcion: "Logo y marca de la empresa",
    roles: ["ADMIN"],
  },
] as const satisfies readonly {
  href: string;
  titulo: string;
  icono: NombreIcono;
  descripcion: string;
  roles: readonly Rol[];
}[];

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
