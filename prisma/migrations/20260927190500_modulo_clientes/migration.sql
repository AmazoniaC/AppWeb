-- CreateEnum
CREATE TYPE "TipoPersona" AS ENUM ('NATURAL', 'JURIDICA');

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('NIT', 'CC', 'CE', 'PASAPORTE');

-- CreateEnum
CREATE TYPE "EstadoCliente" AS ENUM ('PROSPECTO', 'ACTIVO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "TipoSeguimiento" AS ENUM ('LLAMADA', 'WHATSAPP', 'VISITA', 'CORREO', 'REUNION', 'NOTA');

-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "asesor_id" TEXT,
ADD COLUMN     "ciudad" TEXT,
ADD COLUMN     "contacto_cargo" TEXT,
ADD COLUMN     "contacto_nombre" TEXT,
ADD COLUMN     "cupo_credito" DECIMAL(14,2),
ADD COLUMN     "estado" "EstadoCliente" NOT NULL DEFAULT 'ACTIVO',
ADD COLUMN     "nombre_comercial" TEXT,
ADD COLUMN     "notas" TEXT,
ADD COLUMN     "plazo_pago_dias" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tipo_documento" "TipoDocumento" NOT NULL DEFAULT 'NIT',
ADD COLUMN     "tipo_persona" "TipoPersona" NOT NULL DEFAULT 'JURIDICA',
ADD COLUMN     "whatsapp" TEXT;

-- Conserva los clientes que estaban desactivados antes de quitar "activo".
UPDATE "clientes" SET "estado" = 'INACTIVO' WHERE "activo" = false;
ALTER TABLE "clientes" DROP COLUMN "activo";

-- CreateTable
CREATE TABLE "seguimientos" (
    "id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "tipo" "TipoSeguimiento" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "proxima_accion" TEXT,
    "proxima_fecha" TIMESTAMP(3),
    "completado_en" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seguimientos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "seguimientos_cliente_id_creado_en_idx" ON "seguimientos"("cliente_id", "creado_en");

-- CreateIndex
CREATE INDEX "seguimientos_proxima_fecha_idx" ON "seguimientos"("proxima_fecha");

-- CreateIndex
CREATE INDEX "clientes_estado_idx" ON "clientes"("estado");

-- CreateIndex
CREATE INDEX "clientes_asesor_id_idx" ON "clientes"("asesor_id");

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_asesor_id_fkey" FOREIGN KEY ("asesor_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seguimientos" ADD CONSTRAINT "seguimientos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seguimientos" ADD CONSTRAINT "seguimientos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

