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
import { EstadoBadge } from "@/components/estado";
import { Icono } from "@/components/iconos";
import { Dato, Encabezado, Indicador, Tarjeta, Vacio } from "@/components/ui";
import {
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
    <div className="space-y-6">
      <Encabezado
        volver={{ href: "/clientes", texto: "Clientes" }}
        titulo={
          <span className="flex flex-wrap items-center gap-3">
            {cliente.nombre}
            <span className={`badge ${ESTADO_CLIENTE_COLOR[cliente.estado]}`}>
              {ESTADO_CLIENTE_ETIQUETA[cliente.estado]}
            </span>
          </span>
        }
        descripcion={cliente.nombreComercial}
      >
        <Link href={`/clientes/${id}/editar`} className="btn-secondary py-2">
          Editar
        </Link>
      </Encabezado>

      <WhatsappBoton
        clienteId={id}
        numero={numeroWhatsapp(cliente.whatsapp) ?? numeroWhatsapp(cliente.telefono)}
        plantillas={plantillas}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Indicador titulo="Pedidos" valor={String(resumen.pedidos)} icono="ventas" tono="azul" />
        <Indicador titulo="Volumen comprado" valor={formatoM3(resumen.volumenM3)} icono="cubo" tono="ambar" />
        <Indicador titulo="Valor comprado" valor={formatoPesos(resumen.valor)} icono="dinero" tono="verde" />
        <Indicador
          titulo="Último pedido"
          valor={resumen.ultimoPedido ? formatoFecha(resumen.ultimoPedido) : "—"}
          icono="calendario"
          tono="violeta"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Tarjeta titulo="Datos del cliente" icono="clientes" className="lg:col-span-1">
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
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
          {cliente.notas && (
            <p className="mt-4 rounded-xl bg-amber-50/60 p-3 text-sm whitespace-pre-line text-stone-700">{cliente.notas}</p>
          )}
        </Tarjeta>

        <Tarjeta titulo="Seguimiento" icono="calendario" className="space-y-5 lg:col-span-2">
          <div className="rounded-xl bg-stone-50 p-4">
            <SeguimientoForm clienteId={id} hoy={hoyBogota()} />
          </div>

          {pendientes.length > 0 && (
            <div>
              <h3 className="etiqueta mb-2">Por hacer</h3>
              <ul className="space-y-2 text-sm">
                {pendientes.map((s) => (
                  <li
                    key={s.id}
                    className="flex flex-wrap items-center gap-3 rounded-xl border border-stone-200 px-3 py-2"
                  >
                    <FechaTarea fecha={s.proximaFecha!} manana={manana} />
                    <span className="flex-1">{s.proximaAccion ?? s.descripcion}</span>
                    <form action={completarSeguimiento}>
                      <input type="hidden" name="id" value={s.id} />
                      <button type="submit" className="btn-secondary text-xs">
                        <Icono nombre="check" className="size-3.5" />
                        Marcar hecho
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h3 className="etiqueta mb-3">Historial de contacto</h3>
            {cliente.seguimientos.length === 0 ? (
              <Vacio icono="telefono">Aún no hay contactos registrados.</Vacio>
            ) : (
              <ol className="relative space-y-4 border-l-2 border-amber-100 pl-5 text-sm">
                {cliente.seguimientos.map((s) => (
                  <li key={s.id} className="relative">
                    <span className="absolute top-1.5 -left-[27px] size-3 rounded-full border-2 border-white bg-amber-500 ring-2 ring-amber-100" />
                    <p className="text-xs text-stone-500">
                      <span className="font-medium text-stone-700">{TIPO_SEGUIMIENTO_ETIQUETA[s.tipo]}</span> ·{" "}
                      {formatoFechaHora(s.creadoEn)} · {s.usuario.nombre}
                    </p>
                    <p className="mt-0.5 whitespace-pre-line">{s.descripcion}</p>
                    {s.proximaFecha && (
                      <p className="mt-1 text-xs text-stone-500">
                        Próxima: {s.proximaAccion ?? "seguimiento"} el {formatoFecha(s.proximaFecha)}
                        {s.completadoEn && " · hecho"}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </Tarjeta>
      </div>

      <Tarjeta titulo="Obras" icono="obra" className="space-y-4">
        {cliente.obras.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {cliente.obras.map((o) => (
              <div
                key={o.id}
                className={`flex flex-col gap-2 rounded-xl border p-4 ${
                  o.activa ? "border-stone-200" : "border-dashed border-stone-200 bg-stone-50 text-stone-400"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">{o.nombre}</p>
                  <span className={`badge ${o.activa ? "bg-emerald-50 text-emerald-700" : "bg-stone-200 text-stone-500"}`}>
                    {o.activa ? "Activa" : "Cerrada"}
                  </span>
                </div>
                <p className="flex items-start gap-1.5 text-sm">
                  <Icono nombre="ubicacion" className="mt-0.5 size-4 text-stone-400" />
                  {[o.direccion, o.ciudad].filter(Boolean).join(", ")}
                </p>
                {(o.contacto || o.telefono) && (
                  <p className="flex items-center gap-1.5 text-sm">
                    <Icono nombre="telefono" className="size-4 text-stone-400" />
                    {[o.contacto, o.telefono].filter(Boolean).join(" · ")}
                  </p>
                )}
                <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-2">
                  <span className="text-xs">
                    {o._count.pedidos} {o._count.pedidos === 1 ? "pedido" : "pedidos"}
                  </span>
                  <form action={cambiarEstadoObra}>
                    <input type="hidden" name="id" value={o.id} />
                    <button type="submit" className="btn-secondary text-xs">
                      {o.activa ? "Cerrar obra" : "Reabrir"}
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="rounded-xl bg-stone-50 p-4">
          <p className="etiqueta mb-3">Agregar obra</p>
          <ObraForm clienteId={id} ciudad={cliente.ciudad ?? undefined} />
        </div>
      </Tarjeta>

      <Tarjeta titulo="Historial de compras" icono="ventas">
        {pedidos.length === 0 ? (
          <Vacio icono="ventas">Este cliente aún no tiene pedidos.</Vacio>
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
                  <th>Valor</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => (
                  <tr key={p.id} className={p.estado === "CANCELADO" ? "text-stone-400 line-through" : ""}>
                    <td className="font-mono text-stone-500">{p.numero}</td>
                    <td className="whitespace-nowrap">{formatoFecha(p.fechaEntrega)}</td>
                    <td>{p.obra.nombre}</td>
                    <td>{p.producto.nombre}</td>
                    <td className="whitespace-nowrap">{formatoM3(p.volumenM3)}</td>
                    <td className="whitespace-nowrap">{formatoPesos(Number(p.volumenM3) * Number(p.precioM3))}</td>
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
