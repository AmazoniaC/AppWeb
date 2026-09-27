import { Nav } from "@/components/nav";
import { Icono } from "@/components/iconos";
import { Marca } from "@/components/marca";
import { Avatar } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { ROL_ETIQUETA, seccionesPara } from "@/lib/roles";
import { logout } from "@/app/login/actions";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const usuario = await requireUser();
  const secciones = seccionesPara(usuario.rol).map(({ href, titulo, icono }) => ({ href, titulo, icono }));

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="border-b border-stone-200 bg-white md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col md:border-r md:border-b-0">
        <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-5 md:py-6">
          <Marca />
          <form action={logout} className="md:hidden">
            <button type="submit" className="btn-secondary" aria-label="Cerrar sesión">
              <Icono nombre="salir" className="size-4" />
            </button>
          </form>
        </div>
        <div className="px-3 pb-3 md:flex-1 md:overflow-y-auto md:pb-0">
          <Nav secciones={secciones} />
        </div>
        <div className="hidden border-t border-stone-200 p-4 md:block">
          <div className="flex items-center gap-3">
            <Avatar nombre={usuario.nombre} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{usuario.nombre}</p>
              <p className="truncate text-xs text-stone-500">{ROL_ETIQUETA[usuario.rol]}</p>
            </div>
            <form action={logout}>
              <button
                type="submit"
                title="Cerrar sesión"
                className="grid size-9 place-items-center rounded-lg text-stone-500 transition hover:bg-stone-100 hover:text-red-600"
              >
                <Icono nombre="salir" />
                <span className="sr-only">Cerrar sesión</span>
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-7xl p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
