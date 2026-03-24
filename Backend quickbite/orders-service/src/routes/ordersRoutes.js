const express = require('express');
const router  = express.Router();

const { create, getAll, getById, updateStatus } = require('../controllers/ordersController');
const { verifyToken, requireAdmin }             = require('../middlewares/verifyToken');

// Todas las rutas requieren autenticación
router.post('/',               verifyToken,              create);
router.get('/',                verifyToken,              getAll);
router.get('/:id',             verifyToken,              getById);
router.patch('/:id/status',    verifyToken, requireAdmin, updateStatus);

module.exports = router;
