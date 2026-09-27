// Etiquetas del módulo de clientes. Sin imports de servidor: se usa también en
// componentes de cliente.
import type {
  EstadoCliente,
  TipoDocumento,
  TipoPersona,
  TipoSeguimiento,
} from "@/generated/prisma/enums";

export const ESTADOS_CLIENTE = ["PROSPECTO", "ACTIVO", "INACTIVO"] as const satisfies readonly EstadoCliente[];
export const ESTADO_CLIENTE_ETIQUETA: Record<EstadoCliente, string> = {
  PROSPECTO: "Prospecto",
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
};
export const ESTADO_CLIENTE_COLOR: Record<EstadoCliente, string> = {
  PROSPECTO: "bg-sky-100 text-sky-800",
  ACTIVO: "bg-green-100 text-green-800",
  INACTIVO: "bg-stone-200 text-stone-600",
};

export const TIPOS_PERSONA = ["JURIDICA", "NATURAL"] as const satisfies readonly TipoPersona[];
export const TIPO_PERSONA_ETIQUETA: Record<TipoPersona, string> = {
  JURIDICA: "Empresa (persona jurídica)",
  NATURAL: "Persona natural",
};

export const TIPOS_DOCUMENTO = ["NIT", "CC", "CE", "PASAPORTE"] as const satisfies readonly TipoDocumento[];
export const TIPO_DOCUMENTO_ETIQUETA: Record<TipoDocumento, string> = {
  NIT: "NIT",
  CC: "Cédula de ciudadanía",
  CE: "Cédula de extranjería",
  PASAPORTE: "Pasaporte",
};

export const TIPOS_SEGUIMIENTO = [
  "LLAMADA",
  "WHATSAPP",
  "VISITA",
  "CORREO",
  "REUNION",
  "NOTA",
] as const satisfies readonly TipoSeguimiento[];
export const TIPO_SEGUIMIENTO_ETIQUETA: Record<TipoSeguimiento, string> = {
  LLAMADA: "Llamada",
  WHATSAPP: "WhatsApp",
  VISITA: "Visita",
  CORREO: "Correo",
  REUNION: "Reunión",
  NOTA: "Nota",
};

export const plazoPagoTexto = (dias: number) => (dias === 0 ? "Contado" : `Crédito a ${dias} días`);
