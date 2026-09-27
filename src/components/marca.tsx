import { NOMBRE_EMPRESA, urlLogo } from "@/lib/marca";

// Logo de la empresa si se subió uno; si no, un distintivo con las iniciales.
export async function Marca({ tamano = "normal" }: { tamano?: "normal" | "grande" }) {
  const logo = await urlLogo();
  const grande = tamano === "grande";

  if (logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- imagen servida por /api/logo, tamaño variable
      <img
        src={logo}
        alt={NOMBRE_EMPRESA}
        className={`object-contain ${grande ? "max-h-28 max-w-64" : "max-h-12 max-w-44"}`}
      />
    );
  }

  return (
    <span className="flex items-center gap-3">
      <span
        className={`grid place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 font-black text-white shadow-sm ${
          grande ? "size-16 text-2xl" : "size-10 text-base"
        }`}
      >
        AC
      </span>
      <span className="leading-tight">
        <span className={`block font-bold tracking-tight ${grande ? "text-2xl" : "text-base"}`}>Amazonia</span>
        <span className={`block font-medium tracking-[0.2em] uppercase opacity-70 ${grande ? "text-sm" : "text-[10px]"}`}>
          Concrete
        </span>
      </span>
    </span>
  );
}
