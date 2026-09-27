import { EstadoBadge } from "@/components/estado";
import { Icono } from "@/components/iconos";
import { Encabezado, Indicador, Tarjeta, Vacio } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { formatoFechaHora, formatoM3 } from "@/lib/formato";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Planta · Amazonia Concrete" };

export default async function PlantaPage() {
  await requireRole("ADMIN", "PLANTA");

  const [pedidos, vehiculos] = await Promise.all([
    prisma.pedido.findMany({
      where: { estado: { in: ["CONFIRMADO", "EN_PRODUCCION"] } },
      orderBy: { fechaEntrega: "asc" },
      include: { obra: true, producto: true },
    }),
    prisma.vehiculo.findMany({
      where: { activo: true },
      orderBy: { placa: "asc" },
      include: { conductorAsignado: { select: { nombre: true } } },
    }),
  ]);
  const volumen = pedidos.reduce((t, p) => t + Number(p.volumenM3), 0);

  return (
    <div className="space-y-6">
      <Encabezado titulo="Planta" descripcion="Lo que hay que producir y los mixers disponibles." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Indicador titulo="Pedidos por producir" valor={pedidos.length} icono="planta" tono="ambar" />
        <Indicador titulo="Volumen por producir" valor={formatoM3(volumen)} icono="cubo" tono="azul" />
        <Indicador titulo="Mixers activos" valor={vehiculos.length} icono="camion" tono="verde" />
      </div>

      <Tarjeta titulo="Producción pendiente" icono="planta">
        {pedidos.length === 0 ? (
          <Vacio icono="planta">No hay pedidos confirmados por producir.</Vacio>
        ) : (
          <div className="-mx-5 overflow-x-auto px-5">
            <table className="tabla">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Entrega</th>
                  <th>Obra</th>
                  <th>Producto</th>
                  <th>Volumen</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => (
                  <tr key={p.id}>
                    <td className="font-mono text-stone-500">{p.numero}</td>
                    <td className="whitespace-nowrap">{formatoFechaHora(p.fechaEntrega)}</td>
                    <td className="font-medium">{p.obra.nombre}</td>
                    <td>{p.producto.nombre}</td>
                    <td className="whitespace-nowrap">{formatoM3(p.volumenM3)}</td>
                    <td>
                      <EstadoBadge estado={p.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Tarjeta>

      <section className="space-y-3">
        <h2 className="font-semibold text-stone-800">Flota</h2>
        {vehiculos.length === 0 ? (
          <Vacio icono="camion">No hay mixers activos.</Vacio>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {vehiculos.map((v) => (
              <div key={v.id} className="card flex items-center gap-4">
                <span className="grid size-12 place-items-center rounded-xl bg-stone-100 text-stone-600">
                  <Icono nombre="camion" className="size-6" />
                </span>
                <div className="min-w-0">
                  <p className="font-mono text-lg font-bold tracking-wider">{v.placa}</p>
                  <p className="text-sm text-stone-500">Capacidad {formatoM3(v.capacidadM3)}</p>
                  <p className={`truncate text-sm ${v.conductorAsignado ? "text-stone-700" : "text-stone-400 italic"}`}>
                    {v.conductorAsignado?.nombre ?? "Sin conductor"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
