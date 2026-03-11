// backend/src/routes/debt.routes.ts
import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// POST /api/debts -> Crear un cobro AUTOMATIZADO y descontar de la Caja
router.post('/', verificarToken, async (req: Request, res: Response): Promise<any> => {
  try {
    const { description, amount, customerId, dueDate } = req.body;
    const user = (req as any).user;

    if (!description || !amount || !customerId) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const config = await prisma.configuracionEmpresa.findUnique({
      where: { tenantId: user.tenantId }
    });
    const tasaInteres = config?.tasaInteres || 20.0;
    const capitalPrestado = parseFloat(amount);
    const montoTotal = capitalPrestado + (capitalPrestado * (tasaInteres / 100));

    // 🚨 TRANSACCIÓN: Creamos la deuda y restamos el dinero de la caja al mismo tiempo
    const resultado = await prisma.$transaction(async (tx) => {
      
      const newDebt = await tx.debt.create({
        data: {
          description, 
          amount: montoTotal, 
          customerId, 
          tenantId: user.tenantId,
          dueDate: dueDate ? new Date(dueDate) : null
        }
      });

      // Restamos el capital prestado de la Caja Global
      const caja = await tx.cajaGlobal.upsert({
        where: { tenantId: user.tenantId },
        update: { balance: { decrement: capitalPrestado } },
        create: { tenantId: user.tenantId, balance: -capitalPrestado } 
      });

      return { newDebt, caja };
    });

    res.status(201).json({ 
      message: "💵 Préstamo registrado y dinero descontado de caja", 
      detalle: {
        capitalPrestado: capitalPrestado,
        tasaAplicada: `${tasaInteres}%`,
        totalACobrar: montoTotal,
        nuevoSaldoCaja: resultado.caja.balance
      },
      debt: resultado.newDebt 
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

// 💸 POST /api/debts/:id/payments -> Registrar una cuota / abono
router.post('/:id/payments', verificarToken, async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const user = (req as any).user;
    const cuota = parseFloat(amount);

    if (isNaN(cuota) || cuota <= 0) return res.status(400).json({ error: "Cuota inválida" });

    const deuda = await prisma.debt.findFirst({ where: { id, tenantId: user.tenantId } });
    if (!deuda) return res.status(404).json({ error: "Deuda no encontrada" });
    if (deuda.status === 'PAID') return res.status(400).json({ error: "Esta deuda ya fue saldada" });

    // 🚨 TRANSACCIÓN: Cobramos la cuota y el dinero va al bolsillo de quien cobra
    const resultado = await prisma.$transaction(async (tx) => {
      
      // 1. Crear el recibo histórico
      const nuevoPago = await tx.payment.create({
        data: { amount: cuota, debtId: id, collectorId: user.userId, tenantId: user.tenantId }
      });

      // 2. Actualizar el saldo de la deuda (Si ya pagó todo, se marca PAID)
      const nuevoMontoPagado = deuda.amountPaid + cuota;
      const status = nuevoMontoPagado >= deuda.amount ? 'PAID' : 'PENDING';
      
      const deudaActualizada = await tx.debt.update({
        where: { id },
        data: { amountPaid: nuevoMontoPagado, status }
      });

      // 3. Meter el dinero físico a la CAJA MENOR del cobrador que hizo el recaudo
      const cajaMenor = await tx.cajaMenor.upsert({
        where: { userId: user.userId },
        update: { balance: { increment: cuota } },
        create: { userId: user.userId, tenantId: user.tenantId, balance: cuota }
      });

      return { deudaActualizada, cajaMenor };
    });

    res.json({ 
      message: `✅ Cuota de $${cuota} registrada exitosamente.`,
      saldoRestante: resultado.deudaActualizada.amount - resultado.deudaActualizada.amountPaid
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al procesar la cuota" });
  }
});

// ============================================================================
// 🇨🇴 UTILIDAD MATEMÁTICA: Calculadora de Festivos Colombia (Meeus + Emiliani)
// ============================================================================
function getFestivosColombia(year: number): string[] {
  const festivos: string[] = [];
  
  // Función auxiliar para formatear la fecha a "YYYY-MM-DD"
  const add = (m: number, d: number) => {
    festivos.push(`${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  };

  // Ley Emiliani: Si no cae lunes, se traslada al siguiente lunes
  const addNextMonday = (m: number, d: number) => {
    const date = new Date(year, m - 1, d);
    const day = date.getDay();
    if (day !== 1) { // Si no es lunes (1)
      const diff = day === 0 ? 1 : (8 - day); // Días que faltan para el lunes
      date.setDate(date.getDate() + diff);
    }
    add(date.getMonth() + 1, date.getDate());
  };

  // 1. FESTIVOS FIJOS (No se mueven)
  add(1, 1);   // Año nuevo
  add(5, 1);   // Día del trabajo
  add(7, 20);  // Independencia
  add(8, 7);   // Batalla de Boyacá
  add(12, 8);  // Inmaculada Concepción
  add(12, 25); // Navidad

  // 2. FESTIVOS LEY EMILIANI (Se mueven al lunes)
  addNextMonday(1, 6);   // Reyes Magos
  addNextMonday(3, 19);  // San José
  addNextMonday(6, 29);  // San Pedro y San Pablo
  addNextMonday(8, 15);  // Asunción
  addNextMonday(10, 12); // Día de la Raza
  addNextMonday(11, 1);  // Todos los Santos
  addNextMonday(11, 11); // Independencia de Cartagena

  // 3. FESTIVOS RELIGIOSOS (Calculados con base en el Domingo de Pascua - Algoritmo de Meeus)
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const pMonth = Math.floor((h + l - 7 * m + 114) / 31);
  const pDay = ((h + l - 7 * m + 114) % 31) + 1;
  const pascua = new Date(year, pMonth - 1, pDay);

  const addRelative = (days: number) => {
    const date = new Date(pascua);
    date.setDate(date.getDate() + days);
    add(date.getMonth() + 1, date.getDate());
  };

  addRelative(-3); // Jueves Santo
  addRelative(-2); // Viernes Santo
  addRelative(43); // Ascensión del Señor (Cae lunes)
  addRelative(64); // Corpus Christi (Cae lunes)
  addRelative(71); // Sagrado Corazón (Cae lunes)

  return festivos;
}

// ============================================================================
// ⏳ POST /api/debts/process-mora -> Motor Automático de Recargos
// ============================================================================
router.post('/process-mora', verificarToken, async (req: Request, res: Response): Promise<any> => {
  try {
    const today = new Date();
    
    const overdueDebts = await prisma.debt.findMany({
      where: { status: 'PENDING', dueDate: { lt: today } },
      include: { tenant: { include: { configuracion: true } } }
    });

    let procesados = 0;

    for (const debt of overdueDebts) {
      const config = debt.tenant.configuracion;
      if (!config || !config.cobrarMora) continue; 

      const msLate = today.getTime() - new Date(debt.dueDate!).getTime();
      let daysLate = Math.floor(msLate / (1000 * 60 * 60 * 24));

      let domingosCount = 0;
      let festivosCount = 0;
      
      // Construir el diccionario de festivos para el rango de fechas
      const yearStart = new Date(debt.dueDate!).getFullYear();
      const yearEnd = today.getFullYear();
      let festivosArray: string[] = [];
      for(let y = yearStart; y <= yearEnd; y++) {
        festivosArray = festivosArray.concat(getFestivosColombia(y));
      }

      let tempDate = new Date(debt.dueDate!);
      
      // Recorrer día por día para evaluar si fue domingo o festivo
      while (tempDate <= today) {
        const isDomingo = tempDate.getDay() === 0;
        const dateString = `${tempDate.getFullYear()}-${String(tempDate.getMonth() + 1).padStart(2, '0')}-${String(tempDate.getDate()).padStart(2, '0')}`;
        const isFestivo = festivosArray.includes(dateString);

        if (config.excluirDomingos && isDomingo) {
          domingosCount++;
        } else if (config.excluirFestivos && isFestivo) {
          // Usamos 'else if' para asegurar que si un festivo cae domingo, no se descuente dos veces
          festivosCount++;
        }
        tempDate.setDate(tempDate.getDate() + 1);
      }

      // Restamos los días perdonados del total de días de mora
      daysLate -= (domingosCount + festivosCount);

      if (daysLate > 0) {
        const penalidad = (debt.amount * 0.01) * daysLate; // 1% por día hábil
        
        await prisma.debt.update({
          where: { id: debt.id },
          data: { 
            amount: debt.amount + penalidad,
            dueDate: today, 
            description: `${debt.description} (+ Mora aplicada)`
          }
        });
        procesados++;
      }
    }

    res.json({ message: `⚙️ Motor ejecutado. ${procesados} deudas castigadas. Días festivos/domingos omitidos con éxito.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fatal en el motor de mora" });
  }
});

export default router;