import { colorEstado, etiquetaEstado } from "@/lib/formato";

export function EstadoBadge({ estado }: { estado: string }) {
  return <span className={`badge ${colorEstado(estado)}`}>{etiquetaEstado(estado)}</span>;
}
