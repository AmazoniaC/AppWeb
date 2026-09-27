import { Marca } from "@/components/marca";
import { LoginForm } from "./login-form";

export const metadata = { title: "Ingresar · Amazonia Concrete" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { desde } = await searchParams;

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Panel de marca: solo en pantallas grandes */}
      <section className="relative hidden overflow-hidden bg-stone-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -top-32 -right-32 size-96 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 size-96 rounded-full bg-orange-600/20 blur-3xl" />
        <p className="relative text-sm font-medium tracking-[0.3em] text-amber-400 uppercase">ERP</p>
        <div className="relative space-y-4">
          <h2 className="text-4xl leading-tight font-bold tracking-tight">
            Concreto de calidad,
            <br />
            operación en orden.
          </h2>
          <p className="max-w-md text-stone-400">
            Clientes, pedidos, producción y despachos de Amazonia Concrete en un solo lugar.
          </p>
        </div>
        <p className="relative text-xs text-stone-500">© {new Date().getFullYear()} Amazonia Concrete</p>
      </section>

      <section className="flex items-center justify-center bg-stone-100 px-4 py-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="flex justify-center">
            <Marca tamano="grande" />
          </div>
          <div className="card space-y-6 p-8 shadow-lg shadow-stone-900/5">
            <div className="space-y-1 text-center">
              <h1 className="text-xl font-bold tracking-tight">Bienvenido</h1>
              <p className="text-sm text-stone-500">Ingresa con tu cuenta del ERP</p>
            </div>
            <LoginForm desde={typeof desde === "string" ? desde : undefined} />
          </div>
        </div>
      </section>
    </main>
  );
}
