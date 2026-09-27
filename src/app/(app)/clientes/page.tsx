import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { requireRole } from "@/lib/auth";
import {
  ESTADO_CLIENTE_COLOR,
  ESTADO_CLIENTE_ETIQUETA,
  ESTADOS_CLIENTE,
  TIPO_SEGUIMIENTO_ETIQUETA,
} from "@/lib/clientes";
import { seguimientosPendientes } from "@/lib/clientes-datos";
import { formatoFecha, inicioDelDia } from "@/lib/formato";
import { FechaTarea } from "./fecha-tarea";
import { Icono } from "@/components/iconos";
import { Avatar, Dato, Encabezado, Tarjeta, Vacio } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Clientes · Amazonia Concrete" };

const LIMITE = 100;

export default async function ClientesPage({ searchParams }: PageProps<"/clientes">) {
  const usuario = await requireRole("ADMIN", "VENTAS");
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const estado = ESTADOS_CLIENTE.find((e) => e === params.estado);
  const mios = params.mios === "1";

  const where: Prisma.ClienteWhereInput = {
    ...(estado && { estado }),
    ...(mios && { asesorId: usuario.id }),
    ...(q && {
      OR: [
        { nombre: { contains: q, mode: "insensitive" } },
        { nombreComercial: { contains: q, mode: "insensitive" } },
        { documento: { contains: q } },
        { telefono: { contains: q } },
        { whatsapp: { contains: q } },
        { contactoNombre: { contains: q, mode: "insensitive" } },
        { ciudad: { contains: q, mode: "insensitive" } },
      ],
    }),
  };

  const manana = inicioDelDia(1);
  const [clientes, total, pendientes] = await Promise.all([
    prisma.cliente.findMany({
      where,
      orderBy: { nombre: "asc" },
      take: LIMITE,
      include: {
        asesor: { select: { nombre: true } },
        seguimientos: { orderBy: { creadoEn: "desc" }, take: 1, select: { creadoEn: true } },
        _count: { select: { pedidos: true } },
      },
    }),
    prisma.cliente.count({ where }),
    // Tareas vencidas y de hoy, más las de la próxima semana.
    seguimientosPendientes({ hasta: inicioDelDia(8), ...(mios && { asesorId: usuario.id }) }),
  ]);

  const proximaPorCliente = new Map<string, Date>();
  for (const s of await seguimientosPendientes({ clienteIds: clientes.map((c) => c.id) })) {
    if (s.proximaFecha && !proximaPorCliente.has(s.clienteId)) proximaPorCliente.set(s.clienteId, s.proximaFecha);
  }

  return (
    <div className="space-y-6">
      <Encabezado titulo="Clientes" descripcion={`${total} ${total === 1 ? "cliente" : "clientes"}${q || estado || mios ? " con estos filtros" : ""}`}>
        <Link href="/clientes/nuevo" className="btn-primary">
          <Icono nombre="mas" className="size-4" />
          Nuevo cliente
        </Link>
      </Encabezado>

      {pendientes.length > 0 && (
        <Tarjeta titulo="Seguimientos por hacer" icono="calendario">
          <ul className="grid gap-2 md:grid-cols-2">
            {pendientes.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/clientes/${s.cliente.id}`}
                  className="flex h-full flex-col gap-0.5 rounded-xl border border-stone-200 p-3 text-sm transition hover:border-amber-300 hover:bg-amber-50/40"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate font-semibold">{s.cliente.nombre}</span>
                    <FechaTarea fecha={s.proximaFecha!} manana={manana} />
                  </span>
                  <span className="text-stone-600">{s.proximaAccion ?? TIPO_SEGUIMIENTO_ETIQUETA[s.tipo]}</span>
                  <span className="text-xs text-stone-400">{s.usuario.nombre}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Tarjeta>
      )}

      <form className="card flex flex-wrap items-end gap-3">
        <label className="min-w-60 flex-1">
          <span className="mb-1 block text-sm font-medium">Buscar</span>
          <span className="relative block">
            <Icono nombre="buscar" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Nombre, NIT, teléfono, contacto o ciudad"
              className="input pl-9"
            />
          </span>
        </label>
        <label>
          <span className="mb-1 block text-sm font-medium">Estado</span>
          <select name="estado" defaultValue={estado ?? ""} className="input">
            <option value="">Todos</option>
            {ESTADOS_CLIENTE.map((e) => (
              <option key={e} value={e}>
                {ESTADO_CLIENTE_ETIQUETA[e]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 py-2 text-sm">
          <input type="checkbox" name="mios" value="1" defaultChecked={mios} className="size-4 accent-amber-600" />
          Solo mis clientes
        </label>
        <button type="submit" className="btn-secondary py-2">
          Filtrar
        </button>
      </form>

      {clientes.length === 0 ? (
        <Vacio icono="clientes">
          {q || estado || mios ? "Ningún cliente coincide con la búsqueda." : "Aún no hay clientes. Crea el primero."}
        </Vacio>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {clientes.map((c) => {
            const proxima = proximaPorCliente.get(c.id);
            const telefono = c.whatsapp ?? c.telefono;
            return (
              <Link key={c.id} href={`/clientes/${c.id}`} className="card-enlace flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <Avatar nombre={c.nombreComercial ?? c.nombre} />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 font-semibold text-stone-900">{c.nombre}</p>
                    <p className="truncate text-xs text-stone-500">
                      {c.documento}
                      {c.ciudad && ` · ${c.ciudad}`}
                    </p>
                  </div>
                  <span className={`badge ${ESTADO_CLIENTE_COLOR[c.estado]}`}>{ESTADO_CLIENTE_ETIQUETA[c.estado]}</span>
                </div>

                <div className="space-y-1 text-sm text-stone-600">
                  {c.contactoNombre && <p className="truncate">{c.contactoNombre}</p>}
                  <p className="flex items-center gap-1.5">
                    <Icono nombre="telefono" className="size-4 text-stone-400" />
                    {telefono ?? "Sin teléfono"}
                  </p>
                </div>

                <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-stone-100 pt-3">
                  <Dato titulo="Pedidos" valor={c._count.pedidos} />
                  <Dato titulo="Último contacto" valor={c.seguimientos[0] ? formatoFecha(c.seguimientos[0].creadoEn) : "—"} />
                  <Dato titulo="Próximo" valor={proxima ? <FechaTarea fecha={proxima} manana={manana} /> : "—"} />
                </dl>
                <p className="-mt-2 truncate text-xs text-stone-400">Asesor: {c.asesor?.nombre ?? "sin asignar"}</p>
              </Link>
            );
          })}
        </div>
      )}
      {total > LIMITE && (
        <p className="text-center text-xs text-stone-500">
          Mostrando {LIMITE} de {total} clientes. Usa la búsqueda para encontrar los demás.
        </p>
      )}
    </div>
  );
}
