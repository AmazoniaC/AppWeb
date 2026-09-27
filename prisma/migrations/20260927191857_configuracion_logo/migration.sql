-- CreateTable
CREATE TABLE "configuracion" (
    "id" TEXT NOT NULL DEFAULT 'general',
    "logo" BYTEA,
    "logo_tipo" TEXT,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracion_pkey" PRIMARY KEY ("id")
);
