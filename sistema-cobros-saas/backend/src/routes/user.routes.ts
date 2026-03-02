// backend/src/routes/user.routes.ts
import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';
import { verificarToken, soloAdmins } from '../middlewares/auth.middleware.js';
const router = Router();

// GET /api/users -> Listar todos los empleados (cobradores) de mi empresa
router.get('/', verificarToken, async (req: Request, res: Response): Promise<any> => {
  try {
    const tenantId = (req as any).user.tenantId;
    const users = await prisma.user.findMany({
      where: { tenantId },
      select: { id: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener la lista de usuarios" });
  }
});

// POST /api/users -> Crear un nuevo cobrador
router.post('/', verificarToken, soloAdmins, async (req: Request, res: Response): Promise<any> => {  try {
    const { email, password, role } = req.body;
    const tenantId = (req as any).user.tenantId; 

    if (!email || !password) {
      return res.status(400).json({ error: "El correo y la contraseña son obligatorios" });
    }

    // Verificar si el correo ya existe en la plataforma
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ error: "Este correo ya está registrado" });
    }

    // Encriptar la contraseña del empleado
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { 
        email, 
        password: hashedPassword, 
        role: role || 'PRESTAMISTA', // Por defecto será prestamista
        tenantId 
      },
      select: { id: true, email: true, role: true } // No devolvemos la contraseña
    });

    res.status(201).json({ message: "🛵 Cobrador creado con éxito", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar el usuario" });
  }
});

export default router;