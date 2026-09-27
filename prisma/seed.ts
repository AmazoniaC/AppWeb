// Datos de ejemplo para desarrollo: un usuario por rol y un pedido con despacho.
// Ejecutar con: npx prisma db seed
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

if (!process.env.DATABASE_URL) {
  console.error("Falta DATABASE_URL. Copia .env.example a .env y pon ahí la conexión a tu base de datos (ver README).");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const PASSWORD_DEMO = "Amazonia2026!";

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD_DEMO, 10);

  const usuarios = {
    admin: { email: "admin@amazonia.local", nombre: "Administrador", rol: "ADMIN" },
    ventas: { email: "ventas@amazonia.local", nombre: "Laura Ventas", rol: "VENTAS" },
    planta: { email: "planta@amazonia.local", nombre: "Carlos Planta", rol: "PLANTA" },
    conductor: { email: "conductor@amazonia.local", nombre: "Pedro Conductor", rol: "CONDUCTOR" },
  } as const;

  const creados = Object.fromEntries(
    await Promise.all(
      Object.entries(usuarios).map(async ([clave, u]) => [
        clave,
        await prisma.usuario.upsert({
          where: { email: u.email },
          update: {},
          create: { ...u, passwordHash },
        }),
      ]),
    ),
  ) as Record<keyof typeof usuarios, { id: string }>;

  const cliente = await prisma.cliente.upsert({
    where: { documento: "900123456-7" },
    update: {},
    create: {
      nombre: "Constructora Ejemplo S.A.S.",
      documento: "900123456-7",
      telefono: "6085920000",
      whatsapp: "3001234567",
      ciudad: "Leticia",
      contactoNombre: "Andrea Gómez",
      contactoCargo: "Residente de obra",
      plazoPagoDias: 30,
      asesorId: creados.ventas.id,
    },
  });

  if ((await prisma.seguimiento.count({ where: { clienteId: cliente.id } })) === 0) {
    await prisma.seguimiento.create({
      data: {
        clienteId: cliente.id,
        usuarioId: creados.ventas.id,
        tipo: "LLAMADA",
        descripcion: "Pidió cotización para la losa del segundo piso.",
        proximaAccion: "Enviar cotización",
        proximaFecha: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
    });
  }

  let obra = await prisma.obra.findFirst({ where: { clienteId: cliente.id } });
  obra ??= await prisma.obra.create({
    data: { clienteId: cliente.id, nombre: "Edificio Las Palmas", direccion: "Calle 10 # 20-30", ciudad: "Leticia" },
  });

  const producto = await prisma.producto.upsert({
    where: { codigo: "C3000" },
    update: {},
    create: { codigo: "C3000", nombre: "Concreto 3000 psi", resistenciaPsi: 3000, asentamientoCm: 10, precioM3: 420000 },
  });
  await prisma.producto.upsert({
    where: { codigo: "C4000" },
    update: {},
    create: { codigo: "C4000", nombre: "Concreto 4000 psi", resistenciaPsi: 4000, asentamientoCm: 10, precioM3: 480000 },
  });

  const vehiculo = await prisma.vehiculo.upsert({
    where: { placa: "ABC123" },
    update: {},
    create: { placa: "ABC123", descripcion: "Mixer 8 m³", capacidadM3: 8, conductorAsignadoId: creados.conductor.id },
  });

  if ((await prisma.pedido.count()) === 0) {
    const manana = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const pedido = await prisma.pedido.create({
      data: {
        clienteId: cliente.id,
        obraId: obra.id,
        productoId: producto.id,
        volumenM3: 16,
        precioM3: producto.precioM3,
        fechaEntrega: manana,
        estado: "CONFIRMADO",
        creadoPorId: creados.ventas.id,
      },
    });
    await prisma.despacho.create({
      data: { pedidoId: pedido.id, vehiculoId: vehiculo.id, conductorId: creados.conductor.id, volumenM3: 8 },
    });
  }

  console.log(`Seed listo. Usuarios de prueba (contraseña ${PASSWORD_DEMO}):`);
  for (const u of Object.values(usuarios)) console.log(`  ${u.rol.padEnd(10)} ${u.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
