// backend/src/routes/customer.routes.ts
import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// 🔍 GET /api/customers -> Listar todos los clientes de mi empresa
router.get('/', verificarToken, async (req: Request, res: Response): Promise<any> => {
  try {
    const tenantId = (req as any).user.tenantId;
    const customers = await prisma.customer.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' } // Los más nuevos primero
    });
    res.json({ customers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener la lista de clientes" });
  }
});

// ✍️ POST /api/customers -> Crear un nuevo cliente
router.post('/', verificarToken, async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, phone } = req.body;
    const tenantId = (req as any).user.tenantId; 

    if (!name) return res.status(400).json({ error: "El nombre del cliente es obligatorio" });

    const newCustomer = await prisma.customer.create({
      data: { name, email, phone, tenantId }
    });

    res.status(201).json({ message: "👤 Cliente registrado con éxito", customer: newCustomer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar el cliente" });
  }
});

export default router;