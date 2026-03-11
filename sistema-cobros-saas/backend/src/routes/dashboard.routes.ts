// backend/src/routes/dashboard.routes.ts
import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', verificarToken, async (req: Request, res: Response): Promise<any> => {
  try {
    const user = (req as any).user;
    const tenantId = user.tenantId;

    // 👑 MÉTRICAS DEL JEFE (Ve toda la empresa)
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      const totalCustomers = await prisma.customer.count({ where: { tenantId } });
      
      const cajaGlobal = await prisma.cajaGlobal.findUnique({ where: { tenantId } });
      
      const pendingAggregation = await prisma.debt.aggregate({
        _sum: { amount: true, amountPaid: true }, 
        where: { tenantId, status: "PENDING" }
      });

      // Dinero por cobrar real = (Total prestado - Total abonado)
      const totalAmount = pendingAggregation._sum.amount || 0;
      const totalPaid = pendingAggregation._sum.amountPaid || 0;

      return res.json({
        message: "📊 Métricas de Administrador",
        metrics: {
          totalCustomers,
          totalCollected: cajaGlobal?.balance || 0, // Ve la Bóveda
          totalPending: totalAmount - totalPaid
        }
      });
    } 
    
    // 🛵 MÉTRICAS DEL COBRADOR (Ve solo su mundo)
    else {
      // 1. Solo cuenta los clientes que el jefe le asignó
      const totalCustomers = await prisma.customer.count({ 
        where: { tenantId, assignedToId: user.userId } 
      });

      // 2. Ve el dinero que tiene físicamente en su bolsillo en este instante
      const cajaMenor = await prisma.cajaMenor.findUnique({ 
        where: { userId: user.userId } 
      });

      // 3. Solo suma la plata que le deben SUS clientes asignados
      const pendingAggregation = await prisma.debt.aggregate({
        _sum: { amount: true, amountPaid: true }, 
        where: { 
          tenantId, 
          status: "PENDING",
          customer: { assignedToId: user.userId } // Filtro estricto de ruta
        }
      });

      const totalAmount = pendingAggregation._sum.amount || 0;
      const totalPaid = pendingAggregation._sum.amountPaid || 0;

      return res.json({
        message: "📊 Métricas de Cobrador",
        metrics: {
          totalCustomers,
          totalCollected: cajaMenor?.balance || 0, // Ve su propio bolsillo
          totalPending: totalAmount - totalPaid
        }
      });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cargar el dashboard" });
  }
});

export default router;