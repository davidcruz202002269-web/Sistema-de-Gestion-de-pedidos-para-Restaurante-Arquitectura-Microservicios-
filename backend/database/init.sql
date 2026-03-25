-- ============================================================
-- QuickBite — Esquema de base de datos
-- PostgreSQL ejecuta este archivo al crear la DB por primera vez
-- Solo crea las tablas, sin datos iniciales
-- ============================================================

-- Usuarios
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100)  NOT NULL,
  email      VARCHAR(150)  NOT NULL UNIQUE,
  password   VARCHAR(255)  NOT NULL,
  role       VARCHAR(20)   NOT NULL DEFAULT 'cliente' CHECK (role IN ('admin', 'cliente')),
  created_at TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- Productos
CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  emoji       VARCHAR(10)   DEFAULT '',
  category    VARCHAR(50)   NOT NULL,
  price       NUMERIC(8,2)  NOT NULL,
  description TEXT          DEFAULT '',
  available   BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- Pedidos
CREATE TABLE IF NOT EXISTS orders (
  id          SERIAL PRIMARY KEY,
  order_id    VARCHAR(20)   NOT NULL UNIQUE,
  client_id   INTEGER       NOT NULL REFERENCES users(id),
  client_name VARCHAR(100)  NOT NULL,
  total       NUMERIC(10,2) NOT NULL,
  status      VARCHAR(20)   NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'process', 'delivered')),
  created_at  TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP
);

-- Items de pedido
CREATE TABLE IF NOT EXISTS order_items (
  id         SERIAL PRIMARY KEY,
  order_id   INTEGER       NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER       NOT NULL,
  name       VARCHAR(100)  NOT NULL,
  qty        INTEGER       NOT NULL,
  price      NUMERIC(8,2)  NOT NULL
);

-- Pagos
CREATE TABLE IF NOT EXISTS payments (
  id         SERIAL PRIMARY KEY,
  payment_id VARCHAR(20)   NOT NULL UNIQUE,
  order_ref  VARCHAR(20)   NOT NULL UNIQUE,
  amount     NUMERIC(10,2) NOT NULL,
  method     VARCHAR(20)   NOT NULL CHECK (method IN ('efectivo', 'tarjeta', 'transferencia', 'crypto')),
  status     VARCHAR(20)   NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'process', 'paid')),
  client_id  INTEGER       NOT NULL REFERENCES users(id),
  created_at TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP
);
