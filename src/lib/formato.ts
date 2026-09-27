const fecha = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeZone: "America/Bogota" });
const fechaHora = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Bogota",
});

export const formatoFecha = (d: Date) => fecha.format(d);
export const formatoFechaHora = (d: Date) => fechaHora.format(d);
export const formatoM3 = (v: { toString(): string }) => `${Number(v.toString()).toLocaleString("es-CO")} m³`;

export function etiquetaEstado(estado: string) {
  const texto = estado.replaceAll("_", " ").toLowerCase();
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// Color de la etiqueta de estado de pedidos y despachos.
const COLOR_ESTADO: Record<string, string> = {
  PENDIENTE: "bg-stone-100 text-stone-700",
  PROGRAMADO: "bg-stone-100 text-stone-700",
  CONFIRMADO: "bg-sky-100 text-sky-800",
  EN_PRODUCCION: "bg-amber-100 text-amber-800",
  CARGANDO: "bg-amber-100 text-amber-800",
  DESPACHADO: "bg-violet-100 text-violet-800",
  EN_RUTA: "bg-violet-100 text-violet-800",
  EN_OBRA: "bg-indigo-100 text-indigo-800",
  ENTREGADO: "bg-emerald-100 text-emerald-800",
  CANCELADO: "bg-red-100 text-red-700",
};
export const colorEstado = (estado: string) => COLOR_ESTADO[estado] ?? "bg-stone-100 text-stone-700";

const pesos = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
export const formatoPesos = (v: { toString(): string } | number) => pesos.format(Number(v.toString()));

// Colombia no tiene horario de verano: el día en Bogotá siempre empieza a las 05:00 UTC.
const diaBogota = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" });
export const hoyBogota = () => diaBogota.format(new Date()); // "AAAA-MM-DD"
export const fechaDesdeInput = (valor: string) => new Date(`${valor}T00:00:00-05:00`);
export function inicioDelDia(diasDesdeHoy = 0) {
  const d = fechaDesdeInput(hoyBogota());
  d.setUTCDate(d.getUTCDate() + diasDesdeHoy);
  return d;
}
export const fechaParaInput = (d: Date) => diaBogota.format(d);
