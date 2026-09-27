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
