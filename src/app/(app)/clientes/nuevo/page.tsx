import { requireRole } from "@/lib/auth";
import { asesoresDisponibles } from "@/lib/clientes-datos";
import { ClienteForm } from "../cliente-form";

export const metadata = { title: "Nuevo cliente · Amazonia Concrete" };

export default async function NuevoClientePage() {
  const usuario = await requireRole("ADMIN", "VENTAS");
  const asesores = await asesoresDisponibles();

  return (
    <div className="max-w-4xl space-y-4">
      <h1 className="text-2xl font-semibold">Nuevo cliente</h1>
      <ClienteForm cliente={{ asesorId: usuario.id }} asesores={asesores} cancelarHref="/clientes" />
    </div>
  );
}
