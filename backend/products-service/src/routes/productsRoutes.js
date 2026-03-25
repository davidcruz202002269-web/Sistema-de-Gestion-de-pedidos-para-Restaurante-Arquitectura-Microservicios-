import { Router } from 'express';
import productsController from '../controllers/productsController.js';
import auth from '../middlewares/verifyToken.js';

const router = Router();

router.get('/', productsController.getAll);
router.get('/:id', productsController.getById);

router.post('/', auth.verifyToken, auth.requireAdmin, productsController.create);
router.put('/:id', auth.verifyToken, auth.requireAdmin, productsController.update);
router.delete('/:id', auth.verifyToken, auth.requireAdmin, productsController.remove);

export default router;
