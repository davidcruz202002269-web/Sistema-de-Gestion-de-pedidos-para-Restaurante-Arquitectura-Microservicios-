import pool from '../config/db.js';

// ── GET /api/products
const getAll = async (req, res) => {
  try {
    const { category, available } = req.query;
    let query = 'SELECT * FROM products';
    const params = [];
    const conditions = [];

    if (category) {
      params.push(category);
      conditions.push(`LOWER(category) = LOWER($${params.length})`);
    }
    if (available !== undefined) {
      params.push(available === 'true');
      conditions.push(`available = $${params.length}`);
    }

    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY id';

    const result = await pool.query(query, params);
    return res.json({ total: result.rows.length, products: result.rows });
  } catch (err) {
    console.error('[products] getAll error:', err.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ── GET /api/products/:id
const getById = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    return res.json({ product: result.rows[0] });
  } catch (err) {
    console.error('[products] getById error:', err.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ── POST /api/products
const create = async (req, res) => {
  try {
    const { name, emoji, category, price, description, available = true } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({ error: 'name, category y price son requeridos' });
    }

    const result = await pool.query(
      'INSERT INTO products (name, emoji, category, price, description, available) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, emoji || '', category, Number(price), description || '', available]
    );

    return res.status(201).json({ message: 'Producto creado', product: result.rows[0] });
  } catch (err) {
    console.error('[products] create error:', err.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ── PUT /api/products/:id
const update = async (req, res) => {
  try {
    const existing = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });

    const current = existing.rows[0];
    const { name, emoji, category, price, description, available } = req.body;

    const result = await pool.query(
      'UPDATE products SET name=$1, emoji=$2, category=$3, price=$4, description=$5, available=$6 WHERE id=$7 RETURNING *',
      [
        name ?? current.name,
        emoji ?? current.emoji,
        category ?? current.category,
        price !== undefined ? Number(price) : current.price,
        description ?? current.description,
        available !== undefined ? available : current.available,
        req.params.id,
      ]
    );

    return res.json({ message: 'Producto actualizado', product: result.rows[0] });
  } catch (err) {
    console.error('[products] update error:', err.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ── DELETE /api/products/:id
const remove = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    return res.json({ message: 'Producto eliminado', product: result.rows[0] });
  } catch (err) {
    console.error('[products] remove error:', err.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export default { getAll, getById, create, update, remove };
