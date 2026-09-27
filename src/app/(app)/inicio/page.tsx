import Link from "next/link";
import { Icono } from "@/components/iconos";
import { Indicador } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROL_ETIQUETA, seccionesPara } from "@/lib/roles";

export const metadata = { title: "Inicio · Amazonia Concrete" };

const fechaLarga = new Intl.DateTimeFormat("es-CO", { dateStyle: "full", timeZone: "America/Bogota" });

export default async function InicioPage({ searchParams }: PageProps<"/inicio">) {
  const usuario = await requireUser();
  const { denegado } = await searchParams;

  const [clientes, pedidosAbiertos, despachosActivos] = await Promise.all([
    prisma.cliente.count({ where: { estado: "ACTIVO" } }),
    prisma.pedido.count({ where: { estado: { in: ["PENDIENTE", "CONFIRMADO", "EN_PRODUCCION"] } } }),
    prisma.despacho.count({ where: { estado: { in: ["CARGANDO", "EN_RUTA", "EN_OBRA"] } } }),
  ]);
  const hoy = fechaLarga.format(new Date());

  return (
    <div className="space-y-6">
      {denegado && (
        <p role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <Icono nombre="alerta" />
          Tu rol no tiene acceso a esa sección.
        </p>
      )}

      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900 p-6 text-white shadow-sm md:p-8">
        <div className="absolute -top-20 -right-20 size-64 rounded-full bg-amber-500/25 blur-3xl" />
        <p className="relative text-sm text-amber-200 first-letter:uppercase">{hoy}</p>
        <h1 className="relative mt-1 text-2xl font-bold tracking-tight md:text-3xl">Hola, {usuario.nombre}</h1>
        <p className="relative mt-1 text-sm text-stone-300">
          Ingresaste como <span className="font-medium text-white">{ROL_ETIQUETA[usuario.rol]}</span>. Este es el
          resumen de la operación.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Indicador titulo="Clientes activos" valor={clientes} icono="clientes" tono="verde" />
        <Indicador titulo="Pedidos abiertos" valor={pedidosAbiertos} icono="ventas" tono="azul" />
        <Indicador titulo="Despachos en curso" valor={despachosActivos} icono="camion" tono="ambar" />
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold text-stone-800">Accesos rápidos</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {seccionesPara(usuario.rol)
            .filter((s) => s.href !== "/inicio")
            .map((s) => (
              <Link key={s.href} href={s.href} className="card-enlace group flex items-center gap-4">
                <span className="grid size-12 place-items-center rounded-xl bg-amber-50 text-amber-700 transition group-hover:bg-amber-600 group-hover:text-white">
                  <Icono nombre={s.icono} className="size-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-stone-900">{s.titulo}</span>
                  <span className="block text-sm text-stone-500">{s.descripcion}</span>
                </span>
                <Icono nombre="flecha" className="size-4 text-stone-300 transition group-hover:text-amber-600" />
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
