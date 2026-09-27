import { Marca } from "@/components/marca";
import { Encabezado, Tarjeta } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { urlLogo } from "@/lib/marca";
import { quitarLogo } from "./actions";
import { LogoForm } from "./logo-form";

export const metadata = { title: "Configuración · Amazonia Concrete" };

export default async function ConfiguracionPage() {
  await requireRole("ADMIN");
  const logo = await urlLogo();

  return (
    <div className="space-y-6">
      <Encabezado titulo="Configuración" descripcion="Personaliza cómo se ve el ERP para todo el equipo." />

      <Tarjeta titulo="Logo de la empresa" icono="foto">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <p className="etiqueta">Así se ve ahora</p>
            <div className="grid min-h-40 place-items-center rounded-xl border border-stone-200 bg-[repeating-conic-gradient(#f5f5f4_0_25%,#fff_0_50%)] bg-[length:20px_20px] p-6">
              <Marca tamano="grande" />
            </div>
            <p className="text-xs text-stone-500">
              Aparece en la pantalla de inicio de sesión y en el menú lateral.
              {!logo && " Mientras no subas uno, se muestran las iniciales de la empresa."}
            </p>
            {logo && (
              <form action={quitarLogo}>
                <button type="submit" className="btn-peligro">
                  Quitar logo
                </button>
              </form>
            )}
          </div>
          <LogoForm />
        </div>
      </Tarjeta>
    </div>
  );
}
