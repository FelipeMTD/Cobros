// backend/src/routes/debt.routes.ts
import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// POST /api/debts
router.post('/', verificarToken, async (req: Request, res: Response): Promise<any> => {
  try {
    const { description, amount, customerId, dueDate } = req.body;
    const tenantId = (req as any).user.tenantId;

    if (!description || !amount || !customerId) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const newDebt = await prisma.debt.create({
      data: {
        description, amount: parseFloat(amount), customerId, tenantId,
        dueDate: dueDate ? new Date(dueDate) : null
      }
    });

    res.status(201).json({ message: "💵 Cobro registrado con éxito", debt: newDebt });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar el cobro" });
  }
});

// GET /api/debts
router.get('/', verificarToken, async (req: Request, res: Response): Promise<any> => {
  try {
    const tenantId = (req as any).user.tenantId;
    const misCobros = await prisma.debt.findMany({
      where: { tenantId },
      include: { customer: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ message: "📋 Lista de cobros obtenida", total: misCobros.length, debts: misCobros });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los cobros" });
  }
});

// PATCH /api/debts/:id/pay
router.patch('/:id/pay', verificarToken, async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params; 
    const tenantId = (req as any).user.tenantId;

    const cobroExistente = await prisma.debt.findFirst({ where: { id, tenantId } });

    if (!cobroExistente) return res.status(404).json({ error: "Cobro no encontrado o no te pertenece" });
    if (cobroExistente.status === "PAID") return res.status(400).json({ message: "Este cobro ya había sido pagado" });

    const cobroPagado = await prisma.debt.update({
      where: { id }, data: { status: "PAID" }
    });

    res.json({ message: "✅ ¡Dinero en caja! Cobro marcado como PAGADO", debt: cobroPagado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al procesar el pago" });
  }
});

export default router;