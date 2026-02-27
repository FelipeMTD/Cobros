// backend/src/routes/tenant.routes.ts
import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// POST /api/tenants/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: { name, slug: name.toLowerCase().replace(/\s+/g, '-') }
      });
      const user = await tx.user.create({
        data: { email, password: hashedPassword, tenantId: tenant.id }
      });
      return { tenant, user };
    });

    res.json({ message: "¡Éxito!", data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar" });
  }
});

// GET /api/tenants/mi-empresa
router.get('/mi-empresa', verificarToken, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const miEmpresa = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { users: { select: { id: true, email: true, role: true } } }
    });

    res.json({ message: "🔐 Bienvenido a la Zona VIP de tu empresa", empresa: miEmpresa });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cargar los datos" });
  }
});

export default router;