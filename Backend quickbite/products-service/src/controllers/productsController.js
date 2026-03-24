// Base de datos en memoria — en producción usar MongoDB/PostgreSQL
let products = [
  { id: 1, name: 'Classic Burger',     emoji: '🍔', category: 'Hamburguesas', price: 8.99,  description: 'Res angus, lechuga, tomate y queso cheddar', available: true },
  { id: 2, name: 'BBQ Doble',          emoji: '🍔', category: 'Hamburguesas', price: 11.99, description: 'Doble carne, tocino crujiente, salsa BBQ',     available: true },
  { id: 3, name: 'Crispy Chicken',     emoji: '🍗', category: 'Pollo',        price: 9.50,  description: 'Pechuga empanizada, coleslaw y pepinillos',    available: true },
  { id: 4, name: 'Hot Wings x6',       emoji: '🍗', category: 'Pollo',        price: 7.50,  description: 'Alitas picantes con dip de queso azul',        available: true },
  { id: 5, name: 'Pizza Margherita',   emoji: '🍕', category: 'Pizzas',       price: 12.00, description: 'Tomate, mozzarella fresca y albahaca',         available: true },
  { id: 6, name: 'Pepperoni Love',     emoji: '🍕', category: 'Pizzas',       price: 13.50, description: 'Doble pepperoni, queso manchego',             available: false },
  { id: 7, name: 'Papas Fritas L',     emoji: '🍟', category: 'Acompañantes', price: 3.99,  description: 'Crujientes, con sal marina y especias',        available: true },
  { id: 8, name: 'Tacos x3',          emoji: '🌮', category: 'Mexicana',     price: 8.00,  description: 'Carne asada, guacamole y pico de gallo',       available: true },
  { id: 9, name: 'Sundae de Vainilla', emoji: '🍦', category: 'Postres',      price: 4.50,  description: 'Helado suave con caramelo y nueces',           available: true },
  { id:10, name: 'Refresco Grande',    emoji: '🥤', category: 'Bebidas',      price: 2.50,  description: 'Elige tu sabor favorito, con hielo',           available: true },
];
let nextId = 11;

// ── GET /api/products ─────────────────────────────────────────────────────────
const getAll = (req, res) => {
  const { category, available } = req.query;
  let result = [...products];

  if (category) result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
  if (available !== undefined) result = result.filter(p => p.available === (available === 'true'));

  return res.json({ total: result.length, products: result });
};

// ── GET /api/products/:id ─────────────────────────────────────────────────────
const getById = (req, res) => {
  const product = products.find(p => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
  return res.json({ product });
};

// ── POST /api/products ────────────────────────────────────────────────────────
const create = (req, res) => {
  const { name, emoji, category, price, description, available = true } = req.body;

  if (!name || !category || price === undefined) {
    return res.status(400).json({ error: 'name, category y price son requeridos' });
  }

  const newProduct = { id: nextId++, name, emoji: emoji || '🍽️', category, price: Number(price), description: description || '', available };
  products.push(newProduct);

  return res.status(201).json({ message: 'Producto creado', product: newProduct });
};

// ── PUT /api/products/:id ─────────────────────────────────────────────────────
const update = (req, res) => {
  const idx = products.findIndex(p => p.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Producto no encontrado' });

  products[idx] = { ...products[idx], ...req.body, id: products[idx].id };
  return res.json({ message: 'Producto actualizado', product: products[idx] });
};

// ── DELETE /api/products/:id ──────────────────────────────────────────────────
const remove = (req, res) => {
  const idx = products.findIndex(p => p.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Producto no encontrado' });

  const [deleted] = products.splice(idx, 1);
  return res.json({ message: 'Producto eliminado', product: deleted });
};

module.exports = { getAll, getById, create, update, remove };
