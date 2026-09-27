"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  ESTADO_CLIENTE_ETIQUETA,
  ESTADOS_CLIENTE,
  TIPO_DOCUMENTO_ETIQUETA,
  TIPO_PERSONA_ETIQUETA,
  TIPOS_DOCUMENTO,
  TIPOS_PERSONA,
} from "@/lib/clientes";
import { guardarCliente } from "./actions";

export type ClienteValores = Partial<Record<string, string>>;

export function ClienteForm({
  cliente,
  asesores,
  cancelarHref,
}: {
  cliente?: ClienteValores; // Valores iniciales al editar (incluye id)
  asesores: { id: string; nombre: string }[];
  cancelarHref: string;
}) {
  const [state, action, pending] = useActionState(guardarCliente, undefined);
  // Tras un error se vuelve a montar el formulario con lo que se había escrito.
  const v: ClienteValores = state?.valores ?? cliente ?? {};

  return (
    <form key={state?.intento ?? "inicial"} action={action} className="space-y-6">
      {v.id && <input type="hidden" name="id" value={v.id} />}

      <fieldset className="card grid gap-4 sm:grid-cols-2">
        <legend className="float-left mb-1 w-full font-semibold text-stone-800 sm:col-span-full">Identificación</legend>
        <Campo etiqueta="Tipo de persona">
          <select name="tipoPersona" defaultValue={v.tipoPersona ?? "JURIDICA"} className="input">
            {TIPOS_PERSONA.map((t) => (
              <option key={t} value={t}>
                {TIPO_PERSONA_ETIQUETA[t]}
              </option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta="Estado">
          <select name="estado" defaultValue={v.estado ?? "ACTIVO"} className="input">
            {ESTADOS_CLIENTE.map((e) => (
              <option key={e} value={e}>
                {ESTADO_CLIENTE_ETIQUETA[e]}
              </option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta="Tipo de documento">
          <select name="tipoDocumento" defaultValue={v.tipoDocumento ?? "NIT"} className="input">
            {TIPOS_DOCUMENTO.map((t) => (
              <option key={t} value={t}>
                {TIPO_DOCUMENTO_ETIQUETA[t]}
              </option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta="Número de documento *">
          <input name="documento" defaultValue={v.documento} required placeholder="900123456-7" className="input" />
        </Campo>
        <Campo etiqueta="Nombre o razón social *">
          <input name="nombre" defaultValue={v.nombre} required className="input" />
        </Campo>
        <Campo etiqueta="Nombre comercial">
          <input name="nombreComercial" defaultValue={v.nombreComercial} className="input" />
        </Campo>
      </fieldset>

      <fieldset className="card grid gap-4 sm:grid-cols-2">
        <legend className="float-left mb-1 w-full font-semibold text-stone-800 sm:col-span-full">Contacto</legend>
        <Campo etiqueta="Persona de contacto">
          <input name="contactoNombre" defaultValue={v.contactoNombre} className="input" />
        </Campo>
        <Campo etiqueta="Cargo del contacto">
          <input name="contactoCargo" defaultValue={v.contactoCargo} placeholder="Residente de obra" className="input" />
        </Campo>
        <Campo etiqueta="Celular / WhatsApp" ayuda="Ej. 310 123 4567. Se usa para el botón de WhatsApp.">
          <input name="whatsapp" type="tel" defaultValue={v.whatsapp} className="input" />
        </Campo>
        <Campo etiqueta="Otro teléfono">
          <input name="telefono" type="tel" defaultValue={v.telefono} className="input" />
        </Campo>
        <Campo etiqueta="Correo">
          <input name="email" type="email" defaultValue={v.email} className="input" />
        </Campo>
        <Campo etiqueta="Ciudad">
          <input name="ciudad" defaultValue={v.ciudad} className="input" />
        </Campo>
        <div className="sm:col-span-2">
          <Campo etiqueta="Dirección">
            <input name="direccion" defaultValue={v.direccion} className="input" />
          </Campo>
        </div>
      </fieldset>

      <fieldset className="card grid gap-4 sm:grid-cols-3">
        <legend className="float-left mb-1 w-full font-semibold text-stone-800 sm:col-span-full">Comercial</legend>
        <Campo etiqueta="Asesor responsable">
          <select name="asesorId" defaultValue={v.asesorId ?? ""} className="input">
            <option value="">Sin asignar</option>
            {asesores.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta="Plazo de pago (días)" ayuda="0 = de contado">
          <input name="plazoPagoDias" type="number" min={0} max={365} defaultValue={v.plazoPagoDias ?? "0"} className="input" />
        </Campo>
        <Campo etiqueta="Cupo de crédito (COP)">
          <input name="cupoCredito" inputMode="numeric" defaultValue={v.cupoCredito} placeholder="Sin cupo" className="input" />
        </Campo>
        <div className="sm:col-span-3">
          <Campo etiqueta="Notas">
            <textarea name="notas" rows={3} defaultValue={v.notas} className="input" />
          </Campo>
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Guardando…" : "Guardar cliente"}
        </button>
        <Link href={cancelarHref} className="btn-secondary">
          Cancelar
        </Link>
        {state?.error && (
          <p role="alert" className="text-sm text-red-600">
            {state.error}
          </p>
        )}
      </div>
    </form>
  );
}

function Campo({ etiqueta, ayuda, children }: { etiqueta: string; ayuda?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{etiqueta}</span>
      {children}
      {ayuda && <span className="mt-1 block text-xs text-stone-500">{ayuda}</span>}
    </label>
  );
}
