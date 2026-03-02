// backend/src/routes/config.routes.ts
import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { verificarToken, soloAdmins } from '../middlewares/auth.middleware.js';
const router = Router();

// GET /api/config -> Trae la config actual (o la crea por defecto si no existe)
router.get('/', verificarToken, async (req: Request, res: Response): Promise<any> => {
  try {
    const tenantId = (req as any).user.tenantId;

    const config = await prisma.configuracionEmpresa.upsert({
      where: { tenantId },
      update: {}, 
      create: { tenantId } 
    });

    res.json({ message: "⚙️ Reglas de negocio cargadas", config });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cargar configuración" });
  }
});

// PATCH /api/config -> Modifica las reglas de la empresa
router.patch('/', verificarToken, soloAdmins, async (req: Request, res: Response): Promise<any> => {  try {
    const tenantId = (req as any).user.tenantId;
    const { tasaInteres, limiteCreditos, cobrarMora, excluirDomingos, excluirFestivos } = req.body;

    const configActualizada = await prisma.configuracionEmpresa.update({
      where: { tenantId },
      data: {
        ...(tasaInteres !== undefined && { tasaInteres: parseFloat(tasaInteres) }),
        ...(limiteCreditos !== undefined && { limiteCreditos: parseInt(limiteCreditos) }),
        ...(cobrarMora !== undefined && { cobrarMora }),
        ...(excluirDomingos !== undefined && { excluirDomingos }),
        ...(excluirFestivos !== undefined && { excluirFestivos })
      }
    });

    res.json({ message: "✅ Reglas actualizadas exitosamente", config: configActualizada });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar la configuración (Haz un GET primero)" });
  }
});

export default router;