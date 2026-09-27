# Amazonia Concrete · ERP

ERP web de Amazonia Concrete: ventas, planta, despachos y administración.

**Stack:** Next.js 16 (App Router) + TypeScript, PostgreSQL con Prisma 7, Tailwind CSS 4.
Sesiones propias firmadas con JWT (`jose`) en cookie `httpOnly`, contraseñas con `bcrypt`.

## Arrancar en local

Requisitos: Node 20+ y PostgreSQL 16 (o Docker).

```bash
cp .env.example .env          # y cambia SESSION_SECRET
docker compose up -d          # PostgreSQL local (si no tienes uno instalado)
npm install                   # también genera el cliente de Prisma
npm run db:migrate            # crea las tablas
npm run db:seed               # usuarios y datos de ejemplo
npm run dev                   # http://localhost:3000
```

Usuarios de prueba (contraseña `Amazonia2026!`):

| Rol        | Correo                      | Ve                                   |
| ---------- | --------------------------- | ------------------------------------ |
| Admin      | `admin@amazonia.local`      | Todo, incluida la gestión de usuarios |
| Ventas     | `ventas@amazonia.local`     | Inicio y Ventas                      |
| Planta     | `planta@amazonia.local`     | Inicio y Planta                      |
| Conductor  | `conductor@amazonia.local`  | Inicio y sus despachos               |

## Roles y permisos

Los permisos por sección están en un solo lugar: `SECCIONES` en `src/lib/roles.ts`.

- `src/proxy.ts` hace un chequeo rápido con la cookie y redirige al login o a Inicio.
- La verificación real está en `src/lib/auth.ts` (`requireUser`, `requireRole`), que cada
  página y acción de servidor llama. Consulta la base de datos, así que un usuario
  desactivado pierde el acceso aunque su cookie siga vigente.

## Modelo de datos

`prisma/schema.prisma`:

- **Usuario** con rol `ADMIN | VENTAS | PLANTA | CONDUCTOR`.
- **Cliente** → **Obra** (cada cliente tiene una o varias obras).
- **Producto**: diseño de mezcla (resistencia en psi, asentamiento, precio por m³).
- **Pedido**: cliente, obra, producto, volumen, fecha de entrega y estado.
- **Vehiculo**: mixer con capacidad y conductor asignado.
- **Despacho**: cada viaje de un mixer para un pedido (remisión), con su estado y horas.

## Scripts

| Script              | Qué hace                                  |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Servidor de desarrollo                    |
| `npm run build`     | Build de producción                       |
| `npm run typecheck` | Chequeo de tipos                          |
| `npm run lint`      | ESLint                                    |
| `npm run db:migrate`| Crea y aplica migraciones en desarrollo   |
| `npm run db:deploy` | Aplica migraciones en producción          |
| `npm run db:seed`   | Carga datos de ejemplo                    |
| `npm run db:studio` | Explorador visual de la base de datos     |
