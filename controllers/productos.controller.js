const Producto = require('../models/Producto');
const Retiro = require('../models/Retiro');
const Ingreso = require('../models/Ingreso');

// ==========================
// CONFIGURACIÓN GENERAL
// ==========================

const categorias = [
  'Congelados',
  'Envasados',
  'Heladera',
  'Insumos' // 👈 NUEVA CATEGORÍA
];

const productosDisponibles = [

  // ==========================
  // ENVASADOS / PANADERÍA
  // ==========================
  'Alfajor chocolate',
  'Alfajorcitos de maicena',
  'Arabe',
  'Bagel',
  'Baguette Rústica',
  'Bizcocho de grasa',
  'Bollito salvado',
  'Budín chips chocolate',
  'Budín frutos secos',
  'Budín marmolado',
  'Budín vainilla',
  'Budín vainilla c/ dulce de leche',
  'Ciabatta',
  'Cookies',
  'Figaza',
  'Figazas',
  'Focaccia',
  'Hamburguesa blanca',
  'Hamburguesa brioche',
  'Hamburguesa de papa',
  'Pan andino',
  'Pan de molde blanco',
  'Pan de molde centeno',
  'Pan de molde multicereal',
  'Palmeritas paquete',
  'Pancho chico',
  'Pancho grande',
  'Pasta frola',
  'Pebete',
  'Pepas',
  'Pizzeta tomate',
  'Prepizza cebolla',
  'Prepizza tomate',
  'Pan rallado',
  'Pan saborizado jamón',
  'Pan saborizado queso',
  'Sandwich J&Q x 12',
  'Sandwich J&Q x 6 blanco',
  'Sandwich J&Q x 6 salvado',
  'Sandwich surtidos x 12',
  'Slider brioche',

  // ==========================
  // TORTAS / PASTELERÍA
  // ==========================
  'Tarta bombón',
  'Tarta coco',
  'Tarta lemon pie',
  'Tarta manzana',
  'Torta húmeda de chocolate',
  'Torta matera de chocolate',
  'Torta matera de limón',

  // ==========================
  // PANADERÍA FRESCA
  // ==========================
  'Chipá (bolsas)',
  'Chipá sin TAAC',
  'Cremona',
  'Croissant (bolsas)',
  'Flauta / Milonga',
  'Galleta de grasa',
  'Medialuna de manteca (bolsa)',
  'Medialuna de grasa (bolsa)',
  'vigilante manteca',
  'Mignon',
  'Palmeritas',
  'Pan de campo (unidades)',
  'Pan de chocolate',
  'Facturas surtidas',

  // ==========================
  // CAFETERÍA / INSUMOS
  // ==========================
  'Azúcar en sobres',
  'Café La Esmeralda',
  'Edulcorante en sobres',
  'Te negro',
  'Te verde',
  'Te variedades',
  'Cacao',
  'Coca cola',
  'Coca cola zero',
  'Sprite',
  'Sprite zero',
  'Agua sin gas',
  'Agua con gas',

  // ==========================
  // SIN TACC
  // ==========================
  'Alfajor de maicena sin TACC',
  'Brownie sin TACC',
  'Cuadradito de limón sin TACC',

  // ==========================
  // INSUMOS GENERALES
  // ==========================
  'Azúcar impalpable',
  'Azúcar negra',
  'Azúcar común',
  'Baño de chocolate',
  'Carat Supercream',
  'Cremy pastelera',
  'Dulce de leche x 10 kg',
  'Dulce de membrillo x 5 kg',
  'Huevos',
  'Leche larga vida',

  // ==========================
  // FIAMBRES / VERDULERÍA
  // ==========================
  'Jamón cocido',
  'Jamón crudo',
  'Queso en fetas',
  'Tomate',
  'Rúcula',

  // ==========================
  // BEBIDAS KANAWA
  // ==========================
  'Kanawa frutal',
  'Kanawa limonada',
  'Kanawa maracuyá',
  'Kanawa naranja',
  'Kanawa pomelada',
  'Kanawa pomelo',
  'Kanawa remolacha',
  'Kanawa verde'
];

// ==========================
// HELPERS FECHA
// ==========================

function parseFecha(fecha) {
  if (!fecha) return null;

  if (fecha instanceof Date) {
    return new Date(
      fecha.getFullYear(),
      fecha.getMonth(),
      fecha.getDate()
    );
  }

  const partes = fecha.split('-');
  if (partes.length !== 3) return null;

  const [anio, mes, dia] = partes.map(Number);
  if (!anio || !mes || !dia) return null;

  return new Date(anio, mes - 1, dia);
}

function esFechaCorta(fechaElaboracion, fechaIngreso) {
  const fElab = parseFecha(fechaElaboracion);
  const fIng = parseFecha(fechaIngreso);

  if (!fElab || !fIng) return false;

  const diffMs = fIng.getTime() - fElab.getTime();
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return diffDias >= 5;
}

