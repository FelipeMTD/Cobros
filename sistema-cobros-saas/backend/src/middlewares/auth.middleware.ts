// backend/src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js'; // <-- Importamos Prisma para la base de datos

// 1. Verificador de Token (Ahora valida si la empresa está suspendida)
export const verificarToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Acceso denegado. Se requiere un Token." });

  try {
    const decodificado = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    
    // 🚨 REGLA DE ORO (PRD 8.1): Verificar que la empresa siga ACTIVA
    const tenant = await prisma.tenant.findUnique({
      where: { id: decodificado.tenantId },
      select: { isActive: true }
    });

    // Si la empresa fue suspendida (y el que intenta entrar no es el dueño del SaaS), lo pateamos
    if (!tenant || (!tenant.isActive && decodificado.role !== 'SUPER_ADMIN')) {
      return res.status(403).json({ error: "🚫 Servicio suspendido. Tu empresa debe regularizar su pago." });
    }

    (req as any).user = decodificado; 
    next(); 
  } catch (error) {
    res.status(401).json({ error: "Token inválido o expirado." });
  }
};

// 2. Guardián de Roles (RBAC) - Solo para Jefes
export const soloAdmins = (req: Request, res: Response, next: NextFunction): any => {
  const user = (req as any).user;
  
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: "🔒 Acceso denegado. Se requieren permisos de Administrador." });
  }
  
  next();
};