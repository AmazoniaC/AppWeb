"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/roles";

const NuevoUsuarioSchema = z.object({
  nombre: z.string().trim().min(2, { error: "El nombre debe tener al menos 2 caracteres." }),
  email: z.email({ error: "Escribe un correo válido." }).trim().toLowerCase(),
  rol: z.enum(ROLES, { error: "Elige un rol." }),
  password: z.string().min(8, { error: "La contraseña debe tener al menos 8 caracteres." }),
});

export type CrearUsuarioState = { error?: string; ok?: boolean } | undefined;

export async function crearUsuario(_prev: CrearUsuarioState, formData: FormData): Promise<CrearUsuarioState> {
  await requireRole("ADMIN");

  const parsed = NuevoUsuarioSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const { password, ...datos } = parsed.data;
  const existe = await prisma.usuario.findUnique({ where: { email: datos.email } });
  if (existe) return { error: "Ya existe un usuario con ese correo." };

  await prisma.usuario.create({
    data: { ...datos, passwordHash: await bcrypt.hash(password, 10) },
  });
  revalidatePath("/admin/usuarios");
  return { ok: true };
}

export async function cambiarEstadoUsuario(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const id = String(formData.get("id"));
  if (id === admin.id) return; // Nadie se desactiva a sí mismo.

  const usuario = await prisma.usuario.findUnique({ where: { id } });
  if (!usuario) return;
  await prisma.usuario.update({ where: { id }, data: { activo: !usuario.activo } });
  revalidatePath("/admin/usuarios");
}
