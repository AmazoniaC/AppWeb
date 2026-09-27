import { LoginForm } from "./login-form";

export const metadata = { title: "Ingresar · Amazonia Concrete" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { desde } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-100 px-4">
      <div className="w-full max-w-sm rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-stone-900">Amazonia Concrete</h1>
        <p className="mb-6 text-sm text-stone-500">Ingresa con tu cuenta del ERP</p>
        <LoginForm desde={typeof desde === "string" ? desde : undefined} />
      </div>
    </main>
  );
}
