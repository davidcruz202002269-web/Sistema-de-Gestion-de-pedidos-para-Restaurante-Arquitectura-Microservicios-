import pool from '../config/db.js';

const VALID_STATUSES = ['pending', 'process', 'delivered'];

// ── POST /api/orders
const create = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Se requiere un arreglo de items no vacio' });
    }

    for (const item of items) {
      if (!item.productId || !item.name || !item.qty || !item.price) {
        return res.status(400).json({ error: 'Cada item debe tener productId, name, qty y price' });
      }
    }

    const total = Number(items.reduce((sum, i) => sum + i.price * i.qty, 0).toFixed(2));

    // Generar order_id secuencial
    const countResult = await pool.query('SELECT COUNT(*)::int AS c FROM orders');
    const orderId = `ORD-${String(countResult.rows[0].c + 1).padStart(3, '0')}`;
    const clientName = req.user.sub.split('@')[0];

    // Insertar orden
    const orderResult = await pool.query(
      'INSERT INTO orders (order_id, client_id, client_name, total, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [orderId, req.user.userId, clientName, total, 'pending']
    );
    const order = orderResult.rows[0];

    // Insertar items
    for (const item of items) {
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, name, qty, price) VALUES ($1, $2, $3, $4, $5)',
        [order.id, item.productId, item.name, item.qty, item.price]
      );
    }

    // Retornar orden con items
    const itemsResult = await pool.query('SELECT product_id, name, qty, price FROM order_items WHERE order_id = $1', [order.id]);

    return res.status(201).json({
      message: 'Pedido creado exitosamente',
      order: { ...order, items: itemsResult.rows },
    });
  } catch (err) {
    console.error('[orders] create error:', err.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ── GET /api/orders
const getAll = async (req, res) => {
  try {
    let ordersResult;
    if (req.user.role === 'admin') {
      ordersResult = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    } else {
      ordersResult = await pool.query('SELECT * FROM orders WHERE client_id = $1 ORDER BY created_at DESC', [req.user.userId]);
    }

    // Cargar items para cada orden
    const orders = [];
    for (const order of ordersResult.rows) {
      const itemsResult = await pool.query('SELECT product_id, name, qty, price FROM order_items WHERE order_id = $1', [order.id]);
      orders.push({ ...order, items: itemsResult.rows });
    }

    return res.json({ total: orders.length, orders });
  } catch (err) {
    console.error('[orders] getAll error:', err.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ── GET /api/orders/:id
const getById = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders WHERE order_id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pedido no encontrado' });

    const order = result.rows[0];

    if (req.user.role !== 'admin' && order.client_id !== req.user.userId) {
      return res.status(403).json({ error: 'No autorizado para ver este pedido' });
    }

    const itemsResult = await pool.query('SELECT product_id, name, qty, price FROM order_items WHERE order_id = $1', [order.id]);

    return res.json({ order: { ...order, items: itemsResult.rows } });
  } catch (err) {
    console.error('[orders] getById error:', err.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ── PATCH /api/orders/:id/status
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Estado invalido. Valores permitidos: ${VALID_STATUSES.join(', ')}` });
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE order_id = $2 RETURNING *',
      [status, req.params.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Pedido no encontrado' });

    return res.json({ message: 'Estado del pedido actualizado', order: result.rows[0] });
  } catch (err) {
    console.error('[orders] updateStatus error:', err.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export default { create, getAll, getById, updateStatus };
