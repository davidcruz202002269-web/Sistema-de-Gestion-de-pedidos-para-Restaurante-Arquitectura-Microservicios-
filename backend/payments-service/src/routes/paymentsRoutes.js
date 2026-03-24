import { Router } from 'express';
const router  = Router();

import { register, getByOrder, getAll, updateStatus } from '../controllers/paymentsController.js';
import { verifyToken, requireAdmin } from '../middlewares/verifyToken.js';

// Todas las rutas requieren autenticación
router.post('/',verifyToken,register);
router.get('/',verifyToken,getAll);
router.get('/order/:orderId',verifyToken,getByOrder);
router.patch('/:id/status', verifyToken, requireAdmin, updateStatus);

export default router;