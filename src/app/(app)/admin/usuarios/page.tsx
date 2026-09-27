import { Avatar, Encabezado, Tarjeta } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROL_ETIQUETA } from "@/lib/roles";
import { cambiarEstadoUsuario } from "./actions";
import { NuevoUsuarioForm } from "./nuevo-usuario-form";

export const metadata = { title: "Usuarios · Amazonia Concrete" };

export default async function UsuariosPage() {
  const admin = await requireRole("ADMIN");
  const usuarios = await prisma.usuario.findMany({
    orderBy: [{ activo: "desc" }, { nombre: "asc" }],
    select: { id: true, nombre: true, email: true, rol: true, activo: true },
  });

  return (
    <div className="space-y-6">
      <Encabezado titulo="Usuarios" descripcion="Cuentas del equipo y el rol de cada persona." />

      <Tarjeta titulo="Nuevo usuario" icono="mas">
        <NuevoUsuarioForm />
      </Tarjeta>

      <section className="space-y-3">
        <h2 className="font-semibold text-stone-800">Equipo ({usuarios.length})</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {usuarios.map((u) => (
            <div key={u.id} className={`card flex items-center gap-4 ${u.activo ? "" : "opacity-60"}`}>
              <Avatar nombre={u.nombre} className="size-12 text-base" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{u.nombre}</p>
                <p className="truncate text-sm text-stone-500">{u.email}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <span className="badge bg-amber-50 text-amber-800">{ROL_ETIQUETA[u.rol]}</span>
                  <span className={`badge ${u.activo ? "bg-emerald-50 text-emerald-700" : "bg-stone-200 text-stone-600"}`}>
                    {u.activo ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
              {u.id !== admin.id && (
                <form action={cambiarEstadoUsuario}>
                  <input type="hidden" name="id" value={u.id} />
                  <button type="submit" className={u.activo ? "btn-peligro text-xs" : "btn-secondary text-xs"}>
                    {u.activo ? "Desactivar" : "Activar"}
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
