// app.js
require('dotenv').config();
const express = require('express');
const path = require('path'); // 👈 NUEVO
const app = express();

// ==========================
// CONFIGURACIÓN
// ==========================

// Motor de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // 👈 NUEVO

// Para leer datos de formularios
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // necesario para fetch (ingreso / egreso rápido)

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public'))); // 👈 más robusto

// ==========================
// RUTAS
// ==========================
const productosRoutes = require('./routes/productos.routes');
const movimientosRoutes = require('./routes/movimientos.routes');
const ingresosRoutes = require('./routes/ingresos.routes');
const egresosRoutes = require('./routes/egresos.routes');

// 👉 Productos
app.use('/productos', productosRoutes);

// 👉 Movimientos
app.use('/movimientos', movimientosRoutes);

// 👉 Ingresos (ingreso rápido)
app.use('/ingresos', ingresosRoutes);

// 👉 Egresos (egreso rápido)
app.use('/egresos', egresosRoutes);

// Redirigir raíz al listado de productos
app.get('/', (req, res) => {
  res.redirect('/productos');
});

// ==========================
// MIDDLEWARES
// ==========================

// 404 (SIEMPRE AL FINAL)
app.use((req, res) => {
  res.status(404).send('Página no encontrada');
});

// Errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Ocurrió un error en el servidor');
});

// ==========================
// SERVIDOR
// ==========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});