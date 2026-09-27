import { requireRole } from "@/lib/auth";
import { etiquetaEstado, formatoFechaHora, formatoM3 } from "@/lib/formato";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Mis despachos · Amazonia Concrete" };

export default async function ConductorPage() {
  const usuario = await requireRole("ADMIN", "CONDUCTOR");

  // El conductor solo ve sus despachos; el administrador ve todos.
  const despachos = await prisma.despacho.findMany({
    where: {
      ...(usuario.rol === "CONDUCTOR" ? { conductorId: usuario.id } : {}),
      estado: { notIn: ["ENTREGADO", "CANCELADO"] },
    },
    orderBy: { creadoEn: "asc" },
    include: {
      vehiculo: true,
      conductor: { select: { nombre: true } },
      pedido: { include: { obra: true, producto: true } },
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Mis despachos</h1>
      {despachos.length === 0 ? (
        <p className="card text-sm text-stone-500">No tienes despachos pendientes.</p>
      ) : (
        <ul className="space-y-3">
          {despachos.map((d) => (
            <li key={d.id} className="card space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-medium">Remisión {d.numero}</p>
                <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-900">
                  {etiquetaEstado(d.estado)}
                </span>
              </div>
              <p className="text-sm">
                {d.pedido.obra.nombre} · {d.pedido.obra.direccion}
              </p>
              <p className="text-sm text-stone-500">
                {d.pedido.producto.nombre} · {formatoM3(d.volumenM3)} · Mixer {d.vehiculo.placa}
                {usuario.rol === "ADMIN" && ` · ${d.conductor.nombre}`}
              </p>
              <p className="text-xs text-stone-400">Entrega: {formatoFechaHora(d.pedido.fechaEntrega)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
