# Amazonia Concrete · ERP

ERP web de Amazonia Concrete: ventas, planta, despachos y administración.

**Stack:** Next.js 16 (App Router) + TypeScript, PostgreSQL con Prisma 7, Tailwind CSS 4.
Sesiones propias firmadas con JWT (`jose`) en cookie `httpOnly`, contraseñas con `bcrypt`.

## Arrancar en local

**En Windows, con PostgreSQL ya instalado:** haz doble clic en `iniciar.bat`. La primera vez
te pide la contraseña del usuario `postgres`, crea el `.env`, la base de datos y los datos de
ejemplo, y abre la aplicación en el navegador. Las siguientes veces solo la arranca.

Si prefieres hacerlo paso a paso:

Requisitos: Node 20 o superior.

### 1. Base de datos (la forma más fácil: Neon, gratis y sin instalar nada)

1. Crea una cuenta en <https://neon.tech> (puedes entrar con Google).
2. Crea un proyecto (cualquier nombre, por ejemplo `amazonia-erp`; región: la más cercana).
3. En el panel, pulsa **Connect**, desactiva **Connection pooling** y copia la cadena de
   conexión. Se ve así: `postgresql://usuario:clave@ep-xxxx.aws.neon.tech/neondb?sslmode=require`

Si prefieres PostgreSQL en tu computador y tienes Docker: `docker compose up -d` y usa la
cadena que ya trae `.env.example`.

### 2. Archivo `.env`

Copia la plantilla (en Windows: `copy .env.example .env`; en Mac/Linux: `cp .env.example .env`),
abre `.env` y:

- En `DATABASE_URL` pega la cadena de Neon, entre comillas.
- En `SESSION_SECRET` escribe cualquier texto largo y aleatorio (32 caracteres o más).

### 3. Crear las tablas y arrancar

```bash
npm install          # también genera el cliente de Prisma
npm run db:migrate   # crea las tablas en la base de datos
npm run db:seed      # usuarios y datos de ejemplo
npm run dev          # abre http://localhost:3000
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
