import { formatoFecha } from "@/lib/formato";

// Fecha de una tarea en rojo si está vencida, ámbar si es hoy.
export function FechaTarea({ fecha, manana }: { fecha: Date; manana: Date }) {
  const hoy = new Date(manana.getTime() - 24 * 60 * 60 * 1000);
  const clase = fecha < hoy ? "text-red-600 font-medium" : fecha < manana ? "text-amber-700 font-medium" : "text-stone-600";
  const texto = fecha < hoy ? `Vencido · ${formatoFecha(fecha)}` : fecha < manana ? "Hoy" : formatoFecha(fecha);
  return <span className={`whitespace-nowrap ${clase}`}>{texto}</span>;
}
