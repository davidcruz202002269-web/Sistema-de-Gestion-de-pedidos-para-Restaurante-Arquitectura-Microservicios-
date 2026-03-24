import { Router } from 'express';
const router = Router();

import { create, getAll, getById, updateStatus } from '../controllers/ordersController.jsverifyToken.js';
import { verifyToken, requireAdmin } from '../middlewares/verifyToken.js';

// Todas las rutas requieren autenticación
router.post('/', verifyToken, create);
router.get('/', verifyToken, getAll);
router.get('/:id', verifyToken, getById);
router.patch('/:id/status', verifyToken, requireAdmin, updateStatus);

export default router;
