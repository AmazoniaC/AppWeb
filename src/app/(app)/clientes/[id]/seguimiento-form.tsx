"use client";

import { useActionState } from "react";
import { TIPO_SEGUIMIENTO_ETIQUETA, TIPOS_SEGUIMIENTO } from "@/lib/clientes";
import { registrarSeguimiento } from "../actions";

export function SeguimientoForm({ clienteId, hoy }: { clienteId: string; hoy: string }) {
  const [state, action, pending] = useActionState(registrarSeguimiento, undefined);

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-4">
      <input type="hidden" name="clienteId" value={clienteId} />
      <select name="tipo" defaultValue="LLAMADA" className="input" aria-label="Tipo de contacto">
        {TIPOS_SEGUIMIENTO.map((t) => (
          <option key={t} value={t}>
            {TIPO_SEGUIMIENTO_ETIQUETA[t]}
          </option>
        ))}
      </select>
      <textarea
        name="descripcion"
        required
        rows={2}
        placeholder="¿Qué se habló o qué pasó?"
        className="input sm:col-span-3"
      />
      <input
        name="proximaAccion"
        placeholder="Próxima acción (opcional), ej. Enviar cotización"
        className="input sm:col-span-2"
      />
      <input name="proximaFecha" type="date" min={hoy} className="input" aria-label="Fecha de la próxima acción" />
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Guardando…" : "Registrar"}
      </button>
      {state?.error && <p className="text-sm text-red-600 sm:col-span-4">{state.error}</p>}
    </form>
  );
}
