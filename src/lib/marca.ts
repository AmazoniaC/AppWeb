import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const NOMBRE_EMPRESA = "Amazonia Concrete";

// URL del logo subido, o null si aún no hay. Lleva la fecha de la última
// actualización para que el navegador pida el nuevo cuando se cambie.
export const urlLogo = cache(async () => {
  const config = await prisma.configuracion.findUnique({
    where: { id: "general" },
    select: { logoTipo: true, actualizadoEn: true },
  });
  return config?.logoTipo ? `/api/logo?v=${config.actualizadoEn.getTime()}` : null;
});
