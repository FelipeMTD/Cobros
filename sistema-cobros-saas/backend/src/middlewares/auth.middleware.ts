// backend/src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verificarToken = (req: Request, res: Response, next: NextFunction): any => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Acceso denegado. Se requiere un Token." });
  }

  try {
    const decodificado = jwt.verify(token, process.env.JWT_SECRET as string);
    (req as any).user = decodificado; 
    next(); 
  } catch (error) {
    res.status(401).json({ error: "Token inválido o expirado." });
  }
};