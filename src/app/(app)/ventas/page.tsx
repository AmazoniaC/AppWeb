import { requireRole } from "@/lib/auth";
import { etiquetaEstado, formatoFecha, formatoM3 } from "@/lib/formato";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Ventas · Amazonia Concrete" };

export default async function VentasPage() {
  await requireRole("ADMIN", "VENTAS");

  const pedidos = await prisma.pedido.findMany({
    orderBy: { fechaEntrega: "desc" },
    take: 20,
    include: { cliente: true, obra: true, producto: true },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Ventas</h1>
      <section className="card">
        <h2 className="mb-3 font-medium">Pedidos recientes</h2>
        {pedidos.length === 0 ? (
          <p className="text-sm text-stone-500">Aún no hay pedidos.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="tabla">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>Obra</th>
                  <th>Producto</th>
                  <th>Volumen</th>
                  <th>Entrega</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => (
                  <tr key={p.id}>
                    <td>{p.numero}</td>
                    <td>{p.cliente.nombre}</td>
                    <td>{p.obra.nombre}</td>
                    <td>{p.producto.nombre}</td>
                    <td>{formatoM3(p.volumenM3)}</td>
                    <td>{formatoFecha(p.fechaEntrega)}</td>
                    <td>{etiquetaEstado(p.estado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
