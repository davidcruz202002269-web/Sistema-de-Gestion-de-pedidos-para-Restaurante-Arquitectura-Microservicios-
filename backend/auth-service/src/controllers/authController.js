import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'quickbite_secret';

// ── POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role = 'cliente' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email y password son requeridos' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'El email ya esta registrado' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashed, role]
    );
    const user = result.rows[0];

    const token = jwt.sign({ sub: user.email, role: user.role, userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

    return res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    console.error('[auth] register error:', err.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ── POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email y password son requeridos' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Credenciales invalidas' });
    }

    const token = jwt.sign({ sub: user.email, role: user.role, userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

    return res.json({
      message: 'Login exitoso',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    console.error('[auth] login error:', err.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export default { register, login };
