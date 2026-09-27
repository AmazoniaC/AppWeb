"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icono, type NombreIcono } from "@/components/iconos";

export function Nav({ secciones }: { secciones: { href: string; titulo: string; icono: NombreIcono }[] }) {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col">
      {secciones.map((s) => {
        const activa = pathname === s.href || pathname.startsWith(`${s.href}/`);
        return (
          <Link
            key={s.href}
            href={s.href}
            className={`flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition ${
              activa
                ? "bg-amber-50 font-semibold text-amber-800 ring-1 ring-amber-200"
                : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            }`}
          >
            <Icono nombre={s.icono} className={`size-5 ${activa ? "text-amber-600" : "text-stone-400"}`} />
            {s.titulo}
          </Link>
        );
      })}
    </nav>
  );
}
