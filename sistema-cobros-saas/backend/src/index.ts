import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './lib/prisma.js';
import bcrypt from 'bcrypt';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('🚀 Backend SaaS Corriendo (Prisma 6)');
});

// Ruta de registro rápido
app.post('/api/tenants/register', async (req, res) => {
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

app.listen(PORT, () => {
  console.log(`✅ Servidor listo en http://localhost:${PORT}`);
});