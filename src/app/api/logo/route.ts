import { prisma } from "@/lib/prisma";

// Logo de la empresa. Es público porque se muestra en la pantalla de ingreso.
export async function GET() {
  const config = await prisma.configuracion.findUnique({
    where: { id: "general" },
    select: { logo: true, logoTipo: true },
  });
  if (!config?.logo || !config.logoTipo) return new Response(null, { status: 404 });

  return new Response(config.logo, {
    headers: {
      "Content-Type": config.logoTipo,
      "X-Content-Type-Options": "nosniff",
      // La URL cambia (?v=) cada vez que se sube un logo nuevo.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
