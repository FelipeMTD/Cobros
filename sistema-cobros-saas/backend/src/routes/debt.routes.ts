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

// ⏳ POST /api/debts/process-mora -> Motor Automático de Recargos
router.post('/process-mora', verificarToken, async (req: Request, res: Response): Promise<any> => {
  try {
    const today = new Date();
    
    // 1. Buscar TODAS las deudas PENDIENTES que ya se vencieron
    const overdueDebts = await prisma.debt.findMany({
      where: {
        status: 'PENDING',
        dueDate: { lt: today } // dueDate es menor a hoy
      },
      include: { tenant: { include: { configuracion: true } } }
    });

    let procesados = 0;

    // 2. Analizar cliente por cliente
    for (const debt of overdueDebts) {
      const config = debt.tenant.configuracion;
      
      // Si la empresa de este cliente decidió no cobrar mora, lo perdonamos
      if (!config || !config.cobrarMora) continue; 

      // Calcular cuántos días han pasado desde la fecha de vencimiento
      const msLate = today.getTime() - new Date(debt.dueDate!).getTime();
      let daysLate = Math.floor(msLate / (1000 * 60 * 60 * 24));

      // 🧠 LA MAGIA: Excluir los domingos si la empresa lo configuró así
      if (config.excluirDomingos) {
        let domingos = 0;
        let tempDate = new Date(debt.dueDate!);
        while (tempDate <= today) {
          if (tempDate.getDay() === 0) domingos++; // 0 es Domingo en JavaScript
          tempDate.setDate(tempDate.getDate() + 1);
        }
        daysLate -= domingos;
      }

      if (daysLate > 0) {
        // Fórmula de Castigo: 1% de interés moratorio por cada día de retraso
        const penalidad = (debt.amount * 0.01) * daysLate; 
        
        await prisma.debt.update({
          where: { id: debt.id },
          data: { 
            amount: debt.amount + penalidad,
            // Actualizamos la fecha de vencimiento a hoy para no cobrarle doble mañana si no pasa otro día
            dueDate: today, 
            description: `${debt.description} (+ Mora aplicada)`
          }
        });
        procesados++;
      }
    }

    res.json({ message: `⚙️ Motor de Mora ejecutado. ${procesados} deudas han recibido penalidad.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fatal en el motor de mora" });
  }
});

export default router;