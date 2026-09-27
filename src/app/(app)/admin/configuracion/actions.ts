"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_BYTES = 2 * 1024 * 1024;

// Se revisan los primeros bytes del archivo, no solo su extensión.
function tipoDeImagen(b: Uint8Array): string | null {
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  const texto = (i: number, j: number) => String.fromCharCode(...b.subarray(i, j));
  if (texto(0, 4) === "RIFF" && texto(8, 12) === "WEBP") return "image/webp";
  return null;
}

// intento cambia en cada envío para volver a montar el selector (React limpia
// el formulario tras la acción y la vista previa quedaría desfasada).
export type LogoState = { error?: string; guardado?: boolean; intento: number } | undefined;

export async function subirLogo(_prev: LogoState, formData: FormData): Promise<LogoState> {
  await requireRole("ADMIN");

  const archivo = formData.get("logo");
  if (!(archivo instanceof File) || archivo.size === 0) return { error: "Elige una imagen.", intento: Date.now() };
  if (archivo.size > MAX_BYTES) return { error: "La imagen pesa más de 2 MB. Usa una más liviana.", intento: Date.now() };

  const bytes = new Uint8Array(await archivo.arrayBuffer());
  const tipo = tipoDeImagen(bytes);
  if (!tipo) return { error: "El archivo debe ser una imagen PNG, JPG o WEBP.", intento: Date.now() };

  await prisma.configuracion.upsert({
    where: { id: "general" },
    create: { id: "general", logo: bytes, logoTipo: tipo },
    update: { logo: bytes, logoTipo: tipo },
  });
  revalidatePath("/", "layout");
  return { guardado: true, intento: Date.now() };
}

export async function quitarLogo() {
  await requireRole("ADMIN");
  await prisma.configuracion.upsert({
    where: { id: "general" },
    create: { id: "general" },
    update: { logo: null, logoTipo: null },
  });
  revalidatePath("/", "layout");
}
