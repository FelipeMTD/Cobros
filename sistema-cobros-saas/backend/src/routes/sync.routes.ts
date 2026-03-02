// backend/src/routes/sync.routes.ts
import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// 📥 GET /api/sync/pull -> Descargar datos nuevos desde el servidor al celular
router.get('/pull', verificarToken, async (req: Request, res: Response): Promise<any> => {
  try {
    const user = (req as any).user; // Obtenemos al usuario (puede ser ADMIN o PRESTAMISTA)
    
    const lastSyncStr = req.query.lastSync as string;
    const lastSync = lastSyncStr ? new Date(lastSyncStr) : new Date(0); 

    // 🚨 MAGIA DE RUTAS: Filtramos dependiendo de quién pide los datos
    const customerFilter: any = {
      tenantId: user.tenantId,
      updatedAt: { gt: lastSync }
    };
    
    // Si es un prestamista, SOLO le mandamos sus clientes asignados
    if (user.role === 'PRESTAMISTA') {
      customerFilter.assignedToId = user.userId;
    }

    const clientesNuevos = await prisma.customer.findMany({ where: customerFilter });

    // Extraemos solo los IDs de esos clientes permitidos
    const customerIds = clientesNuevos.map(c => c.id);

    // Mandamos solo las deudas de esos clientes permitidos
    const cobrosNuevos = await prisma.debt.findMany({
      where: { 
        tenantId: user.tenantId, 
        customerId: { in: customerIds },
        updatedAt: { gt: lastSync } 
      }
    });

    const configuracion = await prisma.configuracionEmpresa.findUnique({
      where: { tenantId: user.tenantId }
    });

    res.json({
      timestamp: new Date(),
      data: { customers: clientesNuevos, debts: cobrosNuevos, config: configuracion }
    });
  } catch (error) {
    console.error("Error en PULL:", error);
    res.status(500).json({ error: "Error al descargar datos" });
  }
});

// 📤 POST /api/sync/push -> Subir datos locales del celular al servidor
router.post('/push', verificarToken, async (req: Request, res: Response): Promise<any> => {
  try {
    const tenantId = (req as any).user.tenantId;
    const { customers, debts } = req.body;

    // MAGIA: Usamos una Transacción. Si un solo dato falla, se cancela todo el proceso.
    await prisma.$transaction(async (tx) => {
      
      // 1. Guardar Clientes nuevos (Upsert: Si existe lo actualiza, si no, lo crea)
      if (customers && customers.length > 0) {
        for (const c of customers) {
          await tx.customer.upsert({
            where: { id: c.id },
            update: { name: c.name, phone: c.phone, email: c.email },
            create: { id: c.id, name: c.name, phone: c.phone, email: c.email, tenantId }
          });
        }
      }

      // 2. Guardar Cobros o Pagos hechos en la calle
      if (debts && debts.length > 0) {
        for (const d of debts) {
          await tx.debt.upsert({
            where: { id: d.id },
            // Si el cobrador le dio "Pagar" offline, actualizamos el status aquí
            update: { status: d.status, amount: d.amount, description: d.description }, 
            create: { 
              id: d.id, 
              description: d.description, 
              amount: d.amount, 
              status: d.status, 
              dueDate: d.dueDate, 
              customerId: d.customerId, 
              tenantId 
            }
          });
        }
      }
    });

    res.json({ message: "✅ Sincronización exitosa. La nube ha sido actualizada." });
  } catch (error) {
    console.error("Error en PUSH:", error);
    res.status(500).json({ error: "Error al subir datos al servidor" });
  }
});

export default router;