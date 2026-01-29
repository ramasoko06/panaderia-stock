const Producto = require('../models/Producto');
const Retiro = require('../models/Retiro');

// 👉 USAMOS LA MISMA LÓGICA QUE INGRESOS
const {
  identificarProductoPorCodigo
} = require('./productos.controller');

module.exports = {

  // ==========================
  // VISTA EGRESO RÁPIDO
  // ==========================
  mostrarEgresoRapido: (req, res) => {
    res.render('egresoRapido');
  },

  // ==========================
  // CONFIRMAR EGRESO ESCANEADO
  // ==========================
  confirmarEgresoRapido: async (req, res) => {
    try {
      const { motivo, items } = req.body;
  
      if (
        !motivo ||
        !items ||
        typeof items !== 'object' ||
        Object.keys(items).length === 0
      ) {
        return res.status(400).json({ error: 'Datos incompletos' });
      }
  
      const resultados = [];
  
      for (const codigo in items) {
        const item = items[codigo];
        const { producto_id, cantidad } = item;
  
        if (!producto_id || !cantidad || cantidad < 1) continue;
  
        let cantidadPendiente = cantidad;
  
        // FIFO por vencimiento
        const lotes = await Producto.obtenerPorNombre(item.nombre);
  
        for (const lote of lotes) {
          if (cantidadPendiente <= 0) break;
          if (lote.stock_actual <= 0) continue;
  
          const retirar = Math.min(
            lote.stock_actual,
            cantidadPendiente
          );
  
          await Retiro.crear({
            producto_id: lote.id,
            cantidad: retirar,
            motivo
          });
  
          await Producto.descontarStock(lote.id, retirar);
  
          cantidadPendiente -= retirar;
        }
  
        if (cantidadPendiente > 0) {
          resultados.push({
            codigo,
            producto: item.nombre,
            solicitado: cantidad,
            retirado: cantidad - cantidadPendiente,
            error: 'Stock insuficiente'
          });
        } else {
          resultados.push({
            codigo,
            producto: item.nombre,
            cantidad,
            ok: true
          });
        }
      }
  
      res.json({ ok: true, resultados });
  
    } catch (error) {
      console.error('Error en confirmarEgresoRapido:', error);
      res.status(500).json({ error: 'Error al confirmar egreso' });
    }
  }

};