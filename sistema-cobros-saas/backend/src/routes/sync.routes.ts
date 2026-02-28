// backend/src/routes/sync.routes.ts
import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// 📥 GET /api/sync/pull -> Descargar datos nuevos desde el servidor al celular
router.get('/pull', verificarToken, async (req: Request, res: Response): Promise<any> => {
  try {
    const tenantId = (req as any).user.tenantId;
    
    // Si el celular nos manda la fecha de su última sincronización, la usamos.
    // Si es su primera vez (o no manda nada), buscamos desde el inicio de los tiempos (1970).
    const lastSyncStr = req.query.lastSync as string;
    const lastSync = lastSyncStr ? new Date(lastSyncStr) : new Date(0); 

    // Buscamos solo lo que cambió DESPUÉS de esa fecha
    const clientesNuevos = await prisma.customer.findMany({
      where: { tenantId, updatedAt: { gt: lastSync } }
    });

    const cobrosNuevos = await prisma.debt.findMany({
      where: { tenantId, updatedAt: { gt: lastSync } }
    });

    const configuracion = await prisma.configuracionEmpresa.findUnique({
      where: { tenantId }
    });

    res.json({
      timestamp: new Date(), // El celular guardará esta hora exacta para la próxima vez
      data: {
        customers: clientesNuevos,
        debts: cobrosNuevos,
        config: configuracion
      }
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