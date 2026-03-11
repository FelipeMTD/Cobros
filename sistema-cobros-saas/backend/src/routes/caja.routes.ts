// backend/src/routes/caja.routes.ts
import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { verificarToken, soloAdmins } from '../middlewares/auth.middleware.js';

const router = Router();

// 📊 GET /api/cajas -> Ver la Bóveda (Jefe) o el Bolsillo (Cobrador)
// 🚨 NOTA: Quitamos "soloAdmins" de aquí para que el cobrador pueda entrar
router.get('/', verificarToken, async (req: Request, res: Response): Promise<any> => {
  try {
    const user = (req as any).user;
    const tenantId = user.tenantId;

    // 👑 SI ES EL JEFE: Le mostramos la Bóveda y todos los cobradores
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      const cajaGlobal = await prisma.cajaGlobal.upsert({
        where: { tenantId },
        update: {},
        create: { tenantId, balance: 0 }
      });

      const cobradores = await prisma.user.findMany({
        where: { tenantId, role: 'PRESTAMISTA' },
        select: { id: true, email: true, cajaMenor: true }
      });

      return res.json({ tipo: 'ADMIN', cajaGlobal, cobradores });
    } 
    
    // 🛵 SI ES EL COBRADOR: Le mostramos ÚNICAMENTE su bolsillo (Caja Menor)
    else {
      const cajaMenor = await prisma.cajaMenor.upsert({
        where: { userId: user.userId },
        update: {},
        create: { userId: user.userId, tenantId, balance: 0 }
      });

      return res.json({ tipo: 'PRESTAMISTA', cajaMenor });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cargar las cajas" });
  }
});

// 💸 POST /api/cajas/fondear -> (Jefe a Cobrador) Dar dinero para la calle
router.post('/fondear', verificarToken, soloAdmins, async (req: Request, res: Response): Promise<any> => {
  try {
    const tenantId = (req as any).user.tenantId;
    const { userId, amount } = req.body;
    const monto = parseFloat(amount);

    if (monto <= 0) return res.status(400).json({ error: "Monto inválido" });

    const cajaGlobal = await prisma.cajaGlobal.findUnique({ where: { tenantId } });
    if (!cajaGlobal || cajaGlobal.balance < monto) {
      return res.status(400).json({ error: "No hay suficiente dinero en la Bóveda Global" });
    }

    // TRANSACCIÓN: Restar de Global, Sumar a Menor
    await prisma.$transaction(async (tx) => {
      await tx.cajaGlobal.update({
        where: { tenantId },
        data: { balance: { decrement: monto } }
      });

      await tx.cajaMenor.upsert({
        where: { userId },
        update: { balance: { increment: monto } },
        create: { userId, tenantId, balance: monto }
      });
    });

    res.json({ message: `✅ $${monto} entregados al cobrador.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al fondear caja" });
  }
});

// 📥 POST /api/cajas/liquidar -> (Cobrador a Jefe) Recibir el recaudo del día
router.post('/liquidar', verificarToken, soloAdmins, async (req: Request, res: Response): Promise<any> => {
  try {
    const tenantId = (req as any).user.tenantId;
    const { userId, amount } = req.body;
    const monto = parseFloat(amount);

    if (monto <= 0) return res.status(400).json({ error: "Monto inválido" });

    const cajaMenor = await prisma.cajaMenor.findUnique({ where: { userId } });
    if (!cajaMenor || cajaMenor.balance < monto) {
      return res.status(400).json({ error: "El cobrador no tiene tanto dinero reportado." });
    }

    // TRANSACCIÓN: Restar de Menor, Sumar a Global
    await prisma.$transaction(async (tx) => {
      await tx.cajaMenor.update({
        where: { userId },
        data: { balance: { decrement: monto } }
      });

      await tx.cajaGlobal.update({
        where: { tenantId },
        data: { balance: { increment: monto } }
      });
    });

    res.json({ message: `✅ $${monto} ingresados a la Bóveda Global.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al liquidar caja" });
  }
});

export default router;