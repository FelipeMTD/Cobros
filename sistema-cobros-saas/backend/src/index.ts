import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import prisma from './lib/prisma.js'; // Importamos el cliente que creamos

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// RUTA: Registro de Empresa (Tenant) y Usuario Admin
app.post('/api/tenants/register', async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    // 1. Encriptar contraseña (Seguridad Fase 1)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Crear Empresa y Usuario en una transacción (Todo o nada)
    const result = await prisma.$transaction(async (tx) => {
      // Creamos el Tenant (Empresa)
      const newTenant = await tx.tenant.create({
        data: {
          name: name,
          slug: name.toLowerCase().replace(/\s+/g, '-'), // Genera un slug simple
          plan: 'FREE'
        }
      });

      // Creamos el Usuario vinculado a ese Tenant
      const newUser = await tx.user.create({
        data: {
          email: email,
          password: hashedPassword,
          role: 'ADMIN',
          tenantId: newTenant.id
        }
      });

      return { newTenant, newUser };
    });

    res.status(201).json({
      message: "✅ Empresa registrada con éxito",
      tenant: result.newTenant.name,
      admin: result.newUser.email
    });

  } catch (error: any) {
    console.error(error);
    res.status(400).json({ 
      error: "Error al registrar", 
      details: error.message 
    });
  }
});

app.get('/', (req: Request, res: Response) => {
  res.send('🚀 Servidor SaaS de Cobros funcionando');
});

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});