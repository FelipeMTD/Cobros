import { PrismaClient } from '@prisma/client';
import 'dotenv/config'; 

const prisma = new PrismaClient({
  // En Prisma 7, esta es la propiedad oficial para la conexión
  datasourceUrl: process.env.DATABASE_URL,
});

export default prisma;