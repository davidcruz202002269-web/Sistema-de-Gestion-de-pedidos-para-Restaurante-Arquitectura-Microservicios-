// Base de datos en memoria
let orders = [
  { id: 'ORD-001', clientId: 1, clientName: 'Ana García',     items: [{ productId: 1, name: 'Classic Burger', qty: 1, price: 8.99 }, { productId: 7, name: 'Papas Fritas L', qty: 1, price: 3.99 }], total: 12.98, status: 'delivered', createdAt: new Date('2024-01-15T12:34:00') },
  { id: 'ORD-002', clientId: 2, clientName: 'Carlos López',   items: [{ productId: 4, name: 'Hot Wings x6',   qty: 2, price: 7.50 }, { productId: 10, name: 'Refresco Grande', qty: 2, price: 2.50 }], total: 20.00, status: 'process',  createdAt: new Date('2024-01-15T13:10:00') },
  { id: 'ORD-003', clientId: 3, clientName: 'María Torres',   items: [{ productId: 5, name: 'Pizza Margherita', qty: 1, price: 12.00 }, { productId: 9, name: 'Sundae de Vainilla', qty: 2, price: 4.50 }], total: 21.00, status: 'pending',  createdAt: new Date('2024-01-15T13:45:00') },
  { id: 'ORD-004', clientId: 4, clientName: 'Luis Rodríguez', items: [{ productId: 2, name: 'BBQ Doble', qty: 2, price: 11.99 }, { productId: 7, name: 'Papas Fritas L', qty: 2, price: 3.99 }], total: 31.96, status: 'pending',  createdAt: new Date('2024-01-15T14:02:00') },
];

const VALID_STATUSES = ['pending', 'process', 'delivered'];

// ── POST /api/orders ──────────────────────────────────────────────────────────
const create = (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Se requiere un arreglo de items no vacío' });
  }

  for (const item of items) {
    if (!item.productId || !item.name || !item.qty || !item.price) {
      return res.status(400).json({ error: 'Cada item debe tener productId, name, qty y price' });
    }
  }

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const newOrder = {
    id:         `ORD-${String(orders.length + 1).padStart(3, '0')}`,
    clientId:   req.user.id,
    clientName: req.user.email.split('@')[0],
    items,
    total:      Number(total.toFixed(2)),
    status:     'pending',
    createdAt:  new Date(),
  };

  orders.push(newOrder);
  return res.status(201).json({ message: 'Pedido creado exitosamente', order: newOrder });
};

// ── GET /api/orders ───────────────────────────────────────────────────────────
const getAll = (req, res) => {
  const result = req.user.role === 'admin'
    ? orders
    : orders.filter(o => o.clientId === req.user.id);

  return res.json({ total: result.length, orders: result });
};

// ── GET /api/orders/:id ───────────────────────────────────────────────────────
const getById = (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

  // Clientes solo pueden ver sus propios pedidos
  if (req.user.role !== 'admin' && order.clientId !== req.user.id) {
    return res.status(403).json({ error: 'No autorizado para ver este pedido' });
  }

  return res.json({ order });
};

// ── PATCH /api/orders/:id/status ─────────────────────────────────────────────
const updateStatus = (req, res) => {
  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Estado inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}`,
    });
  }

  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

  order.status    = status;
  order.updatedAt = new Date();

  return res.json({ message: 'Estado del pedido actualizado', order });
};

module.exports = { create, getAll, getById, updateStatus };
