# QuickBite — Arquitectura de Microservicios

Sistema de gestión de pedidos de comida rápida construido con **Node.js**, **Express**, **Docker** y desplegado en **Render**.

---

## 📁 Estructura del proyecto

```
quickbite/
├── docker-compose.yml          ← Orquestación local
├── auth-service/               ← Servicio 1: Autenticación JWT
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js
│       ├── controllers/authController.js
│       ├── middlewares/verifyToken.js
│       └── routes/authRoutes.js
├── products-service/           ← Servicio 2: Productos / Menú
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js
│       ├── controllers/productsController.js
│       ├── middlewares/verifyToken.js
│       └── routes/productsRoutes.js
├── orders-service/             ← Servicio 3: Pedidos
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js
│       ├── controllers/ordersController.js
│       ├── middlewares/verifyToken.js
│       └── routes/ordersRoutes.js
└── payments-service/           ← Servicio 4: Pagos
    ├── Dockerfile
    ├── package.json
    └── src/
        ├── index.js
        ├── controllers/paymentsController.js
        ├── middlewares/verifyToken.js
        └── routes/paymentsRoutes.js
```

---

## 🚀 Levantar localmente con Docker

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/quickbite.git
cd quickbite

# 2. Construir y levantar todos los servicios
docker-compose up --build

# 3. Verificar que todos corren
docker-compose ps
```

### Puertos locales

| Servicio          | Puerto |
|-------------------|--------|
| auth-service      | 3001   |
| products-service  | 3002   |
| orders-service    | 3003   |
| payments-service  | 3004   |

---

## 🔐 Variables de entorno

Cada servicio usa las siguientes variables (definidas en `docker-compose.yml` o en Render):

| Variable               | Descripción                          |
|------------------------|--------------------------------------|
| `PORT`                 | Puerto en que corre el servicio      |
| `JWT_SECRET`           | Clave secreta para firmar tokens JWT |
| `PRODUCTS_SERVICE_URL` | URL interna del servicio de productos|
| `PAYMENTS_SERVICE_URL` | URL interna del servicio de pagos    |
| `ORDERS_SERVICE_URL`   | URL interna del servicio de pedidos  |

---

## ☁️ Despliegue en Render

1. Subir cada carpeta de servicio a un repositorio GitHub (o usar monorepo).
2. En [render.com](https://render.com) → **New Web Service** → conectar repositorio.
3. Configurar:
   - **Build Command:** `npm install`
   - **Start Command:** `node src/index.js`
   - **Environment Variables:** añadir `JWT_SECRET`, `PORT`, y URLs de los demás servicios.
4. Render genera una URL pública por servicio, por ejemplo:
   - `https://quickbite-auth.onrender.com`
   - `https://quickbite-orders.onrender.com`

---

## 📡 Endpoints principales

### Auth Service `POST /api/auth/register` · `POST /api/auth/login`
### Products Service `GET /api/products` · `POST /api/products` · `PUT /api/products/:id` · `DELETE /api/products/:id`
### Orders Service `POST /api/orders` · `GET /api/orders` · `GET /api/orders/:id` · `PATCH /api/orders/:id/status`
### Payments Service `POST /api/payments` · `GET /api/payments/:orderId` · `PATCH /api/payments/:id/status`

---

## 🛠️ Stack tecnológico

- **Node.js 18** — Runtime JavaScript
- **Express 4** — Framework HTTP y routing
- **JSON Web Tokens (JWT)** — Autenticación entre servicios
- **Docker + Docker Compose** — Contenedores y orquestación local
- **Render** — Plataforma de despliegue cloud con CI/CD

---

*QuickBite — Trabajo Final · Arquitectura de Microservicios*
