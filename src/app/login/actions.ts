"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";

const LoginSchema = z.object({
  email: z.email({ error: "Escribe un correo válido." }).trim().toLowerCase(),
  password: z.string().min(1, { error: "Escribe tu contraseña." }),
});

export type LoginState = { error?: string; email?: string } | undefined;

// Hash fijo para comparar cuando el usuario no existe y así no revelar,
// por el tiempo de respuesta, qué correos están registrados.
const HASH_FALSO = bcrypt.hashSync("usuario-inexistente", 10);

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  const email = String(formData.get("email") ?? "");
  if (!parsed.success) return { error: parsed.error.issues[0]?.message, email };

  const usuario = await prisma.usuario.findUnique({ where: { email: parsed.data.email } });
  const ok = await bcrypt.compare(parsed.data.password, usuario?.passwordHash ?? HASH_FALSO);
  if (!usuario || !ok || !usuario.activo) {
    return { error: "Correo o contraseña incorrectos.", email };
  }

  await createSession({ userId: usuario.id, rol: usuario.rol });

  const desde = String(formData.get("desde") ?? "");
  const destino = desde.startsWith("/") && !desde.startsWith("//") ? desde : "/inicio";
  redirect(destino);
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
