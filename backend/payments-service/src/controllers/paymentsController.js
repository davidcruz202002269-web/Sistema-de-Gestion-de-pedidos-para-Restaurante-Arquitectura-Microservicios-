import pool from '../config/db.js';

const VALID_METHODS = ['efectivo', 'tarjeta', 'transferencia', 'crypto'];
const VALID_STATUSES = ['pending', 'process', 'paid'];

// ── POST /api/payments
const register = async (req, res) => {
  try {
    const { orderId, amount, method } = req.body;

    if (!orderId || !amount || !method) {
      return res.status(400).json({ error: 'orderId, amount y method son requeridos' });
    }

    if (!VALID_METHODS.includes(method.toLowerCase())) {
      return res.status(400).json({ error: `Metodo invalido. Valores permitidos: ${VALID_METHODS.join(', ')}` });
    }

    // Evitar duplicar pagos para el mismo pedido
    const existing = await pool.query('SELECT * FROM payments WHERE order_ref = $1', [orderId]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Ya existe un pago registrado para este pedido', payment: existing.rows[0] });
    }

    // Generar payment_id secuencial
    const countResult = await pool.query('SELECT COUNT(*)::int AS c FROM payments');
    const paymentId = `PAY-${String(countResult.rows[0].c + 1).padStart(3, '0')}`;

    const result = await pool.query(
      'INSERT INTO payments (payment_id, order_ref, amount, method, status, client_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [paymentId, orderId, Number(Number(amount).toFixed(2)), method.toLowerCase(), 'pending', req.user.userId]
    );

    return res.status(201).json({ message: 'Pago registrado exitosamente', payment: result.rows[0] });
  } catch (err) {
    console.error('[payments] register error:', err.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ── GET /api/payments/order/:orderId
const getByOrder = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM payments WHERE order_ref = $1', [req.params.orderId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pago no encontrado para este pedido' });

    const payment = result.rows[0];

    if (req.user.role !== 'admin' && payment.client_id !== req.user.userId) {
      return res.status(403).json({ error: 'No autorizado para ver este pago' });
    }

    return res.json({ payment });
  } catch (err) {
    console.error('[payments] getByOrder error:', err.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ── GET /api/payments
const getAll = async (req, res) => {
  try {
    let result;
    if (req.user.role === 'admin') {
      result = await pool.query('SELECT * FROM payments ORDER BY created_at DESC');
    } else {
      result = await pool.query('SELECT * FROM payments WHERE client_id = $1 ORDER BY created_at DESC', [req.user.userId]);
    }
    return res.json({ total: result.rows.length, payments: result.rows });
  } catch (err) {
    console.error('[payments] getAll error:', err.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ── PATCH /api/payments/:id/status
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Estado invalido. Valores permitidos: ${VALID_STATUSES.join(', ')}` });
    }

    const result = await pool.query(
      'UPDATE payments SET status = $1, updated_at = NOW() WHERE payment_id = $2 RETURNING *',
      [status, req.params.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Pago no encontrado' });

    return res.json({ message: 'Estado del pago actualizado', payment: result.rows[0] });
  } catch (err) {
    console.error('[payments] updateStatus error:', err.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export default { register, getByOrder, getAll, updateStatus };
