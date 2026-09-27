import { requireRole } from "@/lib/auth";
import { etiquetaEstado, formatoFechaHora, formatoM3 } from "@/lib/formato";
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

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Planta</h1>
      <section className="card">
        <h2 className="mb-3 font-medium">Producción pendiente</h2>
        {pedidos.length === 0 ? (
          <p className="text-sm text-stone-500">No hay pedidos confirmados por producir.</p>
        ) : (
          <div className="overflow-x-auto">
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
                    <td>{p.numero}</td>
                    <td>{formatoFechaHora(p.fechaEntrega)}</td>
                    <td>{p.obra.nombre}</td>
                    <td>{p.producto.nombre}</td>
                    <td>{formatoM3(p.volumenM3)}</td>
                    <td>{etiquetaEstado(p.estado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <section className="card">
        <h2 className="mb-3 font-medium">Flota</h2>
        <table className="tabla">
          <thead>
            <tr>
              <th>Placa</th>
              <th>Capacidad</th>
              <th>Conductor</th>
            </tr>
          </thead>
          <tbody>
            {vehiculos.map((v) => (
              <tr key={v.id}>
                <td>{v.placa}</td>
                <td>{formatoM3(v.capacidadM3)}</td>
                <td>{v.conductorAsignado?.nombre ?? "Sin asignar"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
