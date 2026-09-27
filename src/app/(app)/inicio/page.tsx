import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROL_ETIQUETA, seccionesPara } from "@/lib/roles";

export const metadata = { title: "Inicio · Amazonia Concrete" };

export default async function InicioPage({ searchParams }: PageProps<"/inicio">) {
  const usuario = await requireUser();
  const { denegado } = await searchParams;

  const [clientes, pedidosAbiertos, despachosActivos] = await Promise.all([
    prisma.cliente.count({ where: { activo: true } }),
    prisma.pedido.count({ where: { estado: { in: ["PENDIENTE", "CONFIRMADO", "EN_PRODUCCION"] } } }),
    prisma.despacho.count({ where: { estado: { in: ["CARGANDO", "EN_RUTA", "EN_OBRA"] } } }),
  ]);

  return (
    <div className="space-y-6">
      {denegado && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          Tu rol no tiene acceso a esa sección.
        </p>
      )}
      <div>
        <h1 className="text-2xl font-semibold">Hola, {usuario.nombre}</h1>
        <p className="text-sm text-stone-500">Rol: {ROL_ETIQUETA[usuario.rol]}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Indicador titulo="Clientes activos" valor={clientes} />
        <Indicador titulo="Pedidos abiertos" valor={pedidosAbiertos} />
        <Indicador titulo="Despachos en curso" valor={despachosActivos} />
      </div>
      <div className="flex flex-wrap gap-2">
        {seccionesPara(usuario.rol)
          .filter((s) => s.href !== "/inicio")
          .map((s) => (
            <Link key={s.href} href={s.href} className="btn-secondary">
              {s.titulo}
            </Link>
          ))}
      </div>
    </div>
  );
}

function Indicador({ titulo, valor }: { titulo: string; valor: number }) {
  return (
    <div className="card">
      <p className="text-sm text-stone-500">{titulo}</p>
      <p className="text-3xl font-semibold">{valor}</p>
    </div>
  );
}
