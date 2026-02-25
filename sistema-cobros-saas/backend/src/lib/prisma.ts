import { PrismaClient } from '@prisma/client';

// Prisma 6 lee el .env automáticamente
const prisma = new PrismaClient();

export default prisma;