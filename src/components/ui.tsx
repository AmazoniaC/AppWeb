import Link from "next/link";
import { Icono, type NombreIcono } from "@/components/iconos";

// Piezas visuales comunes: encabezado de página, tarjetas e indicadores.

export function Encabezado({
  titulo,
  descripcion,
  volver,
  children,
}: {
  titulo: React.ReactNode;
  descripcion?: React.ReactNode;
  volver?: { href: string; texto: string };
  children?: React.ReactNode; // Botones a la derecha
}) {
  return (
    <header className="space-y-1">
      {volver && (
        <Link
          href={volver.href}
          className="inline-flex items-center gap-1 text-sm text-stone-500 transition hover:text-amber-700"
        >
          <Icono nombre="volver" className="size-4" />
          {volver.texto}
        </Link>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 md:text-3xl">{titulo}</h1>
          {descripcion && <p className="mt-1 text-sm text-stone-500">{descripcion}</p>}
        </div>
        {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
      </div>
    </header>
  );
}

export function Tarjeta({
  titulo,
  icono,
  acciones,
  className = "",
  children,
}: {
  titulo?: React.ReactNode;
  icono?: NombreIcono;
  acciones?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`card ${className}`}>
      {titulo && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-semibold text-stone-800">
            {icono && (
              <span className="grid size-8 place-items-center rounded-lg bg-amber-50 text-amber-700">
                <Icono nombre={icono} className="size-4.5" />
              </span>
            )}
            {titulo}
          </h2>
          {acciones}
        </div>
      )}
      {children}
    </section>
  );
}

const TONOS = {
  ambar: "bg-amber-50 text-amber-700",
  verde: "bg-emerald-50 text-emerald-700",
  azul: "bg-sky-50 text-sky-700",
  violeta: "bg-violet-50 text-violet-700",
  piedra: "bg-stone-100 text-stone-600",
} as const;

export type Tono = keyof typeof TONOS;

export function Indicador({
  titulo,
  valor,
  icono,
  tono = "ambar",
  detalle,
}: {
  titulo: string;
  valor: React.ReactNode;
  icono: NombreIcono;
  tono?: Tono;
  detalle?: string;
}) {
  return (
    <div className="card flex items-start gap-4">
      <span className={`grid size-11 place-items-center rounded-xl ${TONOS[tono]}`}>
        <Icono nombre={icono} className="size-6" />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-stone-500">{titulo}</p>
        <p className="text-xl font-bold tracking-tight break-words text-stone-900 2xl:text-2xl">{valor}</p>
        {detalle && <p className="text-xs text-stone-400">{detalle}</p>}
      </div>
    </div>
  );
}

export function Vacio({ icono = "cubo", children }: { icono?: NombreIcono; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-stone-300 bg-stone-50/60 px-4 py-10 text-center text-sm text-stone-500">
      <Icono nombre={icono} className="size-8 text-stone-300" />
      {children}
    </div>
  );
}

// Dato con título pequeño arriba, para fichas.
export function Dato({ titulo, valor }: { titulo: string; valor: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="etiqueta">{titulo}</dt>
      <dd className="mt-0.5 break-words text-sm text-stone-800">{valor ?? "—"}</dd>
    </div>
  );
}

export function Avatar({ nombre, className = "size-10 text-sm" }: { nombre: string; className?: string }) {
  const iniciales = nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-600 font-semibold text-white ${className}`}
    >
      {iniciales}
    </span>
  );
}
