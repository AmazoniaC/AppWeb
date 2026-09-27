import { Encabezado } from "@/components/ui";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { asesoresDisponibles } from "@/lib/clientes-datos";
import { prisma } from "@/lib/prisma";
import { ClienteForm, type ClienteValores } from "../../cliente-form";

export const metadata = { title: "Editar cliente · Amazonia Concrete" };

export default async function EditarClientePage({ params }: PageProps<"/clientes/[id]/editar">) {
  await requireRole("ADMIN", "VENTAS");
  const { id } = await params;

  const cliente = await prisma.cliente.findUnique({ where: { id } });
  if (!cliente) notFound();
  const asesores = await asesoresDisponibles(cliente.asesorId);

  // El formulario solo necesita texto: se pasan los campos como strings.
  const valores: ClienteValores = Object.fromEntries(
    Object.entries(cliente)
      .filter(([, v]) => v !== null && !(v instanceof Date))
      .map(([k, v]) => [k, String(v)]),
  );

  return (
    <div className="max-w-4xl space-y-6">
      <Encabezado titulo={`Editar ${cliente.nombre}`} volver={{ href: `/clientes/${id}`, texto: cliente.nombre }} />
      <ClienteForm cliente={valores} asesores={asesores} cancelarHref={`/clientes/${id}`} />
    </div>
  );
}
