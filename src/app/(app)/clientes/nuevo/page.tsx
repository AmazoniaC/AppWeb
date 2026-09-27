import { Encabezado } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { asesoresDisponibles } from "@/lib/clientes-datos";
import { ClienteForm } from "../cliente-form";

export const metadata = { title: "Nuevo cliente · Amazonia Concrete" };

export default async function NuevoClientePage() {
  const usuario = await requireRole("ADMIN", "VENTAS");
  const asesores = await asesoresDisponibles();

  return (
    <div className="max-w-4xl space-y-6">
      <Encabezado titulo="Nuevo cliente" volver={{ href: "/clientes", texto: "Clientes" }} />
      <ClienteForm cliente={{ asesorId: usuario.id }} asesores={asesores} cancelarHref="/clientes" />
    </div>
  );
}
