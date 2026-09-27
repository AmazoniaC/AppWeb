import "server-only";
import { prisma } from "@/lib/prisma";

// Consultas del módulo de clientes que también usarán ventas y cotizaciones.

// Pedidos del cliente con sus totales. Los cancelados se listan pero no suman.
export async function historialCompras(clienteId: string) {
  const pedidos = await prisma.pedido.findMany({
    where: { clienteId },
    orderBy: { fechaEntrega: "desc" },
    include: {
      obra: { select: { id: true, nombre: true } },
      producto: { select: { nombre: true } },
    },
  });

  const vigentes = pedidos.filter((p) => p.estado !== "CANCELADO");
  const resumen = {
    pedidos: vigentes.length,
    volumenM3: vigentes.reduce((s, p) => s + Number(p.volumenM3), 0),
    valor: vigentes.reduce((s, p) => s + Number(p.volumenM3) * Number(p.precioM3), 0),
    ultimoPedido: vigentes.reduce<Date | null>((m, p) => (!m || p.fechaEntrega > m ? p.fechaEntrega : m), null),
  };
  return { pedidos, resumen };
}

// Seguimientos con próxima acción sin completar, más próximos primero.
export function seguimientosPendientes(filtro: { clienteIds?: string[]; asesorId?: string; hasta?: Date }) {
  return prisma.seguimiento.findMany({
    where: {
      completadoEn: null,
      proximaFecha: { not: null, ...(filtro.hasta && { lt: filtro.hasta }) },
      ...(filtro.clienteIds && { clienteId: { in: filtro.clienteIds } }),
      ...(filtro.asesorId && { cliente: { asesorId: filtro.asesorId } }),
    },
    orderBy: { proximaFecha: "asc" },
    include: { cliente: { select: { id: true, nombre: true } }, usuario: { select: { nombre: true } } },
  });
}

// Usuarios que pueden ser asesores comerciales. Incluye al asesor actual del
// cliente aunque ya no esté activo, para no perderlo al editar.
export function asesoresDisponibles(asesorActualId?: string | null) {
  return prisma.usuario.findMany({
    where: {
      OR: [{ activo: true, rol: { in: ["ADMIN", "VENTAS"] } }, ...(asesorActualId ? [{ id: asesorActualId }] : [])],
    },
    orderBy: { nombre: "asc" },
    select: { id: true, nombre: true },
  });
}
