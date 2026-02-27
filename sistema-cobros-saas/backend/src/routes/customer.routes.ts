// backend/src/routes/customer.routes.ts
import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// POST /api/customers
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