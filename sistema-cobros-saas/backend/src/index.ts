import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './lib/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🛡️ MIDDLEWARE: El Guardia de Seguridad
const verificarToken = (req: Request, res: Response, next: NextFunction): any => {
  // 1. El guardia pide el token de la cabecera (Header) de la petición
  const token = req.header('Authorization')?.split(' ')[1]; // Formato esperado: "Bearer eyJhb..."

  if (!token) {
    return res.status(401).json({ error: "Acceso denegado. Se requiere un Token." });
  }

  try {
    // 2. El guardia usa la máquina de rayos X (la clave secreta) para validar el token
    const decodificado = jwt.verify(token, process.env.JWT_SECRET as string);
    
    // 3. Le pegamos una etiqueta con los datos del usuario a la petición para usarla adentro
    (req as any).user = decodificado; 
    
    // 4. ¡Pásale!
    next(); 
  } catch (error) {
    res.status(401).json({ error: "Token inválido o expirado." });
  }
};

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
// RUTA: Iniciar Sesión (Login)
app.post('/api/auth/login', async (req, res): Promise<any> => {
  const { email, password } = req.body;

  try {
    // 1. Buscar al usuario
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true } // Traemos también los datos de su empresa
    });

    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    // 2. Verificar la contraseña
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // 3. Generar el Token (Tu pasaporte digital)
    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenantId, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '8h' } // El token dura 8 horas
    );

    // 4. Responder con el token y datos del usuario
    res.json({
      message: "✅ Login exitoso",
      token: token,
      user: {
        name: user.email,
        role: user.role,
        tenant: user.tenant.name
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// RUTA PRIVADA: Ver el perfil de mi empresa
// Fíjate que ponemos 'verificarToken' en medio. Es el guardia en la puerta.
app.get('/api/tenants/mi-empresa', verificarToken, async (req: Request, res: Response) => {
  try {
    // Gracias al guardia, ya sabemos exactamente quién está haciendo la petición
    const tenantId = (req as any).user.tenantId;

    // Buscamos la empresa en la base de datos
    const miEmpresa = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { users: { select: { id: true, email: true, role: true } } } // Traemos sus usuarios (sin la contraseña)
    });

    res.json({
      message: "🔐 Bienvenido a la Zona VIP de tu empresa",
      empresa: miEmpresa
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cargar los datos" });
  }
});

// ==========================================
// 👥 MÓDULO DE CLIENTES (CUSTOMERS)
// ==========================================

// RUTA PRIVADA: Crear un nuevo cliente
app.post('/api/customers', verificarToken, async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, phone } = req.body;
    
    // ¡La magia del Token! El guardia nos dice a qué empresa pertenece el usuario
    const tenantId = (req as any).user.tenantId; 

    // Validación básica
    if (!name) {
      return res.status(400).json({ error: "El nombre del cliente es obligatorio" });
    }

    // Creamos el cliente en la base de datos atado a la empresa
    const newCustomer = await prisma.customer.create({
      data: {
        name: name,
        email: email,
        phone: phone,
        tenantId: tenantId // 🔒 Candado de seguridad: atado a TU empresa
      }
    });

    res.status(201).json({
      message: "👤 Cliente registrado con éxito",
      customer: newCustomer
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar el cliente" });
  }
});

// ==========================================
// 💰 MÓDULO DE COBROS (DEBTS)
// ==========================================

// RUTA PRIVADA: Registrar un nuevo cobro a un cliente
app.post('/api/debts', verificarToken, async (req: Request, res: Response): Promise<any> => {
  try {
    const { description, amount, customerId, dueDate } = req.body;
    
    // El guardia nos dice a qué empresa pertenece esta operación
    const tenantId = (req as any).user.tenantId;

    // Validación básica
    if (!description || !amount || !customerId) {
      return res.status(400).json({ error: "Faltan datos obligatorios (description, amount, customerId)" });
    }

    // Creamos el cobro en la base de datos
    const newDebt = await prisma.debt.create({
      data: {
        description: description,
        amount: parseFloat(amount), // Nos aseguramos de que sea un número (decimal)
        customerId: customerId,     // A quién le cobramos
        tenantId: tenantId,         // De qué empresa es este cobro
        dueDate: dueDate ? new Date(dueDate) : null // Fecha límite (opcional)
      }
    });

    res.status(201).json({
      message: "💵 Cobro registrado con éxito",
      debt: newDebt
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar el cobro" });
  }
});

// ==========================================
// 💰 MÓDULO DE COBROS (DEBTS)
// ==========================================

// RUTA PRIVADA: Registrar un nuevo cobro a un cliente
app.post('/api/debts', verificarToken, async (req: Request, res: Response): Promise<any> => {
  try {
    const { description, amount, customerId, dueDate } = req.body;
    
    // El guardia nos dice a qué empresa pertenece esta operación
    const tenantId = (req as any).user.tenantId;

    // Validación básica
    if (!description || !amount || !customerId) {
      return res.status(400).json({ error: "Faltan datos obligatorios (description, amount, customerId)" });
    }

    // Creamos el cobro en la base de datos
    const newDebt = await prisma.debt.create({
      data: {
        description: description,
        amount: parseFloat(amount), // Nos aseguramos de que sea un número (decimal)
        customerId: customerId,     // A quién le cobramos
        tenantId: tenantId,         // De qué empresa es este cobro
        dueDate: dueDate ? new Date(dueDate) : null // Fecha límite (opcional)
      }
    });

    res.status(201).json({
      message: "💵 Cobro registrado con éxito",
      debt: newDebt
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar el cobro" });
  }
});

// RUTA PRIVADA: Obtener todos los cobros de mi empresa
app.get('/api/debts', verificarToken, async (req: Request, res: Response): Promise<any> => {
  try {
    // El guardia nos dice a qué empresa perteneces
    const tenantId = (req as any).user.tenantId;

    // Buscamos todas las deudas de TU empresa
    const misCobros = await prisma.debt.findMany({
      where: { 
        tenantId: tenantId 
      },
      include: {
        customer: {
          select: { name: true, email: true } // Traemos el nombre y correo del cliente
        }
      },
      orderBy: {
        createdAt: 'desc' // Ordenamos de lo más nuevo a lo más viejo
      }
    });

    res.json({
      message: "📋 Lista de cobros obtenida",
      total: misCobros.length,
      debts: misCobros
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los cobros" });
  }
});

// RUTA PRIVADA: Marcar un cobro como PAGADO
app.patch('/api/debts/:id/pay', verificarToken, async (req: Request, res: Response): Promise<any> => {
  try {
    // 1. Extraemos el ID del cobro directamente de la URL
    const { id } = req.params; 
    
    // 2. El guardia nos da el ID de tu empresa
    const tenantId = (req as any).user.tenantId;

    // 3. SEGURIDAD: Buscamos que el cobro exista Y que sea de TU empresa
    const cobroExistente = await prisma.debt.findFirst({
      where: {
        id: id,
        tenantId: tenantId // 🔒 Candado clave
      }
    });

    if (!cobroExistente) {
      return res.status(404).json({ error: "Cobro no encontrado o no pertenece a tu empresa" });
    }

    if (cobroExistente.status === "PAID") {
      return res.status(400).json({ message: "Este cobro ya había sido pagado anteriormente" });
    }

    // 4. Actualizamos el estado a PAGADO
    const cobroPagado = await prisma.debt.update({
      where: { id: id },
      data: { status: "PAID" }
    });

    res.json({
      message: "✅ ¡Dinero en caja! Cobro marcado como PAGADO",
      debt: cobroPagado
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al procesar el pago" });
  }
});

// ==========================================
// 📈 MÓDULO DE DASHBOARD Y MÉTRICAS
// ==========================================

// RUTA PRIVADA: Obtener resumen financiero
app.get('/api/dashboard', verificarToken, async (req: Request, res: Response): Promise<any> => {
  try {
    // El guardia nos da el ID de tu empresa
    const tenantId = (req as any).user.tenantId;

    // 1. ¿Cuántos clientes tenemos en total?
    const totalCustomers = await prisma.customer.count({
      where: { tenantId: tenantId }
    });

    // 2. ¿Cuánto dinero ya tenemos en el bolsillo (PAID)?
    const paidAggregation = await prisma.debt.aggregate({
      _sum: { amount: true },
      where: { tenantId: tenantId, status: "PAID" }
    });

    // 3. ¿Cuánto dinero nos deben en la calle (PENDING)?
    const pendingAggregation = await prisma.debt.aggregate({
      _sum: { amount: true },
      where: { tenantId: tenantId, status: "PENDING" }
    });

    // Enviamos el resumen empaquetado y listo para mostrar
    res.json({
      message: "📊 Métricas cargadas con éxito",
      metrics: {
        totalCustomers: totalCustomers,
        totalCollected: paidAggregation._sum.amount || 0, // Si es nulo, ponemos 0
        totalPending: pendingAggregation._sum.amount || 0
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cargar el dashboard" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor listo en http://localhost:${PORT}`);
});