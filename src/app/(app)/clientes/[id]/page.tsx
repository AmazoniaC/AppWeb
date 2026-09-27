import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import {
  ESTADO_CLIENTE_COLOR,
  ESTADO_CLIENTE_ETIQUETA,
  TIPO_DOCUMENTO_ETIQUETA,
  TIPO_SEGUIMIENTO_ETIQUETA,
  plazoPagoTexto,
} from "@/lib/clientes";
import { historialCompras } from "@/lib/clientes-datos";
import {
  etiquetaEstado,
  formatoFecha,
  formatoFechaHora,
  formatoM3,
  formatoPesos,
  hoyBogota,
  inicioDelDia,
} from "@/lib/formato";
import { prisma } from "@/lib/prisma";
import { numeroWhatsapp, plantillasWhatsapp } from "@/lib/whatsapp";
import { cambiarEstadoObra, completarSeguimiento } from "../actions";
import { FechaTarea } from "../fecha-tarea";
import { ObraForm } from "./obra-form";
import { SeguimientoForm } from "./seguimiento-form";
import { WhatsappBoton } from "./whatsapp-boton";

export async function generateMetadata({ params }: PageProps<"/clientes/[id]">) {
  const { id } = await params;
  const cliente = await prisma.cliente.findUnique({ where: { id }, select: { nombre: true } });
  return { title: `${cliente?.nombre ?? "Cliente"} · Amazonia Concrete` };
}

