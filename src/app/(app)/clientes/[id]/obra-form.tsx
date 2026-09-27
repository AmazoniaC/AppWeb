"use client";

import { useActionState } from "react";
import { crearObra } from "../actions";

export function ObraForm({ clienteId, ciudad }: { clienteId: string; ciudad?: string }) {
  const [state, action, pending] = useActionState(crearObra, undefined);

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-3">
      <input type="hidden" name="clienteId" value={clienteId} />
      <input name="nombre" required placeholder="Nombre de la obra" className="input" />
      <input name="direccion" required placeholder="Dirección" className="input" />
      <input name="ciudad" defaultValue={ciudad} placeholder="Ciudad" className="input" />
      <input name="contacto" placeholder="Contacto en obra" className="input" />
      <input name="telefono" type="tel" placeholder="Teléfono en obra" className="input" />
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Agregando…" : "Agregar obra"}
        </button>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      </div>
    </form>
  );
}
