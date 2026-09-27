import { EstadoBadge } from "@/components/estado";
import { Icono } from "@/components/iconos";
import { Encabezado, Vacio } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { formatoFechaHora, formatoM3 } from "@/lib/formato";
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
    <div className="space-y-6">
      <Encabezado titulo="Mis despachos" descripcion="Remisiones pendientes por entregar." />
      {despachos.length === 0 ? (
        <Vacio icono="camion">No tienes despachos pendientes.</Vacio>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {despachos.map((d) => (
            <li key={d.id} className="card space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="etiqueta">Remisión</p>
                  <p className="text-xl font-bold">#{d.numero}</p>
                </div>
                <EstadoBadge estado={d.estado} />
              </div>
              <div className="space-y-2 text-sm">
                <p className="flex items-start gap-2">
                  <Icono nombre="ubicacion" className="mt-0.5 size-4 text-amber-600" />
                  <span>
                    <span className="block font-medium">{d.pedido.obra.nombre}</span>
                    <span className="text-stone-500">{d.pedido.obra.direccion}</span>
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <Icono nombre="cubo" className="size-4 text-amber-600" />
                  {d.pedido.producto.nombre} · {formatoM3(d.volumenM3)}
                </p>
                <p className="flex items-center gap-2">
                  <Icono nombre="camion" className="size-4 text-amber-600" />
                  Mixer {d.vehiculo.placa}
                  {usuario.rol === "ADMIN" && ` · ${d.conductor.nombre}`}
                </p>
              </div>
              <p className="flex items-center gap-2 border-t border-stone-100 pt-3 text-xs text-stone-500">
                <Icono nombre="reloj" className="size-4" />
                Entrega: {formatoFechaHora(d.pedido.fechaEntrega)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
