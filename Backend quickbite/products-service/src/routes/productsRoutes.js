const express = require('express');
const router  = express.Router();

const { getAll, getById, create, update, remove } = require('../controllers/productsController');
const { verifyToken, requireAdmin }               = require('../middlewares/verifyToken');

// Rutas públicas (solo lectura)
router.get('/',    getAll);
router.get('/:id', getById);

// Rutas protegidas — solo admin puede modificar
router.post('/',    verifyToken, requireAdmin, create);
router.put('/:id',  verifyToken, requireAdmin, update);
router.delete('/:id', verifyToken, requireAdmin, remove);

module.exports = router;
