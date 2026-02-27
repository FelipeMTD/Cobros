-- CreateTable
CREATE TABLE "ConfiguracionEmpresa" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "tasaInteres" DOUBLE PRECISION NOT NULL DEFAULT 20.0,
    "limiteCreditos" INTEGER NOT NULL DEFAULT 2,
    "cobrarMora" BOOLEAN NOT NULL DEFAULT true,
    "excluirDomingos" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfiguracionEmpresa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConfiguracionEmpresa_tenantId_key" ON "ConfiguracionEmpresa"("tenantId");

-- AddForeignKey
ALTER TABLE "ConfiguracionEmpresa" ADD CONSTRAINT "ConfiguracionEmpresa_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
