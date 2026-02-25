import express, { Request, Response } from 'express'; // <--- Importamos Request y Response
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Definimos los tipos explícitamente para req y res
app.get('/', (req: Request, res: Response) => {
  res.send('🚀 Servidor SaaS de Cobros funcionando');
});

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});