"use client";

import { useActionState, useEffect, useRef } from "react";
import { ROL_ETIQUETA, ROLES } from "@/lib/roles";
import { crearUsuario } from "./actions";

export function NuevoUsuarioForm() {
  const [state, action, pending] = useActionState(crearUsuario, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="grid gap-3 sm:grid-cols-2">
      <input name="nombre" placeholder="Nombre" required className="input" />
      <input name="email" type="email" placeholder="Correo" required className="input" />
      <select name="rol" required defaultValue="" className="input">
        <option value="" disabled>
          Rol
        </option>
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {ROL_ETIQUETA[r]}
          </option>
        ))}
      </select>
      <input
        name="password"
        type="password"
        placeholder="Contraseña inicial"
        autoComplete="new-password"
        required
        minLength={8}
        className="input"
      />
      <div className="flex items-center gap-3 sm:col-span-2">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Creando…" : "Crear usuario"}
        </button>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state?.ok && <p className="text-sm text-green-700">Usuario creado.</p>}
      </div>
    </form>
  );
}
