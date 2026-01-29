const express = require('express');
const router = express.Router();

const controller = require('../controllers/movimientos.controller');

// ==========================
// HISTORIAL DE MOVIMIENTOS
// ==========================
router.get('/', controller.mostrarMovimientos);

module.exports = router;