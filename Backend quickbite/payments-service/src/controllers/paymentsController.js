// Base de datos en memoria
let payments = [];
let nextPayId = 1;

const VALID_METHODS  = ['efectivo', 'tarjeta', 'transferencia', 'crypto'];
const VALID_STATUSES = ['pending', 'process', 'paid'];

// ── POST /api/payments ────────────────────────────────────────────────────────
// Registrar un pago asociado a un pedido
const register = (req, res) => {
  const { orderId, amount, method } = req.body;

  if (!orderId || !amount || !method) {
    return res.status(400).json({ error: 'orderId, amount y method son requeridos' });
  }

  if (!VALID_METHODS.includes(method.toLowerCase())) {
    return res.status(400).json({
      error: `Método inválido. Valores permitidos: ${VALID_METHODS.join(', ')}`,
    });
  }

  // Evitar duplicar pagos para el mismo pedido
  const existing = payments.find(p => p.orderId === orderId);
  if (existing) {
    return res.status(409).json({
      error: 'Ya existe un pago registrado para este pedido',
      payment: existing,
    });
  }

  const newPayment = {
    id:        `PAY-${String(nextPayId++).padStart(3, '0')}`,
    orderId,
    amount:    Number(Number(amount).toFixed(2)),
    method:    method.toLowerCase(),
    status:    'pending',
    clientId:  req.user.id,
    createdAt: new Date(),
  };

  payments.push(newPayment);
  return res.status(201).json({ message: 'Pago registrado exitosamente', payment: newPayment });
};

// ── GET /api/payments/:orderId ────────────────────────────────────────────────
// Obtener el pago asociado a un pedido
const getByOrder = (req, res) => {
  const payment = payments.find(p => p.orderId === req.params.orderId);
  if (!payment) return res.status(404).json({ error: 'Pago no encontrado para este pedido' });

  if (req.user.role !== 'admin' && payment.clientId !== req.user.id) {
    return res.status(403).json({ error: 'No autorizado para ver este pago' });
  }

  return res.json({ payment });
};

// ── GET /api/payments ─────────────────────────────────────────────────────────
// Listar pagos (admin: todos | cliente: los suyos)
const getAll = (req, res) => {
  const result = req.user.role === 'admin'
    ? payments
    : payments.filter(p => p.clientId === req.user.id);

  return res.json({ total: result.length, payments: result });
};

// ── PATCH /api/payments/:id/status ───────────────────────────────────────────
// Actualizar estado del pago
const updateStatus = (req, res) => {
  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Estado inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}`,
    });
  }

  const payment = payments.find(p => p.id === req.params.id);
  if (!payment) return res.status(404).json({ error: 'Pago no encontrado' });

  payment.status    = status;
  payment.updatedAt = new Date();

  return res.json({ message: 'Estado del pago actualizado', payment });
};

module.exports = { register, getByOrder, getAll, updateStatus };
