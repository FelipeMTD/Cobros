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
    const paidAggregation = await prisma.debt.aggregate({
      _sum: { amount: true }, where: { tenantId, status: "PAID" }
    });
    const pendingAggregation = await prisma.debt.aggregate({
      _sum: { amount: true }, where: { tenantId, status: "PENDING" }
    });

    res.json({
      message: "📊 Métricas cargadas con éxito",
      metrics: {
        totalCustomers,
        totalCollected: paidAggregation._sum.amount || 0,
        totalPending: pendingAggregation._sum.amount || 0
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cargar el dashboard" });
  }
});

export default router;