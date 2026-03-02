// backend/src/routes/auth.routes.ts
import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js'; // Ojo al ../

const router = Router();

// RUTA: Iniciar Sesión (Login) -> /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true }
    });

    if (!user) return res.status(401).json({ error: "Usuario no encontrado" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: "Contraseña incorrecta" });
    if (!user.tenant.isActive && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: "🚫 Servicio suspendido. Contacta al proveedor del software." });
    }
    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenantId, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '8h' }
    );

    res.json({
      message: "✅ Login exitoso",
      token: token,
      user: { name: user.email, role: user.role, tenant: user.tenant.name }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

export default router;