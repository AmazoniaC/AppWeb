"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { ESTADOS_CLIENTE, TIPOS_DOCUMENTO, TIPOS_PERSONA, TIPOS_SEGUIMIENTO } from "@/lib/clientes";
import { fechaDesdeInput } from "@/lib/formato";
import { prisma } from "@/lib/prisma";

const ROLES_CLIENTES = ["ADMIN", "VENTAS"] as const;

// Campo de texto opcional: vacío se guarda como null.
const opcional = z
  .string()
  .trim()
  .optional()
  .transform((v) => v || null);

const ClienteSchema = z.object({
  tipoPersona: z.enum(TIPOS_PERSONA, { error: "Elige el tipo de persona." }),
  tipoDocumento: z.enum(TIPOS_DOCUMENTO, { error: "Elige el tipo de documento." }),
  documento: z
    .string()
    .trim()
    .min(3, { error: "Escribe el NIT o documento." })
    .transform((v) => v.replace(/\s+/g, "")),
  nombre: z.string().trim().min(2, { error: "Escribe el nombre o razón social." }),
  nombreComercial: opcional,
  telefono: opcional,
  whatsapp: opcional,
  email: z.union([z.literal(""), z.email({ error: "Escribe un correo válido." })]).transform((v) => v || null),
  direccion: opcional,
  ciudad: opcional,
  contactoNombre: opcional,
  contactoCargo: opcional,
  estado: z.enum(ESTADOS_CLIENTE),
  asesorId: opcional,
  plazoPagoDias: z.coerce
    .number({ error: "El plazo debe ser un número de días." })
    .int()
    .min(0, { error: "El plazo no puede ser negativo." })
    .max(365),
  cupoCredito: z
    .string()
    .trim()
    .transform((v) => v.replace(/[^\d]/g, ""))
    .transform((v) => (v ? Number(v) : null)),
  notas: opcional,
});

export type ClienteFormState =
  | { error: string; valores: Record<string, string>; intento: number }
  | undefined;

export async function guardarCliente(_prev: ClienteFormState, formData: FormData): Promise<ClienteFormState> {
  await requireRole(...ROLES_CLIENTES);

  const valores = Object.fromEntries(
    [...formData.entries()].filter(([k]) => !k.startsWith("$")).map(([k, v]) => [k, String(v)]),
  );
  const fallo = (error: string) => ({ error, valores, intento: Date.now() });

  const parsed = ClienteSchema.safeParse(valores);
  if (!parsed.success) return fallo(parsed.error.issues[0]?.message ?? "Revisa los datos.");
  const datos = parsed.data;
  const id = valores.id || null;

  const duplicado = await prisma.cliente.findUnique({ where: { documento: datos.documento }, select: { id: true } });
  if (duplicado && duplicado.id !== id) return fallo("Ya existe un cliente con ese documento.");

  if (datos.asesorId) {
    const asesor = await prisma.usuario.findUnique({ where: { id: datos.asesorId }, select: { id: true } });
    if (!asesor) return fallo("El asesor elegido no existe.");
  }

  const cliente = id
    ? await prisma.cliente.update({ where: { id }, data: datos })
    : await prisma.cliente.create({ data: datos });

  revalidatePath("/clientes");
  redirect(`/clientes/${cliente.id}`);
}

const SeguimientoSchema = z
  .object({
    clienteId: z.string().min(1),
    tipo: z.enum(TIPOS_SEGUIMIENTO, { error: "Elige el tipo de contacto." }),
    descripcion: z.string().trim().min(2, { error: "Escribe qué se habló o qué pasó." }),
    proximaAccion: opcional,
    proximaFecha: z
      .string()
      .optional()
      .transform((v) => (v ? fechaDesdeInput(v) : null)),
  })
  .refine((s) => !s.proximaAccion || s.proximaFecha, {
    error: "Si hay una próxima acción, ponle fecha.",
  });

export type SeguimientoState = { error?: string; ok?: boolean } | undefined;

export async function registrarSeguimiento(_prev: SeguimientoState, formData: FormData): Promise<SeguimientoState> {
  const usuario = await requireRole(...ROLES_CLIENTES);

  const parsed = SeguimientoSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const { clienteId, ...datos } = parsed.data;

  const cliente = await prisma.cliente.findUnique({ where: { id: clienteId }, select: { id: true } });
  if (!cliente) return { error: "El cliente no existe." };

  await prisma.seguimiento.create({ data: { ...datos, clienteId, usuarioId: usuario.id } });
  revalidatePath(`/clientes/${clienteId}`);
  revalidatePath("/clientes");
  return { ok: true };
}

export async function completarSeguimiento(formData: FormData) {
  await requireRole(...ROLES_CLIENTES);
  const id = String(formData.get("id"));

  const seguimiento = await prisma.seguimiento.findUnique({ where: { id }, select: { clienteId: true } });
  if (!seguimiento) return;
  await prisma.seguimiento.update({ where: { id }, data: { completadoEn: new Date() } });
  revalidatePath(`/clientes/${seguimiento.clienteId}`);
  revalidatePath("/clientes");
}

// Deja constancia de que se abrió WhatsApp con este mensaje para el cliente.
export async function registrarWhatsapp(clienteId: string, mensaje: string) {
  const usuario = await requireRole(...ROLES_CLIENTES);
  const texto = mensaje.trim().slice(0, 2000);
  if (!texto) return;

  const cliente = await prisma.cliente.findUnique({ where: { id: clienteId }, select: { id: true } });
  if (!cliente) return;

  await prisma.seguimiento.create({
    data: { clienteId, usuarioId: usuario.id, tipo: "WHATSAPP", descripcion: `Mensaje por WhatsApp: ${texto}` },
  });
  revalidatePath(`/clientes/${clienteId}`);
  revalidatePath("/clientes");
}

const ObraSchema = z.object({
  clienteId: z.string().min(1),
  nombre: z.string().trim().min(2, { error: "Escribe el nombre de la obra." }),
  direccion: z.string().trim().min(3, { error: "Escribe la dirección de la obra." }),
  ciudad: opcional,
  contacto: opcional,
  telefono: opcional,
});

export type ObraState = { error?: string; ok?: boolean } | undefined;

export async function crearObra(_prev: ObraState, formData: FormData): Promise<ObraState> {
  await requireRole(...ROLES_CLIENTES);

  const parsed = ObraSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const cliente = await prisma.cliente.findUnique({ where: { id: parsed.data.clienteId }, select: { id: true } });
  if (!cliente) return { error: "El cliente no existe." };

  await prisma.obra.create({ data: parsed.data });
  revalidatePath(`/clientes/${parsed.data.clienteId}`);
  return { ok: true };
}

export async function cambiarEstadoObra(formData: FormData) {
  await requireRole(...ROLES_CLIENTES);
  const id = String(formData.get("id"));

  const obra = await prisma.obra.findUnique({ where: { id }, select: { activa: true, clienteId: true } });
  if (!obra) return;
  await prisma.obra.update({ where: { id }, data: { activa: !obra.activa } });
  revalidatePath(`/clientes/${obra.clienteId}`);
}
