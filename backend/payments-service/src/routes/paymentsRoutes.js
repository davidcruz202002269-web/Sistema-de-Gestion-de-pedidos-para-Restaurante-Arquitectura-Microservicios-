import { Router } from 'express';
import paymentsController from '../controllers/paymentsController.js';
import auth from '../middlewares/verifyToken.js';

const router = Router();

router.post('/', auth.verifyToken, paymentsController.register);
router.get('/', auth.verifyToken, paymentsController.getAll);
router.get('/order/:orderId', auth.verifyToken, paymentsController.getByOrder);
router.patch('/:id/status', auth.verifyToken, auth.requireAdmin, paymentsController.updateStatus);

export default router;
