// backend/src/routes/tenant.routes.ts
import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// POST /api/tenants/register -> Registro público
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: { name, slug: name.toLowerCase().replace(/\s+/g, '-') }
      });
      const user = await tx.user.create({
        data: { email, password: hashedPassword, tenantId: tenant.id, role: 'ADMIN' }
      });
      return { tenant, user };
    });

    res.json({ message: "¡Éxito!", data: result });
  } catch (error) {
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
    res.json({ empresa: miEmpresa });
  } catch (error) {
    res.status(500).json({ error: "Error al cargar los datos" });
  }
});

// =====================================================================
// 👑 ZONA RESTRINGIDA: SOLO SUPER_ADMIN (DUEÑO DEL SAAS)
// =====================================================================

// GET /api/tenants -> Listar TODAS las empresas del servidor
router.get('/', verificarToken, async (req: Request, res: Response): Promise<any> => {
  if ((req as any).user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: "Acceso denegado. Se requiere rol SUPER_ADMIN." });
  }
  try {
    const tenants = await prisma.tenant.findMany({
      include: { users: { select: { email: true, role: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ tenants });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener empresas" });
  }
});

// PATCH /api/tenants/:id/status -> Suspender o Reactivar una Empresa
router.patch('/:id/status', verificarToken, async (req: Request, res: Response): Promise<any> => {
  if ((req as any).user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: "Acceso denegado." });
  }
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const tenant = await prisma.tenant.update({
      where: { id },
      data: { isActive }
    });
    res.json({ message: isActive ? "✅ Empresa Activada" : "🚫 Empresa Suspendida", tenant });
  } catch (error) {
    res.status(500).json({ error: "Error al cambiar estado" });
  }
});

// 🤫 RUTA SECRETA: Inyectar poderes (Hack local)
router.patch('/hack-superadmin', verificarToken, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.userId;
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'SUPER_ADMIN' }
    });
    res.json({ message: "👑 Hack exitoso. Ahora eres el Dueño." });
  } catch (error) {
    res.status(500).json({ error: "Error en el hack" });
  }
});

export default router;