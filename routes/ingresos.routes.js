const express = require('express');
const router = express.Router();
const controller = require('../controllers/ingresos.controller');

// ==========================
// INGRESO RÁPIDO (VISTA)
// ==========================
router.get('/ingreso-rapido', controller.mostrarIngresoRapido);

// ==========================
// CONFIRMAR LOTE ESCANEADO
// ==========================
router.post('/confirmar-lote', controller.confirmarLote);

module.exports = router;