import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Microservicios registrados
const services = [
  { name: 'auth-service',     path: '/api/auth',     target: process.env.AUTH_SERVICE_URL     || 'http://localhost:3001' },
  { name: 'products-service', path: '/api/products', target: process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3002' },
  { name: 'orders-service',   path: '/api/orders',   target: process.env.ORDERS_SERVICE_URL   || 'http://localhost:3003' },
  { name: 'payments-service', path: '/api/payments', target: process.env.PAYMENTS_SERVICE_URL || 'http://localhost:3004' },
];

// ── Logging estructurado
morgan.token('body', (req) => {
  if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT') {
    return JSON.stringify(req.body || {});
  }
  return '';
});

app.use(cors());
app.use(morgan(':date[iso] :method :url :status :response-time ms :body'));

// ── Health check del gateway
app.get('/health', (_req, res) => {
  res.json({ service: 'api-gateway', status: 'OK', timestamp: new Date() });
});

// ── Health check agregado: consulta todos los servicios
app.get('/health/all', async (_req, res) => {
  const results = { gateway: 'OK', services: {}, timestamp: new Date() };

  const checks = services.map(async ({ name, target }) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const response = await fetch(`${target}/health`, { signal: controller.signal });
      clearTimeout(timeout);
      const data = await response.json();
      results.services[name] = { status: 'OK', response: data };
    } catch (err) {
      results.services[name] = { status: 'DOWN', error: err.message };
    }
  });

  await Promise.all(checks);

  const allUp = Object.values(results.services).every(s => s.status === 'OK');
  res.status(allUp ? 200 : 503).json(results);
});

// ── Proxy a los microservicios con manejo de errores
for (const { name, path, target } of services) {
  app.use(
    path,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: (reqPath) => path + reqPath,

      on: {
        // Cuando el servicio esta caido o no responde
        error: (err, req, res) => {
          console.error(`[gateway] ${name} no disponible: ${err.message}`);
          res.status(503).json({
            error: `El servicio ${name} no esta disponible en este momento`,
            service: name,
            detail: err.code === 'ECONNREFUSED'
              ? 'El servicio no esta corriendo o no es alcanzable'
              : err.message,
          });
        },

        // Log de cada request proxied exitosamente
        proxyRes: (proxyRes, req) => {
          console.log(`[gateway] ${req.method} ${req.originalUrl} -> ${name} [${proxyRes.statusCode}]`);
        },
      },
    })
  );
}

// ── 404 para rutas no mapeadas
app.use((_req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada en el gateway',
    available_routes: services.map(s => s.path),
  });
});

// ── Manejo de errores global
app.use((err, _req, res, _next) => {
  console.error('[gateway] Error interno:', err.message);
  res.status(502).json({ error: 'Error interno del gateway' });
});

app.listen(PORT, () => {
  console.log(`API Gateway corriendo en el puerto ${PORT}`);
  console.log('Servicios registrados:');
  for (const { name, path, target } of services) {
    console.log(`  ${name}: ${path} -> ${target}`);
  }
});
