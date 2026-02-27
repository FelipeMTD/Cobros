// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// 1. IMPORTAR RUTAS
import authRoutes from './routes/auth.routes.js';
import tenantRoutes from './routes/tenant.routes.js';
import customerRoutes from './routes/customer.routes.js';
import debtRoutes from './routes/debt.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Ruta de prueba inicial
app.get('/', (req, res) => {
  res.send('🚀 Backend SaaS Corriendo (Arquitectura Limpia)');
});

// 2. CONECTAR RUTAS AL SERVIDOR
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/debts', debtRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 3. ARRANCAR EL SERVIDOR
app.listen(PORT, () => {
  console.log(`✅ Servidor listo en http://localhost:${PORT}`);
});