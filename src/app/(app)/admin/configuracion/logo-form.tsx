"use client";

import { useActionState, useEffect, useState } from "react";
import { Icono } from "@/components/iconos";
import { subirLogo } from "./actions";

export function LogoForm() {
  const [state, action, pending] = useActionState(subirLogo, undefined);

  return (
    <form action={action} className="space-y-3">
      <p className="etiqueta">Subir un logo nuevo</p>
      <SelectorLogo key={state?.intento ?? 0} pending={pending} />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.guardado && <p className="text-sm text-emerald-700">Logo actualizado.</p>}
    </form>
  );
}

function SelectorLogo({ pending }: { pending: boolean }) {
  const [vista, setVista] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (vista) URL.revokeObjectURL(vista);
    },
    [vista],
  );

  return (
    <>
      <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 p-6 text-center transition hover:border-amber-400 hover:bg-amber-50/40">
        {vista ? (
          // eslint-disable-next-line @next/next/no-img-element -- vista previa local del archivo elegido
          <img src={vista} alt="Vista previa del logo" className="max-h-28 max-w-64 object-contain" />
        ) : (
          <>
            <Icono nombre="subir" className="size-8 text-stone-400" />
            <span className="text-sm font-medium text-stone-700">Haz clic para elegir la imagen</span>
            <span className="text-xs text-stone-500">PNG, JPG o WEBP, máximo 2 MB. Mejor con fondo transparente.</span>
          </>
        )}
        <input
          type="file"
          name="logo"
          accept="image/png,image/jpeg,image/webp"
          required
          className="sr-only"
          onChange={(e) => {
            const archivo = e.target.files?.[0];
            setVista(archivo ? URL.createObjectURL(archivo) : null);
          }}
        />
      </label>
      <button type="submit" disabled={pending || !vista} className="btn-primary">
        <Icono nombre="subir" className="size-4" />
        {pending ? "Subiendo…" : "Guardar logo"}
      </button>
    </>
  );
}
