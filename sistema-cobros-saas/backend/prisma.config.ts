import { defineConfig } from '@prisma/config';
import 'dotenv/config'; // <--- Esto asegura que lea tu archivo .env

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});