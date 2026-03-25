import { Router } from 'express';
import ordersController from '../controllers/ordersController.js';
import auth from '../middlewares/verifyToken.js';

const router = Router();

router.post('/', auth.verifyToken, ordersController.create);
router.get('/', auth.verifyToken, ordersController.getAll);
router.get('/:id', auth.verifyToken, ordersController.getById);
router.patch('/:id/status', auth.verifyToken, auth.requireAdmin, ordersController.updateStatus);

export default router;
