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
