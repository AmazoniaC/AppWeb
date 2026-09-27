// Enlaces "click to chat" de WhatsApp (wa.me). No requieren cuenta de
// WhatsApp Business API: abren el chat con el mensaje escrito y la persona lo envía.

// Devuelve el número en formato internacional sin "+" (57XXXXXXXXXX) o null.
export function numeroWhatsapp(telefono: string | null | undefined) {
  const digitos = (telefono ?? "").replace(/\D/g, "");
  if (digitos.length === 10 && digitos.startsWith("3")) return `57${digitos}`; // celular colombiano
  if (digitos.length === 12 && digitos.startsWith("573")) return digitos;
  if (digitos.length >= 11 && !digitos.startsWith("0")) return digitos; // otro país con indicativo
  return null;
}

export function enlaceWhatsapp(numero: string, mensaje: string) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

export type PlantillaWhatsapp = { id: string; titulo: string; texto: string };

export function plantillasWhatsapp(datos: {
  contacto: string;
  asesor: string;
  pedido?: { numero: number; volumen: string; producto: string; obra: string; fecha: string };
}): PlantillaWhatsapp[] {
  const saludo = `Hola ${datos.contacto}, le saluda ${datos.asesor} de Amazonia Concrete.`;
  const plantillas: PlantillaWhatsapp[] = [
    { id: "saludo", titulo: "Saludo", texto: `${saludo} ` },
    {
      id: "cotizacion",
      titulo: "Seguimiento a cotización",
      texto: `${saludo} Quería saber si pudo revisar la cotización que le enviamos y si tiene alguna pregunta. Quedo atento(a).`,
    },
    {
      id: "necesidad",
      titulo: "Próximo vaciado",
      texto: `${saludo} ¿Tiene programado algún vaciado de concreto próximamente? Con gusto le cotizamos y le reservamos el despacho.`,
    },
    {
      id: "pago",
      titulo: "Recordatorio de pago",
      texto: `${saludo} Le recordamos amablemente que tiene un saldo pendiente con nosotros. ¿Nos confirma la fecha de pago? Muchas gracias.`,
    },
  ];
  if (datos.pedido) {
    const p = datos.pedido;
    plantillas.splice(1, 0, {
      id: "pedido",
      titulo: `Confirmar pedido #${p.numero}`,
      texto: `${saludo} Le confirmamos su pedido #${p.numero}: ${p.volumen} de ${p.producto} para la obra ${p.obra}, con entrega el ${p.fecha}. ¿Todo en orden?`,
    });
  }
  return plantillas;
}
