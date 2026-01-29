const Producto = require('../models/Producto');
const Ingreso = require('../models/Ingreso');

// 👉 IMPORTAMOS la lógica correcta
const {
  identificarProductoPorCodigo
} = require('./productos.controller');

module.exports = {

  // ==========================
  // VISTA INGRESO RÁPIDO
  // ==========================
  mostrarIngresoRapido: (req, res) => {
    res.render('ingresoRapido');
  },

  // ==========================
  // CONFIRMAR LOTE ESCANEADO
  // ==========================
  confirmarLote: async (req, res) => {
    try {
      const {
        numero_remito,
        fecha_elaboracion,
        vencimiento,
        productos
      } = req.body;

      if (
        !numero_remito ||
        !fecha_elaboracion ||
        !vencimiento ||
        !Array.isArray(productos) ||
        productos.length === 0
      ) {
        return res.status(400).json({
          error: 'Datos incompletos'
        });
      }

      // Fecha de ingreso = hoy (sin hora)
      const hoy = new Date();
      const fecha_ingreso = new Date(
        hoy.getFullYear(),
        hoy.getMonth(),
        hoy.getDate()
      );

      const resultados = [];

      for (const item of productos) {
        const { codigo_barra, cantidad } = item;

        if (!codigo_barra || !cantidad || cantidad < 1) continue;

        // 👉 USAMOS la lógica del controller de productos
        const info = identificarProductoPorCodigo(codigo_barra);

        if (!info) {
          resultados.push({
            codigo_barra,
            error: 'Código no reconocido'
          });
          continue;
        }

        // Crear lote / producto
        const productoId = await Producto.crear({
          codigo_barra,
          nombre: info.nombre,
          categoria: info.categoria,
          stock_actual: cantidad,
          fecha_elaboracion,
          fecha_ingreso,
          vencimiento,
          numero_remito
        });

        // Registrar ingreso
        await Ingreso.crear({
          producto_id: productoId,
          cantidad,
          fecha: fecha_ingreso
        });

        resultados.push({
          codigo_barra,
          producto: info.nombre,
          cantidad,
          ok: true
        });
      }

      res.json({
        ok: true,
        resultados
      });

    } catch (error) {
      console.error('Error en confirmarLote:', error);
      res.status(500).json({
        error: 'Error al confirmar ingreso'
      });
    }
  }

};