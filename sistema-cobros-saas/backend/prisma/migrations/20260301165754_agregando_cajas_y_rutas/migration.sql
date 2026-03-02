-- AlterTable
ALTER TABLE "ConfiguracionEmpresa" ADD COLUMN     "excluirFestivos" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "assignedToId" TEXT;

-- CreateTable
CREATE TABLE "CajaGlobal" (
    "id" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tenantId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CajaGlobal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CajaMenor" (
    "id" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CajaMenor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CajaGlobal_tenantId_key" ON "CajaGlobal"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "CajaMenor_userId_key" ON "CajaMenor"("userId");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CajaGlobal" ADD CONSTRAINT "CajaGlobal_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CajaMenor" ADD CONSTRAINT "CajaMenor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CajaMenor" ADD CONSTRAINT "CajaMenor_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