export default async function ClientePage({ params }: PageProps<"/clientes/[id]">) {
  const usuario = await requireRole("ADMIN", "VENTAS");
  const { id } = await params;

  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      asesor: { select: { nombre: true } },
      obras: { orderBy: [{ activa: "desc" }, { creadoEn: "desc" }], include: { _count: { select: { pedidos: true } } } },
      seguimientos: { orderBy: { creadoEn: "desc" }, take: 50, include: { usuario: { select: { nombre: true } } } },
    },
  });
  if (!cliente) notFound();

  const { pedidos, resumen } = await historialCompras(id);
  const pendientes = cliente.seguimientos
    .filter((s) => s.proximaFecha && !s.completadoEn)
    .sort((a, b) => a.proximaFecha!.getTime() - b.proximaFecha!.getTime());
  const manana = inicioDelDia(1);

  // Para la plantilla de confirmación: el próximo pedido aún no entregado.
  const pedidoAbierto = pedidos
    .filter((p) => ["PENDIENTE", "CONFIRMADO", "EN_PRODUCCION"].includes(p.estado))
    .at(-1);
  const plantillas = plantillasWhatsapp({
    contacto: cliente.contactoNombre?.split(" ")[0] ?? cliente.nombre,
    asesor: usuario.nombre,
    pedido: pedidoAbierto && {
      numero: pedidoAbierto.numero,
      volumen: formatoM3(pedidoAbierto.volumenM3),
      producto: pedidoAbierto.producto.nombre,
      obra: pedidoAbierto.obra.nombre,
      fecha: formatoFecha(pedidoAbierto.fechaEntrega),
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <Link href="/clientes" className="text-sm text-stone-500 hover:underline">
          ← Clientes
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">{cliente.nombre}</h1>
          <span className={`rounded px-2 py-0.5 text-xs ${ESTADO_CLIENTE_COLOR[cliente.estado]}`}>
            {ESTADO_CLIENTE_ETIQUETA[cliente.estado]}
          </span>
          <Link href={`/clientes/${id}/editar`} className="btn-secondary ml-auto">
            Editar
          </Link>
        </div>
        {cliente.nombreComercial && <p className="text-sm text-stone-500">{cliente.nombreComercial}</p>}
      </div>

      <WhatsappBoton
        clienteId={id}
        numero={numeroWhatsapp(cliente.whatsapp) ?? numeroWhatsapp(cliente.telefono)}
        plantillas={plantillas}
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <Indicador titulo="Pedidos" valor={String(resumen.pedidos)} />
        <Indicador titulo="Volumen comprado" valor={formatoM3(resumen.volumenM3)} />
        <Indicador titulo="Valor comprado" valor={formatoPesos(resumen.valor)} />
        <Indicador titulo="Último pedido" valor={resumen.ultimoPedido ? formatoFecha(resumen.ultimoPedido) : "—"} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card lg:col-span-1">
          <h2 className="mb-3 font-medium">Datos</h2>
          <dl className="space-y-2 text-sm">
            <Dato titulo={TIPO_DOCUMENTO_ETIQUETA[cliente.tipoDocumento]} valor={cliente.documento} />
            <Dato
              titulo="Contacto"
              valor={[cliente.contactoNombre, cliente.contactoCargo].filter(Boolean).join(" · ") || null}
            />
            <Dato titulo="Celular / WhatsApp" valor={cliente.whatsapp} />
            <Dato titulo="Teléfono" valor={cliente.telefono} />
            <Dato titulo="Correo" valor={cliente.email} />
            <Dato titulo="Dirección" valor={[cliente.direccion, cliente.ciudad].filter(Boolean).join(", ") || null} />
            <Dato titulo="Asesor" valor={cliente.asesor?.nombre ?? null} />
            <Dato titulo="Condición de pago" valor={plazoPagoTexto(cliente.plazoPagoDias)} />
            <Dato titulo="Cupo de crédito" valor={cliente.cupoCredito ? formatoPesos(cliente.cupoCredito) : null} />
            <Dato titulo="Cliente desde" valor={formatoFecha(cliente.creadoEn)} />
          </dl>
          {cliente.notas && <p className="mt-3 whitespace-pre-line rounded bg-stone-50 p-3 text-sm">{cliente.notas}</p>}
        </section>

        <section className="card space-y-4 lg:col-span-2">
          <h2 className="font-medium">Seguimiento</h2>
          <SeguimientoForm clienteId={id} hoy={hoyBogota()} />

          {pendientes.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-stone-500">Por hacer</h3>
              <ul className="divide-y divide-stone-100 text-sm">
                {pendientes.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center gap-3 py-2">
                    <FechaTarea fecha={s.proximaFecha!} manana={manana} />
                    <span className="flex-1">{s.proximaAccion ?? s.descripcion}</span>
                    <form action={completarSeguimiento}>
                      <input type="hidden" name="id" value={s.id} />
                      <button type="submit" className="btn-secondary text-xs">
                        Marcar hecho
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h3 className="mb-2 text-sm font-medium text-stone-500">Historial de contacto</h3>
            {cliente.seguimientos.length === 0 ? (
              <p className="text-sm text-stone-500">Aún no hay contactos registrados.</p>
            ) : (
              <ol className="space-y-3 text-sm">
                {cliente.seguimientos.map((s) => (
                  <li key={s.id} className="border-l-2 border-amber-200 pl-3">
                    <p className="text-xs text-stone-500">
                      {formatoFechaHora(s.creadoEn)} · {TIPO_SEGUIMIENTO_ETIQUETA[s.tipo]} · {s.usuario.nombre}
                    </p>
                    <p className="whitespace-pre-line">{s.descripcion}</p>
                    {s.proximaFecha && (
                      <p className="text-xs text-stone-500">
                        Próxima: {s.proximaAccion ?? "seguimiento"} el {formatoFecha(s.proximaFecha)}
                        {s.completadoEn && " · hecho"}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
      </div>

      <section className="card space-y-4">
        <h2 className="font-medium">Obras</h2>
        {cliente.obras.length > 0 && (
          <div className="overflow-x-auto">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Obra</th>
                  <th>Dirección</th>
                  <th>Contacto</th>
                  <th>Pedidos</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cliente.obras.map((o) => (
                  <tr key={o.id} className={o.activa ? "" : "text-stone-400"}>
                    <td>{o.nombre}</td>
                    <td>{[o.direccion, o.ciudad].filter(Boolean).join(", ")}</td>
                    <td>{[o.contacto, o.telefono].filter(Boolean).join(" · ") || "—"}</td>
                    <td>{o._count.pedidos}</td>
                    <td className="text-right">
                      <form action={cambiarEstadoObra}>
                        <input type="hidden" name="id" value={o.id} />
                        <button type="submit" className="btn-secondary text-xs">
                          {o.activa ? "Cerrar obra" : "Reabrir"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <ObraForm clienteId={id} ciudad={cliente.ciudad ?? undefined} />
      </section>

      <section className="card">
        <h2 className="mb-3 font-medium">Historial de compras</h2>
        {pedidos.length === 0 ? (
          <p className="text-sm text-stone-500">Este cliente aún no tiene pedidos.</p>
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
                  <th>Valor</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => (
                  <tr key={p.id} className={p.estado === "CANCELADO" ? "text-stone-400 line-through" : ""}>
                    <td>{p.numero}</td>
                    <td className="whitespace-nowrap">{formatoFecha(p.fechaEntrega)}</td>
                    <td>{p.obra.nombre}</td>
                    <td>{p.producto.nombre}</td>
                    <td className="whitespace-nowrap">{formatoM3(p.volumenM3)}</td>
                    <td className="whitespace-nowrap">{formatoPesos(Number(p.volumenM3) * Number(p.precioM3))}</td>
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

function Indicador({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="card">
      <p className="text-sm text-stone-500">{titulo}</p>
      <p className="text-xl font-semibold">{valor}</p>
    </div>
  );
}

function Dato({ titulo, valor }: { titulo: string; valor: string | null }) {
  return (
    <div>
      <dt className="text-xs text-stone-500">{titulo}</dt>
      <dd>{valor ?? "—"}</dd>
    </div>
  );
}
