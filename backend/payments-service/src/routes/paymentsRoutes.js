const express = require('express');
const router  = express.Router();

const { register, getByOrder, getAll, updateStatus } = require('../controllers/paymentsController');
const { verifyToken, requireAdmin }                  = require('../middlewares/verifyToken');

// Todas las rutas requieren autenticación
router.post('/',                    verifyToken,               register);
router.get('/',                     verifyToken,               getAll);
router.get('/order/:orderId',       verifyToken,               getByOrder);
router.patch('/:id/status',         verifyToken, requireAdmin, updateStatus);

module.exports = router;
