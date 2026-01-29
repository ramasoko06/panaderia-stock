const express = require('express');
const router = express.Router();
const controller = require('../controllers/productos.controller');

// ==========================
// LISTADO
// ==========================
router.get('/', controller.mostrarListado);

// ==========================
// FORMULARIO NUEVO PRODUCTO
// ==========================
router.get('/nuevo', controller.mostrarFormulario);
router.post('/nuevo', controller.crearProducto);

// ==========================
// BUSCAR POR CÓDIGO DE BARRAS (SCANNER)
// 🔥 IMPORTANTE: va ANTES del /:nombre
// ==========================
router.get('/codigo/:codigo', controller.buscarPorCodigoBarra);

// ==========================
// ACTUALIZAR STOCK MÍNIMO  👈 NUEVA RUTA
// 🔥 TIENE que ir ANTES del /:nombre
// ==========================
router.post('/:nombre/limite', controller.actualizarStockMinimo);

// ==========================
// RETIRAR STOCK
// ==========================
router.post('/retirar/:id', controller.retirarStock);

// ==========================
// DETALLE (SIEMPRE AL FINAL)
// ==========================
router.get('/:nombre', controller.mostrarDetalle);

module.exports = router;