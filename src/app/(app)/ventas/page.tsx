import { EstadoBadge } from "@/components/estado";
import { Encabezado, Indicador, Tarjeta, Vacio } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { formatoFecha, formatoM3, formatoPesos } from "@/lib/formato";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Ventas · Amazonia Concrete" };

export default async function VentasPage() {
  await requireRole("ADMIN", "VENTAS");

  const pedidos = await prisma.pedido.findMany({
    orderBy: { fechaEntrega: "desc" },
    take: 20,
    include: { cliente: true, obra: true, producto: true },
  });

  const vigentes = pedidos.filter((p) => p.estado !== "CANCELADO");
  const abiertos = vigentes.filter((p) => ["PENDIENTE", "CONFIRMADO", "EN_PRODUCCION"].includes(p.estado)).length;
  const volumen = vigentes.reduce((t, p) => t + Number(p.volumenM3), 0);
  const valor = vigentes.reduce((t, p) => t + Number(p.volumenM3) * Number(p.precioM3), 0);

  return (
    <div className="space-y-6">
      <Encabezado titulo="Ventas" descripcion="Pedidos de concreto de los clientes." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Indicador titulo="Pedidos abiertos" valor={abiertos} icono="ventas" tono="azul" detalle="De los últimos 20" />
        <Indicador titulo="Volumen" valor={formatoM3(volumen)} icono="cubo" tono="ambar" detalle="De los últimos 20" />
        <Indicador titulo="Valor" valor={formatoPesos(valor)} icono="dinero" tono="verde" detalle="De los últimos 20" />
      </div>

      <Tarjeta titulo="Pedidos recientes" icono="calendario">
        {pedidos.length === 0 ? (
          <Vacio icono="ventas">Aún no hay pedidos.</Vacio>
        ) : (
          <div className="-mx-5 overflow-x-auto px-5">
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
                    <td className="font-mono text-stone-500">{p.numero}</td>
                    <td className="font-medium">{p.cliente.nombre}</td>
                    <td>{p.obra.nombre}</td>
                    <td>{p.producto.nombre}</td>
                    <td className="whitespace-nowrap">{formatoM3(p.volumenM3)}</td>
                    <td className="whitespace-nowrap">{formatoFecha(p.fechaEntrega)}</td>
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
    </div>
  );
}
