"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Nav({ secciones }: { secciones: { href: string; titulo: string }[] }) {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col">
      {secciones.map((s) => {
        const activa = pathname === s.href || pathname.startsWith(`${s.href}/`);
        return (
          <Link
            key={s.href}
            href={s.href}
            className={`whitespace-nowrap rounded-md px-3 py-2 text-sm ${
              activa ? "bg-amber-100 font-medium text-amber-900" : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            {s.titulo}
          </Link>
        );
      })}
    </nav>
  );
}
