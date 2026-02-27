// backend/src/routes/debt.routes.ts
import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// POST /api/debts -> Crear un cobro AUTOMATIZADO
router.post('/', verificarToken, async (req: Request, res: Response): Promise<any> => {
  try {
    const { description, amount, customerId, dueDate } = req.body;
    const tenantId = (req as any).user.tenantId;

    if (!description || !amount || !customerId) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // 🧠 1. El servidor busca la configuración de TU empresa
    const config = await prisma.configuracionEmpresa.findUnique({
      where: { tenantId }
    });

    // Si por alguna razón no la encuentra, usamos un 20% como salvavidas
    const tasaInteres = config?.tasaInteres || 20.0;

    // 🧮 2. Matemáticas: Calculamos el total a cobrar (Capital + Intereses)
    const capitalPrestado = parseFloat(amount);
    const montoTotal = capitalPrestado + (capitalPrestado * (tasaInteres / 100));

    // 💾 3. Guardamos la deuda con el monto final ya calculado
    const newDebt = await prisma.debt.create({
      data: {
        description, 
        amount: montoTotal, // ¡Guardamos el monto total!
        customerId, 
        tenantId,
        dueDate: dueDate ? new Date(dueDate) : null
      }
    });

    // Le devolvemos un desglose hermoso al usuario para que vea qué pasó
    res.status(201).json({ 
      message: "💵 Cobro automatizado con éxito", 
      detalle: {
        capitalPrestado: capitalPrestado,
        tasaAplicada: `${tasaInteres}%`,
        totalACobrar: montoTotal
      },
      debt: newDebt 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar el cobro" });
  }
});

// GET /api/debts -> Listar mis cobros
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

// PATCH /api/debts/:id/pay -> Pagar cobro
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