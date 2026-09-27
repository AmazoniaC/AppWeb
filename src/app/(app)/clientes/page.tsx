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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <Link href="/clientes/nuevo" className="btn-primary">
          Nuevo cliente
        </Link>
      </div>

      {pendientes.length > 0 && (
        <section className="card">
          <h2 className="mb-3 font-medium">Seguimientos por hacer</h2>
          <ul className="divide-y divide-stone-100 text-sm">
            {pendientes.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
                <FechaTarea fecha={s.proximaFecha!} manana={manana} />
                <Link href={`/clientes/${s.cliente.id}`} className="font-medium hover:underline">
                  {s.cliente.nombre}
                </Link>
                <span className="text-stone-600">{s.proximaAccion ?? TIPO_SEGUIMIENTO_ETIQUETA[s.tipo]}</span>
                <span className="text-xs text-stone-400">· {s.usuario.nombre}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <form className="card flex flex-wrap items-end gap-3">
        <label className="min-w-60 flex-1">
          <span className="mb-1 block text-sm font-medium">Buscar</span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Nombre, NIT, teléfono, contacto o ciudad"
            className="input"
          />
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
          <input type="checkbox" name="mios" value="1" defaultChecked={mios} />
          Solo mis clientes
        </label>
        <button type="submit" className="btn-secondary">
          Filtrar
        </button>
      </form>

      <section className="card overflow-x-auto">
        {clientes.length === 0 ? (
          <p className="text-sm text-stone-500">
            {q || estado || mios ? "Ningún cliente coincide con la búsqueda." : "Aún no hay clientes. Crea el primero."}
          </p>
        ) : (
          <table className="tabla">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Documento</th>
                <th>Contacto</th>
                <th>Ciudad</th>
                <th>Asesor</th>
                <th>Pedidos</th>
                <th>Último contacto</th>
                <th>Próximo seguimiento</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => {
                const proxima = proximaPorCliente.get(c.id);
                return (
                  <tr key={c.id}>
                    <td>
                      <Link href={`/clientes/${c.id}`} className="font-medium hover:underline">
                        {c.nombre}
                      </Link>
                      <span className={`ml-2 rounded px-1.5 py-0.5 text-xs ${ESTADO_CLIENTE_COLOR[c.estado]}`}>
                        {ESTADO_CLIENTE_ETIQUETA[c.estado]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap">{c.documento}</td>
                    <td>
                      {c.contactoNombre && <div>{c.contactoNombre}</div>}
                      <div className="text-stone-500">{c.whatsapp ?? c.telefono ?? "—"}</div>
                    </td>
                    <td>{c.ciudad ?? "—"}</td>
                    <td>{c.asesor?.nombre ?? "—"}</td>
                    <td>{c._count.pedidos}</td>
                    <td className="whitespace-nowrap">
                      {c.seguimientos[0] ? formatoFecha(c.seguimientos[0].creadoEn) : "—"}
                    </td>
                    <td className="whitespace-nowrap">
                      {proxima ? <FechaTarea fecha={proxima} manana={manana} /> : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {total > LIMITE && (
          <p className="mt-3 text-xs text-stone-500">
            Mostrando {LIMITE} de {total} clientes. Usa la búsqueda para encontrar los demás.
          </p>
        )}
      </section>
    </div>
  );
}