module.exports = {

  // ==========================
  // BUSCAR POR CÓDIGO DE BARRAS
  // ==========================
  buscarPorCodigoBarra: async (req, res) => {
    try {
      const { codigo } = req.params;
      const producto = await Producto.obtenerPorCodigoBarra(codigo);

      if (!producto) {
        return res.json({ existe: false });
      }

      res.json({ existe: true, producto });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al buscar producto' });
    }
  },

  // ==========================
  // LISTADO PRINCIPAL
  // ==========================
  mostrarListado: async (req, res) => {
    const q = req.query.q?.trim();

    let productos = q
      ? await Producto.obtenerAgrupadosFiltrados(q)
      : await Producto.obtenerAgrupadosPorNombre();

    productos = productos.map(p => ({
      ...p,
      diasAVencer: p.dias_vencer ?? null,
      stock_minimo: p.stock_minimo
    }));

    res.render('listado', {
      productos,
      busqueda: q || ''
    });
  },

  // ==========================
  // FORMULARIO NUEVO
  // ==========================
  mostrarFormulario: (req, res) => {
    res.render('nuevo', {
      categorias,
      productos: productosDisponibles
    });
  },

  // ==========================
  // CREAR PRODUCTO
  // ==========================
  crearProducto: async (req, res) => {
    try {
      const {
        codigo_barra,
        nombre,
        categoria,
        cantidad,
        unidad,
        fecha_elaboracion,
        fecha_ingreso,
        vencimiento,
        numero_remito
      } = req.body;

      const esCongelado = categoria === 'Congelados';
      const esInsumo = categoria === 'Insumos';

      // 🔴 VALIDACIONES
      if (
        !nombre ||
        !categoria ||
        !cantidad ||
        !unidad ||
        !fecha_ingreso ||
        !numero_remito ||
        (
          !esCongelado &&
          !esInsumo &&
          (!fecha_elaboracion || !vencimiento)
        )
      ) {
        return res.status(400).send('Campos obligatorios incompletos');
      }

      const stockInicial = Number(cantidad);
      if (isNaN(stockInicial) || stockInicial <= 0) {
        return res.status(400).send('Cantidad inválida');
      }

      const productoId = await Producto.crear({
        codigo_barra: codigo_barra || null,
        nombre,
        categoria,
        stock_actual: stockInicial,
        unidad_medida: unidad,
        fecha_elaboracion: esInsumo || esCongelado ? null : fecha_elaboracion,
        fecha_ingreso,
        vencimiento: esCongelado ? null : (vencimiento || null),
        numero_remito,
        stock_minimo: 5
      });

      await Ingreso.crear({
        producto_id: productoId,
        cantidad: stockInicial,
        unidad_medida: unidad,
        fecha: fecha_ingreso
      });

      res.redirect('/');
    } catch (error) {
      console.error('Error en crearProducto:', error);
      res.status(500).send('Error al crear producto');
    }
  },

  // ==========================
  // DETALLE
  // ==========================
  mostrarDetalle: async (req, res) => {
    try {
      const nombre = req.params.nombre;
      const lotes = await Producto.obtenerPorNombre(nombre);

      if (!lotes || lotes.length === 0) {
        return res.status(404).send('Producto no encontrado');
      }

      const hoy = new Date();
      const hoySinHora = new Date(
        hoy.getFullYear(),
        hoy.getMonth(),
        hoy.getDate()
      );

      const lotesProcesados = lotes.map(lote => {

        if (lote.categoria === 'Congelados' || lote.categoria === 'Insumos') {
          return {
            ...lote,
            diasRestantes: null,
            fechaCorta: false
          };
        }

        const venc = parseFecha(lote.vencimiento);
        let diasRestantes = null;

        if (venc) {
          const diffMs = venc.getTime() - hoySinHora.getTime();
          diasRestantes = Math.max(
            0,
            Math.ceil(diffMs / (1000 * 60 * 60 * 24))
          );
        }

        return {
          ...lote,
          diasRestantes,
          fechaCorta: esFechaCorta(
            lote.fecha_elaboracion,
            lote.fecha_ingreso
          )
        };
      });

      res.render('detalle', {
        nombre,
        lotes: lotesProcesados,
        stock_minimo: lotes[0].stock_minimo
      });
    } catch (error) {
      console.error('Error en mostrarDetalle:', error);
      res.status(500).send('Error al mostrar detalle');
    }
  },

  // ==========================
  // ACTUALIZAR STOCK MÍNIMO
  // ==========================

actualizarStockMinimo: async (req, res) => {
  try {
    const { nombre } = req.params;
    const { stock_minimo } = req.body;

    const nuevoMinimo = Number(stock_minimo);
    if (isNaN(nuevoMinimo) || nuevoMinimo < 0) {
      return res.status(400).send('Stock mínimo inválido');
    }

    await Producto.actualizarStockMinimoPorNombre(nombre, nuevoMinimo);

    // ✅ AHORA USA SU PROPIO PARAM
    res.redirect(`/productos/${nombre}?limite=ok`);

  } catch (error) {
    console.error('Error al actualizar stock mínimo:', error);
    res.status(500).send('Error al actualizar stock mínimo');
  }
},

  // ==========================
// RETIRAR STOCK
// ==========================
retirarStock: async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidadRetirar, motivoRetiro, comentario } = req.body;

    const retirar = Number(cantidadRetirar);
    if (isNaN(retirar) || retirar <= 0) {
      return res.status(400).send('Cantidad inválida');
    }

    if (!motivoRetiro) {
      return res.status(400).send('Debe indicar el motivo del retiro');
    }

    const lote = await Producto.obtenerPorId(id);
    if (!lote) {
      return res.status(404).send('Lote no encontrado');
    }

    if (retirar > lote.stock_actual) {
      return res.status(400).send('No hay suficiente stock');
    }

    await Retiro.crear({
      producto_id: lote.id,
      cantidad: retirar,
      motivo: motivoRetiro,
      comentario: comentario || null
    });

    await Producto.descontarStock(id, retirar);

    // ✅ ESTE SIGUE IGUAL
    res.redirect(`/productos/${lote.nombre}?egreso=ok`);

  } catch (error) {
    console.error('Error en retirarStock:', error);
    res.status(500).send('Error al retirar stock');
  }
}
};