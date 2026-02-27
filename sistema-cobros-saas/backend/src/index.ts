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

app.listen(PORT, () => {
  console.log(`✅ Servidor listo en http://localhost:${PORT}`);
});