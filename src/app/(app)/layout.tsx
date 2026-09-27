import { Nav } from "@/components/nav";
import { requireUser } from "@/lib/auth";
import { ROL_ETIQUETA, seccionesPara } from "@/lib/roles";
import { logout } from "@/app/login/actions";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const usuario = await requireUser();
  const secciones = seccionesPara(usuario.rol).map(({ href, titulo }) => ({ href, titulo }));

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="border-b border-stone-200 bg-white p-4 md:w-60 md:border-b-0 md:border-r">
        <div className="mb-4">
          <p className="font-semibold">Amazonia Concrete</p>
          <p className="text-xs text-stone-500">
            {usuario.nombre} · {ROL_ETIQUETA[usuario.rol]}
          </p>
        </div>
        <Nav secciones={secciones} />
        <form action={logout} className="mt-4">
          <button type="submit" className="btn-secondary w-full">
            Cerrar sesión
          </button>
        </form>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
