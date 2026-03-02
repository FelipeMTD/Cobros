// backend/src/routes/dashboard.routes.ts
import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// GET /api/dashboard
router.get('/', verificarToken, async (req: Request, res: Response): Promise<any> => {
  try {
    const tenantId = (req as any).user.tenantId;

    const totalCustomers = await prisma.customer.count({ where: { tenantId } });
    
    // El dinero en la calle sigue siendo la suma de lo PENDIENTE
    const pendingAggregation = await prisma.debt.aggregate({
      _sum: { amount: true }, where: { tenantId, status: "PENDING" }
    });

    // 🚨 NUEVO: El "Dinero en Caja" ahora es el balance real de la Bóveda
    const cajaGlobal = await prisma.cajaGlobal.findUnique({
      where: { tenantId }
    });

    res.json({
      message: "📊 Métricas cargadas con éxito",
      metrics: {
        totalCustomers,
        totalCollected: cajaGlobal?.balance || 0, // <--- Lee directamente la Caja Global
        totalPending: pendingAggregation._sum.amount || 0
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cargar el dashboard" });
  }
});

export default router;