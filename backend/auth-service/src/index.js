import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import pool from './config/db.js';

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ service: 'auth-service', status: 'OK', timestamp: new Date() });
});

app.use('/api/auth', authRoutes);

app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

app.use((err, _req, res, _next) => {
  console.error('[auth-service] Error:', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const start = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('PostgreSQL conectado');
  } catch (err) {
    console.error('Error conectando a PostgreSQL:', err.message);
  }
  app.listen(PORT, () => {
    console.log(`auth-service corriendo en el puerto ${PORT}`);
  });
};

start();
