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
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Usuarios</h1>
      <section className="card">
        <h2 className="mb-3 font-medium">Nuevo usuario</h2>
        <NuevoUsuarioForm />
      </section>
      <section className="card overflow-x-auto">
        <table className="tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className={u.activo ? "" : "text-stone-400"}>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td>{ROL_ETIQUETA[u.rol]}</td>
                <td>{u.activo ? "Activo" : "Inactivo"}</td>
                <td className="text-right">
                  {u.id !== admin.id && (
                    <form action={cambiarEstadoUsuario}>
                      <input type="hidden" name="id" value={u.id} />
                      <button type="submit" className="btn-secondary">
                        {u.activo ? "Desactivar" : "Activar"}
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
