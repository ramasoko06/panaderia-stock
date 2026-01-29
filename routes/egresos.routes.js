const express = require('express');
const router = express.Router();

const egresosController = require('../controllers/egresos.controller');

// ==========================
// VISTA EGRESO RÁPIDO
// ==========================
router.get('/rapido', egresosController.mostrarEgresoRapido);

// ==========================
// CONFIRMAR EGRESO RÁPIDO
// ==========================
router.post('/confirmar', egresosController.confirmarEgresoRapido);

module.exports = router;